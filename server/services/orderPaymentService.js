import prisma from "../prisma/client.js";
import {
  capturePayPalOrder,
  getPayPalOrder,
  extractCaptureDetails,
} from "../utils/paypal.js";
import { notifyOrderPaid } from "../utils/notifications.js";

/**
 * Mark order paid after PayPal capture (idempotent). Used by buyer confirm + webhooks.
 */
export async function completeOrderFromPayPal(paymentIntent) {
  const order = await prisma.order.findUnique({
    where: { paymentIntent },
    include: {
      buyer: { select: { email: true, fullName: true, username: true } },
      gig: {
        select: {
          title: true,
          createdBy: {
            select: { id: true, email: true, fullName: true, username: true },
          },
        },
      },
    },
  });

  if (!order) {
    return { ok: false, error: "Order not found", code: "NOT_FOUND" };
  }

  if (order.isCompleted) {
    return {
      ok: true,
      alreadyCompleted: true,
      order,
      payoutStatus: order.payoutStatus,
    };
  }

  const capture = await capturePayPalOrder(paymentIntent);
  if (!capture.ok) {
    const existing = await getPayPalOrder(paymentIntent);
    if (existing?.status !== "COMPLETED") {
      return { ok: false, error: capture.error || "Capture failed", code: "CAPTURE_FAILED" };
    }
  }

  const paypalOrder =
    capture.order || (await getPayPalOrder(paymentIntent)) || null;
  const captureDetails = extractCaptureDetails(paypalOrder);

  const updated = await prisma.order.update({
    where: { paymentIntent },
    data: {
      isCompleted: true,
      payoutStatus: order.payoutStatus === "released" ? "released" : "held",
      paypalCaptureId: captureDetails?.captureId || order.paypalCaptureId,
    },
    include: {
      buyer: { select: { email: true, fullName: true } },
      gig: {
        select: {
          title: true,
          createdBy: { select: { email: true, fullName: true } },
        },
      },
    },
  });

  await notifyOrderPaid(updated).catch((err) =>
    console.warn("[notifications] order paid email failed:", err.message)
  );

  return {
    ok: true,
    order: updated,
    payoutStatus: updated.payoutStatus,
  };
}

export async function getOrderPaymentStatus(paymentIntent) {
  const order = await prisma.order.findUnique({
    where: { paymentIntent },
    select: {
      id: true,
      isCompleted: true,
      payoutStatus: true,
      buyerId: true,
    },
  });
  if (!order) return null;
  return order;
}
