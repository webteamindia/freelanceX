import { Router } from "express";
import { createSupportTicket } from "../controllers/SupportController.js";

export const supportRoutes = Router();

supportRoutes.post("/contact", createSupportTicket);

