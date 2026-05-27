import prisma from "../prisma/client.js";
import { createPayPalPayout } from "../utils/paypal.js";
import { calculateOrderSplit } from "../utils/payments.js";

/**
 * Release seller earnings for a paid order (PayPal Payouts or dev simulation).
 * @param {object} order Order with gig.createdBy included
 */
export async function executeSellerPayout(order) {
  if (!order.isCompleted) {
    return { ok: false, error: "Payment has not been completed for this order yet." };
  }

  const payoutStatus = order.payoutStatus || "held";

  if (payoutStatus === "released") {
    return { ok: true, alreadyReleased: true, order };
  }

  if (payoutStatus !== "held" && payoutStatus !== "failed") {
    return {
      ok: false,
      error: `Cannot release payout while status is ${payoutStatus}.`,
    };
  }

  const sellerEmail = order.gig?.createdBy?.paypalEmail;
  if (!sellerEmail) {
    return { ok: false, error: "Seller has no PayPal email on file." };
  }

  let earnings = order.sellerEarningsAmount;
  if (earnings == null) {
    earnings = calculateOrderSplit(order.price).sellerEarnings;
  }

  const payoutAmount = Number(earnings).toFixed(2);
  if (Number(payoutAmount) <= 0) {
    return { ok: false, error: "Invalid payout amount." };
  }

  const simulatePayout =
    process.env.NODE_ENV !== "production" &&
    process.env.PAYPAL_SIMULATE_PAYOUTS === "true";

  let batchId = `simulated_${order.id}`;

  if (!simulatePayout) {
    const payout = await createPayPalPayout({
      receiverEmail: sellerEmail,
      amount: payoutAmount,
      note: `ffiver payout for order ${order.id}`,
      senderItemId: order.id,
    });

    if (!payout.ok) {
      await prisma.order.update({
        where: { id: order.id },
        data: { payoutStatus: "failed", payoutError: payout.error },
      });
      return { ok: false, error: payout.error || "Could not send payout to seller." };
    }
    batchId = payout.batchId;
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: {
      payoutStatus: "released",
      buyerApprovedAt: order.buyerApprovedAt || new Date(),
      paidOutAt: new Date(),
      payoutBatchId: batchId,
      payoutError: null,
    },
  });

  return { ok: true, order: updated, sellerEarnings: payoutAmount, batchId };
}

export async function loadOrderForPayout(orderId) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      gig: { include: { createdBy: true } },
      buyer: { select: { id: true, email: true, username: true } },
    },
  });
}
