import { PayPalButtons, PayPalScriptProvider } from "@paypal/react-paypal-js";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "";

/**
 * @param {{ orderId: string }} props PayPal checkout order id from our API (stored as paymentIntent in DB)
 */
export default function PayPalCheckout({ orderId }) {
  const router = useRouter();

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
            router.push(`/success?orderID=${encodeURIComponent(data.orderID)}`);
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
