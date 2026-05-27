import React, { useEffect } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import { toast } from "react-toastify";
import { confirmOrderWithRetry } from "../utils/confirmOrder";

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
      const { ok } = await confirmOrderWithRetry(paypalOrderId, cookies.jwt);
      if (!ok) {
        toast.error(
          "Payment received but we could not confirm your order. Check buyer orders or contact support."
        );
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
        Payment received. Funds are held until you approve delivery and release
        payment to the seller. Redirecting to your orders…
      </h1>
      <p className="text-zinc-400 mt-4">Please do not close this page.</p>
    </div>
  );
};

export default SuccessPage;
