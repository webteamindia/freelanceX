import { Router } from "express";
import authRoutes from "./AuthRoutes.js";
import { dashboardRoutes } from "./DashboardRoutes.js";
import { gigRoutes } from "./GigRoutes.js";
import { messageRoutes } from "./MessagesRoutes.js";
import { orderRoutes } from "./OrderRoutes.js";
import { supportRoutes } from "./SupportRoutes.js";
import { adminRoutes } from "./AdminRoutes.js";
import express from "express";
import { oauthGoogle } from "../controllers/AuthControllers.js";

const router = Router();

router.get("/ping", (req, res) => {
  res.send("pong 🏓");
});

router.use("/uploads/profiles", express.static("uploads/profiles"));
router.use("/uploads", express.static("uploads"));

// Direct mount for Google OAuth bridge to avoid routing edge-cases.
router.post("/api/auth/oauth-google", oauthGoogle);

router.use("/api/auth", authRoutes);
router.use("/api/gigs", gigRoutes);
router.use("/api/orders", orderRoutes);
router.use("/api/dashboard", dashboardRoutes);
router.use("/api/messages", messageRoutes);
router.use("/api/support", supportRoutes);
router.use("/api/admin", adminRoutes);

export default router;
