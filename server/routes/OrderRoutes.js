import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import {
  confirmOrder,
  createOrder,
  getBuyerOrders,
  getPaymentStatus,
  getSellerOrders,
  releasePayoutToSeller,
} from "../controllers/OrderController.js";
import { buyerRequestRefund } from "../controllers/RefundController.js";

export const orderRoutes = Router();

orderRoutes.post("/create", verifyToken, createOrder);
orderRoutes.get("/payment-status/:paymentIntent", verifyToken, getPaymentStatus);
orderRoutes.put("/success", verifyToken, confirmOrder);
orderRoutes.post("/:orderId/release-payout", verifyToken, releasePayoutToSeller);
orderRoutes.post("/:orderId/request-refund", verifyToken, buyerRequestRefund);
orderRoutes.get("/get-buyer-orders", verifyToken, getBuyerOrders);
orderRoutes.get("/get-seller-orders", verifyToken, getSellerOrders);
