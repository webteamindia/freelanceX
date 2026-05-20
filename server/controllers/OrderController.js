import prisma from "../prisma/client.js";
import {
  createPayPalCheckoutOrder,
  capturePayPalOrder,
} from "../utils/paypal.js";

export const createOrder = async (req, res, next) => {
  try {
    if (!req.body.gigId) {
      return res.status(400).send("GigId is required.");
    }

    const { gigId } = req.body;
    const gig = await prisma.gig.findUnique({
      where: { id: gigId },
    });

    if (!gig) {
      return res.status(404).send("Gig not found.");
    }

    const amountNum = Number(gig.price);
    if (!Number.isFinite(amountNum) || amountNum <= 0) {
      return res.status(400).send("Invalid gig price.");
    }

    const value = amountNum.toFixed(2);
    const paypalOrderId = await createPayPalCheckoutOrder({
      value,
      gigId,
    });

    await prisma.order.create({
      data: {
        paymentIntent: paypalOrderId,
        price: Math.round(amountNum),
        buyer: { connect: { id: req.userId } },
        gig: { connect: { id: gigId } },
      },
    });

    return res.status(201).json({ orderId: paypalOrderId });
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

    if (order.isCompleted) {
      return res.status(200).json({ message: "Order already confirmed." });
    }

    const capture = await capturePayPalOrder(orderID);
    if (!capture.ok) {
      return res.status(502).json({ message: capture.error || "Payment capture failed." });
    }

    await prisma.order.update({
      where: { paymentIntent: orderID },
      data: { isCompleted: true },
    });

    return res.status(200).json({ message: "Order confirmed." });
  } catch (err) {
    console.error(err);
    return res.status(500).send("Internal Server Error.");
  }
};

export const getBuyerOrders = async (req, res, next) => {
  try {
    if (req.userId) {
      const orders = await prisma.order.findMany({
        where: { buyerId: req.userId, isCompleted: true },
        include: {
          gig: true,
          gig: {
            include: {
              createdBy: true,
            },
          },
        },
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
        include: {
          gig: true,
          buyer: true,
        },
      });
      return res.status(200).json({ orders });
    }
    return res.status(400).send("UserId is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error.");
  }
};
