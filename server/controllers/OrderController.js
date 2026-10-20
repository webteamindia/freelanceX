import prisma from "../prisma/client.js";
import {
  createPayPalCheckoutOrder,
  createSimulatedCheckoutOrder,
  isSimulateCheckoutEnabled,
} from "../utils/paypal.js";
import { calculateOrderSplit } from "../utils/payments.js";
import {
  executeSellerPayout,
  loadOrderForPayout,
} from "../services/payoutService.js";
import {
  completeOrderFromPayPal,
  getOrderPaymentStatus,
} from "../services/orderPaymentService.js";
import { assertUserEmailVerified } from "../services/emailVerificationService.js";

const orderInclude = {
  gig: {
    include: {
      createdBy: {
        select: {
          id: true,
          fullName: true,
          username: true,
          profileImage: true,
          paypalEmail: true,
        },
      },
    },
  },
  buyer: {
    select: {
      id: true,
      fullName: true,
      username: true,
      profileImage: true,
      email: true,
    },
  },
};

export const createOrder = async (req, res, next) => {
  try {
    const emailOk = await assertUserEmailVerified(req.userId);
    if (!emailOk) {
      return res.status(403).json({
        message: "Verify your email before placing orders.",
        code: "EMAIL_NOT_VERIFIED",
      });
    }

    if (!req.body.gigId) {
      return res.status(400).send("GigId is required.");
    }

    const { gigId } = req.body;
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        createdBy: {
          select: { id: true, paypalEmail: true },
        },
      },
    });

    if (!gig) {
      return res.status(404).send("Gig not found.");
    }

    if (gig.userId === req.userId) {
      return res.status(400).json({
        message: "You cannot purchase your own gig.",
        code: "SELF_PURCHASE",
      });
    }

    if (!gig.createdBy?.paypalEmail) {
      return res.status(400).json({
        message:
          "This seller has not connected a PayPal email for payouts. They must add one in account settings before you can order.",
        code: "SELLER_PAYOUT_NOT_CONFIGURED",
      });
    }

    const amountNum = Number(gig.price);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).send("Invalid gig price.");
    }

    const split = calculateOrderSplit(amountNum);
    const value = amountNum.toFixed(2);
    const simulate = isSimulateCheckoutEnabled();
    const paypalOrderId = simulate
      ? createSimulatedCheckoutOrder({ value, gigId })
      : await createPayPalCheckoutOrder({
          value,
          gigId,
        });

    await prisma.order.create({
      data: {
        paymentIntent: paypalOrderId,
        price: Math.round(amountNum),
        platformFeeAmount: split.platformFee,
        sellerEarningsAmount: split.sellerEarnings,
        payoutStatus: "held",
        buyer: { connect: { id: req.userId } },
        gig: { connect: { id: gigId } },
      },
    });

    return res.status(201).json({
      orderId: paypalOrderId,
      platformFee: split.platformFee,
      sellerEarnings: split.sellerEarnings,
      feePercent: split.feePercent,
      simulate,
    });
  } catch (err) {
    console.error(err);
    return res
      .status(500)
      .json({ message: err.message || "Internal Server Error." });
  }
};

export const confirmOrder = async (req, res, next) => {
  try {
    const orderID = req.body.orderID || req.body.paymentIntent;
    if (!orderID) {
      return res.status(400).send("orderID is required.");
    }

    const order = await prisma.order.findUnique({
      where: { paymentIntent: orderID },
    });

    if (!order) {
      return res.status(404).send("Order not found.");
    }

    if (order.buyerId !== req.userId) {
      return res.status(403).send("Forbidden.");
    }

    const result = await completeOrderFromPayPal(orderID);

    if (!result.ok) {
      return res
        .status(502)
        .json({ message: result.error || "Payment capture failed." });
    }

    return res.status(200).json({
      message: result.alreadyCompleted
        ? "Order already confirmed."
        : "Payment received. Funds are held until you approve delivery.",
      payoutStatus: result.payoutStatus || "held",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getPaymentStatus = async (req, res, next) => {
  try {
    const { paymentIntent } = req.params;
    if (!paymentIntent) {
      return res.status(400).json({ message: "paymentIntent is required" });
    }

    const order = await getOrderPaymentStatus(paymentIntent);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    if (order.buyerId !== req.userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return res.status(200).json({
      isCompleted: order.isCompleted,
      payoutStatus: order.payoutStatus,
      orderId: order.id,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error.");
  }
};

/**
 * Buyer approves delivery; platform sends seller earnings via PayPal Payouts.
 */
export const releasePayoutToSeller = async (req, res, next) => {
  try {
    const { orderId } = req.params;
    if (!orderId) {
      return res.status(400).json({ message: "orderId is required." });
    }

    const order = await loadOrderForPayout(orderId);

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    if (order.buyerId !== req.userId) {
      return res.status(403).json({ message: "Only the buyer can release payment." });
    }

    if (
      order.refundStatus === "requested" ||
      order.refundStatus === "approved" ||
      order.payoutStatus === "refunded"
    ) {
      return res.status(400).json({
        message: "Cannot release payment while a refund is in progress.",
      });
    }

    const result = await executeSellerPayout(order);

    if (!result.ok) {
      return res.status(502).json({
        message: result.error,
        payoutStatus: order.payoutStatus,
      });
    }

    const updated = await prisma.order.findUnique({
      where: { id: order.id },
      include: orderInclude,
    });

    return res.status(200).json({
      message: result.alreadyReleased
        ? "Payment was already released to the seller."
        : "Payment released to the seller's PayPal account.",
      order: updated,
      payoutStatus: "released",
      sellerEarnings: result.sellerEarnings,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: "Internal Server Error." });
  }
};

export const getBuyerOrders = async (req, res, next) => {
  try {
    if (req.userId) {
      const orders = await prisma.order.findMany({
        where: { buyerId: req.userId, isCompleted: true },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ orders });
    }
    return res.status(400).send("UserId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getSellerOrders = async (req, res, next) => {
  try {
    if (req.userId) {
      const orders = await prisma.order.findMany({
        where: {
          gig: {
            createdBy: {
              id: req.userId,
            },
          },
          isCompleted: true,
        },
        include: orderInclude,
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json({ orders });
    }
    return res.status(400).send("UserId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};
