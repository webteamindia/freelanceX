import prisma from "../prisma/client.js";
import { notifyRefundUpdate } from "../utils/notifications.js";
import {
  extractCaptureDetails,
  getPayPalOrder,
  isSimulatedCheckoutOrderId,
  refundPayPalCapture,
} from "../utils/paypal.js";

const TERMINAL_PAYOUT = new Set(["released", "cancelled", "refunded"]);

export async function requestOrderRefund(orderId, buyerId, reason) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { email: true, fullName: true } },
      gig: {
        include: {
          createdBy: { select: { id: true, email: true, fullName: true } },
        },
      },
    },
  });

  if (!order) return { ok: false, error: "Order not found." };
  if (order.buyerId !== buyerId) {
    return { ok: false, error: "Only the buyer can request a refund." };
  }
  if (!order.isCompleted) {
    return { ok: false, error: "Order is not paid yet." };
  }
  if (order.refundStatus === "requested") {
    return { ok: false, error: "Refund already requested." };
  }
  if (order.refundStatus === "approved" || order.refundStatus === "completed") {
    return { ok: false, error: "Order already refunded." };
  }
  if (TERMINAL_PAYOUT.has(order.payoutStatus)) {
    return {
      ok: false,
      error:
        "Payout was already sent to the seller. Contact support for a manual refund.",
    };
  }

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      refundStatus: "requested",
      refundReason: reason || "Buyer requested refund",
      refundRequestedAt: new Date(),
    },
  });

  return { ok: true, order: updated };
}

export async function processRefundAsAdmin(orderId, { action, note }) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      buyer: { select: { email: true } },
      gig: {
        include: {
          createdBy: { select: { email: true } },
        },
      },
    },
  });

  if (!order) return { ok: false, error: "Order not found." };
  if (order.refundStatus !== "requested") {
    return { ok: false, error: "No pending refund request for this order." };
  }

  if (action === "reject") {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: {
        refundStatus: "rejected",
        refundNote: note || "Refund request denied",
        refundProcessedAt: new Date(),
      },
    });

    await notifyRefundUpdate({
      to: order.buyer.email,
      subject: "Refund request update — ffiver",
      body: `Your refund request was not approved. ${note || ""}`.trim(),
    }).catch(() => {});

    return { ok: true, order: updated };
  }

  if (action !== "approve") {
    return { ok: false, error: "Invalid action. Use approve or reject." };
  }

  let captureId = order.paypalCaptureId;
  const simulated = isSimulatedCheckoutOrderId(order.paymentIntent);
  if (!captureId && order.paymentIntent && !simulated) {
    const paypalOrder = await getPayPalOrder(order.paymentIntent);
    captureId = extractCaptureDetails(paypalOrder)?.captureId || null;
  }
  if (!captureId && simulated) {
    captureId = `sim_capture_${order.id}`;
  }

  const refund = await refundPayPalCapture({
    captureId,
    note: note || "Refund approved",
  });
  if (!refund.ok) {
    return { ok: false, error: refund.error || "PayPal refund failed." };
  }

  const refundNote = [
    note || "Refund approved. The PayPal capture was refunded to the buyer.",
    refund.simulated ? "Simulated checkout — no PayPal money was moved." : "",
    refund.refundId ? `PayPal refund ${refund.refundId}` : "",
  ]
    .filter(Boolean)
    .join(" ");

  const updated = await prisma.order.update({
    where: { id: orderId },
    data: {
      refundStatus: "completed",
      payoutStatus: "refunded",
      paypalCaptureId: captureId || order.paypalCaptureId,
      paypalRefundId: refund.refundId || order.paypalRefundId || null,
      refundNote,
      refundProcessedAt: new Date(),
    },
  });

  await Promise.all([
    notifyRefundUpdate({
      to: order.buyer.email,
      subject: "Refund approved — ffiver",
      body: `Your refund for order ${orderId.slice(-8)} was approved. ${note || "The held payment will not be paid out to the seller."}`,
    }),
    notifyRefundUpdate({
      to: order.gig.createdBy.email,
      subject: "Order refunded — ffiver",
      body: `An order for your gig was refunded. ${note || ""}`.trim(),
    }),
  ]).catch(() => {});

  return { ok: true, order: updated };
}
