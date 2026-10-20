import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/router";
import { useState } from "react";
import { toast } from "react-toastify";

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

/**
 * @param {{ orderId: string, simulate?: boolean }} props
 *   orderId — PayPal checkout order id (or sim_checkout_* when simulate)
 *   simulate — from createOrder when PAYPAL_SIMULATE_CHECKOUT=true
 */
export default function PayPalCheckout({ orderId, simulate = false }) {
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);

  const goSuccess = (id) => {
    router.push(`/success?orderID=${encodeURIComponent(id)}`);
  };

  const handleSimulatePayment = () => {
    if (!orderId) {
      toast.error("Order not ready");
      return;
    }
    setSimulating(true);
    goSuccess(orderId);
  };

  if (simulate) {
    return (
      <div className="w-full max-w-md flex flex-col gap-4">
        <p className="text-amber-400/90 text-sm text-center">
          Simulated checkout is on — no PayPal API call. Confirm to mark the order paid.
        </p>
        <button
          type="button"
          disabled={simulating || !orderId}
          onClick={handleSimulatePayment}
          className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-hover text-white font-medium disabled:opacity-50 transition-colors"
        >
          {simulating ? "Confirming…" : "Simulate payment"}
        </button>
      </div>
    );
  }

  if (!clientId) {
    return (
      <p className="text-red-400 text-center max-w-md">
        PayPal is not configured. Set NEXT_PUBLIC_PAYPAL_CLIENT_ID in your environment.
      </p>
    );
  }

  return (
    <PayPalScriptProvider
      options={{
        clientId,
        currency: "USD",
        intent: "capture",
      }}
    >
      <div className="w-full max-w-md">
        <PayPalButtons
          style={{ layout: "vertical", shape: "rect", label: "pay" }}
          createOrder={async () => {
            if (!orderId) {
              throw new Error("Order not ready");
            }
            return orderId;
          }}
          onApprove={async (data) => {
            goSuccess(data.orderID);
          }}
          onError={(err) => {
            console.error(err);
            toast.error("PayPal could not process this payment. Try again.");
            router.push(`/payment-failed?orderID=${encodeURIComponent(orderId)}`);
          }}
          onCancel={() => {
            router.push(`/checkout-cancelled?orderID=${encodeURIComponent(orderId)}`);
          }}
        />
      </div>
    </PayPalScriptProvider>
  );
}
