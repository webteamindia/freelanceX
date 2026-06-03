import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";
import axios from "axios";
import { toast } from "react-toastify";
import { confirmOrderWithRetry } from "../utils/confirmOrder";
import { orderPaymentStatusRoute } from "../utils/constants";

const SuccessPage = () => {
  const router = useRouter();
  const rawId =
    router.query.orderID ?? router.query.payment_intent ?? router.query.token;
  const paypalOrderId = Array.isArray(rawId) ? rawId[0] : rawId;
  const [cookies] = useCookies();
  const [status, setStatus] = useState("confirming");

  useEffect(() => {
    if (!router.isReady || !paypalOrderId || !cookies.jwt) {
      return;
    }

    let cancelled = false;
    let redirectTimer;

    const pollUntilConfirmed = async (attempts = 8) => {
      for (let i = 0; i < attempts; i += 1) {
        if (cancelled) return false;
        try {
          const { data } = await axios.get(
            orderPaymentStatusRoute(paypalOrderId),
            { headers: { Authorization: `Bearer ${cookies.jwt}` } }
          );
          if (data?.isCompleted) {
            setStatus("confirmed");
            return true;
          }
        } catch {
          // ignore poll errors
        }
        await new Promise((r) => setTimeout(r, 1500));
      }
      return false;
    };

    const run = async () => {
      setStatus("confirming");
      const { ok } = await confirmOrderWithRetry(paypalOrderId, cookies.jwt);

      if (cancelled) return;

      if (ok) {
        setStatus("confirmed");
      } else {
        setStatus("waiting");
        const confirmed = await pollUntilConfirmed();
        if (cancelled) return;
        if (!confirmed) {
          toast.error(
            "Payment may still be processing. Check buyer orders in a minute or contact support."
          );
          setStatus("pending");
        } else {
          setStatus("confirmed");
        }
      }

      redirectTimer = setTimeout(() => {
        router.push("/buyer/orders");
      }, 2500);
    };

    run();

    return () => {
      cancelled = true;
      clearTimeout(redirectTimer);
    };
  }, [router.isReady, paypalOrderId, cookies.jwt, router]);

  const statusMessage = {
    confirming: "Confirming your payment with PayPal…",
    waiting: "Payment received — finishing confirmation…",
    confirmed:
      "Order confirmed. Funds are held until you approve delivery. Redirecting…",
    pending:
      "Still processing. You can check Buyer orders shortly. Redirecting…",
  };

  return (
    <div className="h-[80vh] flex items-center px-6 md:px-20 pt-20 flex-col text-center">
      <h1 className="text-2xl md:text-4xl">{statusMessage[status]}</h1>
      <p className="text-zinc-400 mt-4 max-w-lg">
        Please keep this page open for a few seconds. If you closed PayPal early,
        our system will still confirm via webhook when possible.
      </p>
      {status === "confirming" && (
        <div className="mt-8 h-8 w-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      )}
    </div>
  );
};

export default SuccessPage;
