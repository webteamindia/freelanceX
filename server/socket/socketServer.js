import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import prisma from "../prisma/client.js";
import { getCorsOrigins } from "../utils/validate-env.js";

let io = null;

export function getIO() {
  return io;
}

export function createSocketServer(httpServer) {
  const origins = getCorsOrigins();
  const corsOrigin = origins === true ? "*" : origins;

  io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    path: "/socket.io",
  });

  io.use(async (socket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.split(" ")[1];

      if (!token) return next(new Error("Authentication required"));

      jwt.verify(token, process.env.JWT_SECRET, (err, payload) => {
        if (err) return next(new Error("Invalid token"));
        socket.userId = payload?.userId;
        socket.userEmail = payload?.email;
        next();
      });
    } catch (e) {
      next(e);
    }
  });

  io.on("connection", (socket) => {
    socket.on("join:order", async ({ orderId }) => {
      if (!orderId || !socket.userId) return;

      const order = await prisma.order.findUnique({
        where: { id: orderId },
        include: { gig: { select: { userId: true } } },
      });

      if (!order) return;
      const isParticipant =
        order.buyerId === socket.userId ||
        order.gig?.userId === socket.userId;

      if (!isParticipant) return;

      socket.join(`order:${orderId}`);
    });

    socket.on("leave:order", ({ orderId }) => {
      if (orderId) socket.leave(`order:${orderId}`);
    });
  });

  console.log("[socket.io] Real-time messaging enabled");
  return io;
}

export function emitOrderMessage(orderId, message) {
  if (!io || !orderId || !message) return;
  io.to(`order:${orderId}`).emit("message:new", { message });
}
