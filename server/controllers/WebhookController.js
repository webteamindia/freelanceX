import { completeOrderFromPayPal } from "../services/orderPaymentService.js";

/**
 * Extract PayPal checkout order id from webhook payload.
 * @see https://developer.paypal.com/api/rest/webhooks/
 */
function extractPayPalOrderId(event) {
  const type = event?.event_type || "";
  const resource = event?.resource || {};

  const relatedOrderId =
    resource.supplementary_data?.related_ids?.order_id;
  if (relatedOrderId) return relatedOrderId;

  if (type.includes("CHECKOUT.ORDER") && resource.id) {
    return resource.id;
  }

  return null;
}

export const handlePayPalWebhook = async (req, res) => {
  try {
    const event = req.body;

    if (!event?.event_type) {
      return res.status(400).json({ message: "Invalid webhook payload" });
    }

    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (webhookId && process.env.NODE_ENV === "production") {
      const transmissionId = req.headers["paypal-transmission-id"];
      if (!transmissionId) {
        console.warn("[webhook] Missing PayPal transmission headers");
      }
    }

    const orderId = extractPayPalOrderId(event);

    if (!orderId) {
      return res.status(200).json({ received: true, handled: false });
    }

    const result = await completeOrderFromPayPal(orderId);

    return res.status(200).json({
      received: true,
      handled: result.ok,
      alreadyCompleted: result.alreadyCompleted || false,
      event_type: event.event_type,
    });
  } catch (err) {
    console.error("[webhook] PayPal handler error:", err);
    return res.status(500).json({ message: "Webhook processing failed" });
  }
};
