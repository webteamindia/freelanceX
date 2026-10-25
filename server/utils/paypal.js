/**
 * PayPal REST v2 (OAuth + Orders). Uses PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET.
 * Set PAYPAL_MODE=live for production; defaults to sandbox.
 * Set PAYPAL_SIMULATE_CHECKOUT=true (non-production) to skip PayPal create/capture.
 */

const SIM_CHECKOUT_PREFIX = "sim_checkout_";

const getApiBase = () =>
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken = null;
let tokenExpiresAt = 0;

/** Local checkout without PayPal API (dev / smoke). Never enabled in production. */
export function isSimulateCheckoutEnabled() {
  return (
    process.env.NODE_ENV !== "production" &&
    process.env.PAYPAL_SIMULATE_CHECKOUT === "true"
  );
}

export function isSimulatedCheckoutOrderId(orderId) {
  return typeof orderId === "string" && orderId.startsWith(SIM_CHECKOUT_PREFIX);
}

/**
 * Create a local payment-intent id (no PayPal API).
 * @param {{ value: string, gigId: string }} opts
 */
export function createSimulatedCheckoutOrder({ value, gigId }) {
  const suffix = `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `${SIM_CHECKOUT_PREFIX}${gigId}_${value}_${suffix}`;
}

async function getAccessToken() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    throw new Error("Missing PAYPAL_CLIENT_ID or PAYPAL_CLIENT_SECRET");
  }

  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt - 60_000) {
    return cachedToken;
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch(`${getApiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error_description || data.error || "PayPal auth failed");
  }

  cachedToken = data.access_token;
  tokenExpiresAt = now + (data.expires_in || 300) * 1000;
  return cachedToken;
}

/**
 * @param {{ value: string, currencyCode?: string, gigId: string }} opts value e.g. "29.99"
 */
export async function createPayPalCheckoutOrder({ value, currencyCode = "USD", gigId }) {
  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: gigId,
          custom_id: gigId,
          amount: {
            currency_code: currencyCode,
            value,
          },
        },
      ],
      application_context: {
        brand_name: process.env.PAYPAL_BRAND_NAME || "ffiver",
        landing_page: "NO_PREFERENCE",
        user_action: "PAY_NOW",
      },
    }),
  });

  const data = await res.json();
  if (!res.ok) {
    const msg =
      data?.message ||
      data?.details?.map((d) => d.issue).join(", ") ||
      `PayPal create order failed (${res.status})`;
    throw new Error(msg);
  }

  return data.id;
}

export async function getPayPalOrder(orderId) {
  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}/v2/checkout/orders/${orderId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    return null;
  }
  return data;
}

/**
 * Captures an approved PayPal order. Idempotent if already captured (COMPLETED).
 * @returns {{ ok: boolean, error?: string }}
 */
export async function capturePayPalOrder(orderId) {
  const token = await getAccessToken();
  const res = await fetch(`${getApiBase()}/v2/checkout/orders/${orderId}/capture`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });

  const data = await res.json().catch(() => ({}));

  if (res.ok) {
    const capture = data.purchase_units?.[0]?.payments?.captures?.[0];
    if (capture?.status === "COMPLETED") {
      return { ok: true, order: data };
    }
    return { ok: false, error: "Capture did not complete" };
  }

  const existing = await getPayPalOrder(orderId);
  if (existing?.status === "COMPLETED") {
    return { ok: true, alreadyCaptured: true, order: existing };
  }

  const msg =
    data?.message ||
    data?.details?.map((d) => `${d.issue}: ${d.description}`).join("; ") ||
    `PayPal capture failed (${res.status})`;
  return { ok: false, error: msg };
}

/**
 * Send seller earnings via PayPal Payouts (platform balance → seller PayPal email).
 * Requires Payouts enabled on your PayPal business account.
 */
export async function createPayPalPayout({
  receiverEmail,
  amount,
  currencyCode = "USD",
  note,
  senderItemId,
}) {
  const token = await getAccessToken();
  const batchId = `ffiver_${senderItemId}_${Date.now()}`;

  const res = await fetch(`${getApiBase()}/v1/payments/payouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      sender_batch_header: {
        sender_batch_id: batchId,
        email_subject: "You received a payment from ffiver",
        email_message:
          note ||
          "Your buyer approved the order. Funds have been sent to your PayPal account.",
      },
      items: [
        {
          recipient_type: "EMAIL",
          amount: {
            currency_code: currencyCode,
            value: amount,
          },
          receiver: receiverEmail,
          note: note || "ffiver order payout",
          sender_item_id: String(senderItemId),
        },
      ],
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const msg =
      data?.message ||
      data?.details?.map((d) => d.issue || d.description).join("; ") ||
      `PayPal payout failed (${res.status})`;
    return { ok: false, error: msg };
  }

  return {
    ok: true,
    batchId: data.batch_header?.payout_batch_id || batchId,
  };
}

/**
 * Extract capture id and amount from a captured PayPal order payload.
 */
export function extractCaptureDetails(paypalOrderData) {
  const capture =
    paypalOrderData?.purchase_units?.[0]?.payments?.captures?.[0];
  if (!capture) return null;
  return {
    captureId: capture.id,
    amount: capture.amount?.value,
    currency: capture.amount?.currency_code,
    status: capture.status,
  };
}

/**
 * Refund a captured PayPal payment back to the buyer.
 * Simulated capture ids (sim_*) succeed without calling PayPal.
 */
export async function refundPayPalCapture({ captureId, note }) {
  if (!captureId) {
    return { ok: false, error: "No PayPal capture id is stored for this order." };
  }
  if (String(captureId).startsWith("sim_")) {
    return { ok: true, simulated: true };
  }

  const token = await getAccessToken();
  const res = await fetch(
    `${getApiBase()}/v2/payments/captures/${encodeURIComponent(captureId)}/refund`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        "PayPal-Request-Id": `refund_${captureId}`,
      },
      body: JSON.stringify({
        note_to_payer: (note || "Refund from ffiver").slice(0, 255),
      }),
    }
  );

  const data = await res.json().catch(() => ({}));
  if (res.ok || data.status === "COMPLETED") {
    return { ok: true, refundId: data.id || null, status: data.status || "COMPLETED" };
  }

  const already =
    data?.details?.some((d) =>
      String(d.issue || "").toUpperCase().includes("CAPTURE_FULLY_REFUNDED")
    ) || data?.name === "CAPTURE_FULLY_REFUNDED";
  if (already) {
    return { ok: true, refundId: data.id || null, alreadyRefunded: true };
  }

  const msg =
    data?.message ||
    data?.details?.map((d) => d.description || d.issue).join("; ") ||
    `PayPal refund failed (${res.status})`;
  return { ok: false, error: msg };
}

/**
 * Confirm a webhook was sent by PayPal.
 * @see https://developer.paypal.com/docs/api/webhooks/v1/#verify-webhook-signature
 */
export async function verifyPayPalWebhookSignature({ headers, event, webhookId }) {
  const token = await getAccessToken();
  const res = await fetch(
    `${getApiBase()}/v1/notifications/verify-webhook-signature`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        auth_algo: headers["paypal-auth-algo"],
        cert_url: headers["paypal-cert-url"],
        transmission_id: headers["paypal-transmission-id"],
        transmission_sig: headers["paypal-transmission-sig"],
        transmission_time: headers["paypal-transmission-time"],
        webhook_id: webhookId,
        webhook_event: event,
      }),
    }
  );
  const data = await res.json().catch(() => ({}));
  return res.ok && data.verification_status === "SUCCESS";
}
