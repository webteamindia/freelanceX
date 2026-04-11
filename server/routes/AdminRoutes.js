import { Router } from "express";
import { verifyToken } from "../middlewares/AuthMiddleware.js";
import { verifyAdmin } from "../middlewares/AdminMiddleware.js";
import {
  deleteGigAsAdmin,
  getAdminGigs,
  getAdminOverview,
  getAdminOrders,
  getAdminSupportTickets,
  getAdminUserDetails,
  getAdminUsers,
  resolveSupportTicket,
  updateOrderStatus,
  updateUserRole,
  updateUserStatus,
} from "../controllers/AdminController.js";

export const adminRoutes = Router();

adminRoutes.use(verifyToken, verifyAdmin);

adminRoutes.get("/overview", getAdminOverview);
adminRoutes.get("/users", getAdminUsers);
adminRoutes.get("/users/:userId", getAdminUserDetails);
adminRoutes.patch("/users/:userId/status", updateUserStatus);
adminRoutes.patch("/users/:userId/role", updateUserRole);
adminRoutes.get("/orders", getAdminOrders);
adminRoutes.patch("/orders/:orderId/status", updateOrderStatus);
adminRoutes.get("/gigs", getAdminGigs);
adminRoutes.delete("/gigs/:gigId", deleteGigAsAdmin);
adminRoutes.get("/tickets", getAdminSupportTickets);
adminRoutes.patch("/tickets/:ticketId/status", resolveSupportTicket);

