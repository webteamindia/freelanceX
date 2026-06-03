import { Router } from "express";
import { handlePayPalWebhook } from "../controllers/WebhookController.js";

export const webhookRoutes = Router();

webhookRoutes.post("/paypal", handlePayPalWebhook);
