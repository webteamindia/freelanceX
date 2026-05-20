import React, { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { CREATE_ORDER } from "../utils/constants";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import axios from "axios";
import { toast } from "react-toastify";

const PayPalCheckout = dynamic(() => import("../components/PayPalCheckout"), {
  ssr: false,
});

const CheckoutPage = () => {
  const [orderId, setOrderId] = useState("");
  const [cookies] = useCookies();
  const router = useRouter();
  const { gigId } = router.query;

  useEffect(() => {
    const createOrder = async () => {
      try {
        const { data } = await axios.post(
          CREATE_ORDER,
          { gigId },
          {
            headers: {
              Authorization: `Bearer ${cookies.jwt}`,
            },
          }
        );
        if (data?.orderId) {
          setOrderId(data.orderId);
          toast.success("Order ready — pay with PayPal");
        }
      } catch (err) {
        console.error(err);
        const msg =
          err.response?.data?.message ||
          err.response?.data ||
          "Error creating order";
        toast.error(typeof msg === "string" ? msg : "Error creating order");
      }
    };

    if (gigId && cookies.jwt) {
      createOrder();
    }
  }, [gigId, cookies.jwt]);

  return (
    <div className="min-h-[80vh] max-w-full mx-6 md:mx-20 flex flex-col gap-6 items-center py-10">
      <h1 className="text-3xl font-medium text-center">Complete your order</h1>
      <p className="text-zinc-400 text-center max-w-lg">
        You will be charged in USD via PayPal. After payment, your order appears under buyer orders.
      </p>
      {!cookies.jwt ? (
        <p className="text-zinc-400">Sign in to continue to checkout.</p>
      ) : !gigId ? (
        <p className="text-zinc-400">Missing gig. Go back and choose a gig to order.</p>
      ) : orderId ? (
        <PayPalCheckout orderId={orderId} />
      ) : (
        <p className="text-zinc-400">Preparing checkout…</p>
      )}
    </div>
  );
};

export default CheckoutPage;
