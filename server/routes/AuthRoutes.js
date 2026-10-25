import { Router } from "express";
import { uploadSingle } from "../config/cloudinary.config.js";
import {
  getUserInfo,
  login,
  setUserImage,
  setUserInfo,
  signup,
  requestPasswordReset,
  resetPassword,
  oauthGoogle,
  getPublicProfile,
  setPaypalEmail,
  verifyEmail,
  resendVerificationEmail,
  setNotificationPreferences,
  setupAdminTotp,
  enableAdminTotp,
  disableAdminTotp,
} from "../controllers/AuthControllers.js";
import { verifyToken } from "../middlewares/AuthMiddleware.js";

const authRoutes = Router();

authRoutes.get("/verify-email", verifyEmail);
authRoutes.post("/verify-email", verifyEmail);
authRoutes.post("/signup", signup);
authRoutes.post("/login", login);
authRoutes.post("/oauth-google", oauthGoogle);
authRoutes.post("/forgot-password", requestPasswordReset);
authRoutes.post("/reset-password", resetPassword);
authRoutes.post("/get-user-info", verifyToken, getUserInfo);
authRoutes.get("/profile/:username", getPublicProfile);
authRoutes.post("/set-user-info", verifyToken, setUserInfo);
authRoutes.post("/set-paypal-email", verifyToken, setPaypalEmail);
authRoutes.post("/resend-verification", verifyToken, resendVerificationEmail);
authRoutes.post(
  "/set-notification-preferences",
  verifyToken,
  setNotificationPreferences
);
authRoutes.post("/2fa/setup", verifyToken, setupAdminTotp);
authRoutes.post("/2fa/enable", verifyToken, enableAdminTotp);
authRoutes.post("/2fa/disable", verifyToken, disableAdminTotp);

authRoutes.post(
  "/set-user-image",
  verifyToken,
  uploadSingle.single("images"),
  setUserImage
);

export default authRoutes;
