import prisma from "../prisma/client.js";
import { emitOrderMessage } from "../socket/socketServer.js";
import { notifyNewMessage } from "../utils/notifications.js";

async function assertOrderParticipant(orderId, userId) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { gig: { select: { userId: true } } },
  });
  if (!order) return null;
  if (order.buyerId !== userId && order.gig?.userId !== userId) return null;
  return order;
}

export const addMessage = async (req, res, next) => {
  try {
    if (!req.body.receiverId || !req.body.message || !req.params.orderId) {
      return res
        .status(400)
        .send("userId, receiverId, orderId and message is required.");
    }

    const order = await assertOrderParticipant(req.params.orderId, req.userId);
    if (!order) {
      return res.status(403).send("Forbidden.");
    }

    const message = await prisma.messages.create({
      data: {
        sender: { connect: { id: req.userId } },
        receiver: { connect: { id: req.body.receiverId } },
        order: { connect: { id: req.params.orderId } },
        text: req.body.message,
      },
      include: {
        sender: { select: { fullName: true, username: true, email: true } },
      },
    });

    emitOrderMessage(req.params.orderId, message);

    const receiver = await prisma.user.findUnique({
      where: { id: req.body.receiverId },
      select: { id: true, email: true, fullName: true, username: true },
    });

    if (receiver?.email) {
      const fromName =
        message.sender?.fullName ||
        message.sender?.username ||
        "Someone";
      await notifyNewMessage({
        receiverId: receiver.id,
        to: receiver.email,
        fromName,
        orderId: req.params.orderId,
        preview:
          req.body.message.length > 120
            ? `${req.body.message.slice(0, 120)}…`
            : req.body.message,
      }).catch((err) =>
        console.warn("[notifications] message email failed:", err.message)
      );
    }

    return res.status(201).json({ message });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getMessages = async (req, res, next) => {
  try {
    if (!req.params.orderId || !req.userId) {
      return res.status(400).send("Order id is required.");
    }

    const order = await assertOrderParticipant(req.params.orderId, req.userId);
    if (!order) {
      return res.status(403).send("Forbidden.");
    }

    const messages = await prisma.messages.findMany({
      where: { orderId: req.params.orderId },
      orderBy: { createdAt: "asc" },
    });

    await prisma.messages.updateMany({
      where: {
        orderId: req.params.orderId,
        receiverId: req.userId,
      },
      data: { isRead: true },
    });

    const fullOrder = await prisma.order.findUnique({
      where: { id: req.params.orderId },
      include: { gig: true },
    });

    let receiverId;
    if (fullOrder?.buyerId === req.userId) {
      receiverId = fullOrder.gig.userId;
    } else if (fullOrder?.gig.userId === req.userId) {
      receiverId = fullOrder.buyerId;
    }

    return res.status(200).json({ messages, receiverId });
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const getUnreadMessages = async (req, res, next) => {
  try {
    if (req.userId) {
      const messages = await prisma.messages.findMany({
        where: {
          receiverId: req.userId,
          isRead: false,
        },
        include: { sender: true },
      });
      return res.status(200).json({ messages });
    }
    return res.status(400).send("User id is required.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};

export const markAsRead = async (req, res, next) => {
  try {
    if (!req.userId || !req.params.messageId) {
      return res.status(400).send("User id and message Id is required.");
    }

    const msg = await prisma.messages.findUnique({
      where: { id: req.params.messageId },
    });

    if (!msg || msg.receiverId !== req.userId) {
      return res.status(403).send("Forbidden.");
    }

    await prisma.messages.update({
      where: { id: req.params.messageId },
      data: { isRead: true },
    });

    return res.status(200).send("Message mark as read.");
  } catch (err) {
    console.log(err);
    return res.status(500).send("Internal Server Error");
  }
};
