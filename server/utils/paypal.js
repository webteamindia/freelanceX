/**
 * PayPal REST v2 (OAuth + Orders). Uses PAYPAL_CLIENT_ID + PAYPAL_CLIENT_SECRET.
 * Set PAYPAL_MODE=live for production; defaults to sandbox.
 */

const getApiBase = () =>
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

let cachedToken = null;
let tokenExpiresAt = 0;

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
      return { ok: true };
    }
    return { ok: false, error: "Capture did not complete" };
  }

  const existing = await getPayPalOrder(orderId);
  if (existing?.status === "COMPLETED") {
    return { ok: true, alreadyCaptured: true };
  }

  const msg =
    data?.message ||
    data?.details?.map((d) => `${d.issue}: ${d.description}`).join("; ") ||
    `PayPal capture failed (${res.status})`;
  return { ok: false, error: msg };
}
