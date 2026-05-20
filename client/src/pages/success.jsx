import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { ORDER_SUCCESS } from "../utils/constants";
import axios from "axios";

const SuccessPage = () => {
  const router = useRouter();
  const rawId =
    router.query.orderID ?? router.query.payment_intent ?? router.query.token;
  const paypalOrderId = Array.isArray(rawId) ? rawId[0] : rawId;
  const [cookies] = useCookies();

  useEffect(() => {
    if (!router.isReady || !paypalOrderId || !cookies.jwt) {
      return;
    }

    const changeOrderStatus = async () => {
      try {
        await axios.put(
          ORDER_SUCCESS,
          { orderID: paypalOrderId },
          {
            headers: {
              Authorization: `Bearer ${cookies.jwt}`,
            },
          }
        );
      } catch (err) {
        console.error(err);
        toast.error("Something went wrong confirming your payment.");
      }
    };

    changeOrderStatus();

    const t = setTimeout(() => {
      router.push("/buyer/orders");
    }, 3000);

    return () => clearTimeout(t);
  }, [router.isReady, paypalOrderId, cookies.jwt, router]);

  return (
    <div className="h-[80vh] flex items-center px-6 md:px-20 pt-20 flex-col text-center">
      <h1 className="text-2xl md:text-4xl">
        Payment successful. You are being redirected to your orders.
      </h1>
      <p className="text-zinc-400 mt-4">Please do not close this page.</p>
    </div>
  );
};

export default SuccessPage;
