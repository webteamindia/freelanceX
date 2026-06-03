import crypto from "crypto";
import prisma from "../prisma/client.js";
import { sendMail } from "../utils/mailer.js";

const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 24;

export async function createAndSendVerificationEmail(user) {
  const token = crypto.randomBytes(TOKEN_BYTES).toString("hex");
  const expiresAt = new Date(Date.now() + EXPIRY_HOURS * 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerifyToken: token,
      emailVerifyExpiresAt: expiresAt,
    },
  });

  const baseUrl = (process.env.PUBLIC_URL || "http://localhost:3000")
    .split(",")[0]
    .trim();
  const verifyUrl = `${baseUrl}/verify-email?token=${token}`;
  const brand = process.env.PAYPAL_BRAND_NAME || "ffiver";

  await sendMail({
    to: user.email,
    subject: `Verify your ${brand} email`,
    text: `Welcome to ${brand}! Verify your email:\n\n${verifyUrl}\n\nLink expires in ${EXPIRY_HOURS} hours.`,
    html: `<p>Welcome to <strong>${brand}</strong>!</p>
           <p><a href="${verifyUrl}">Verify your email address</a></p>
           <p>This link expires in ${EXPIRY_HOURS} hours.</p>`,
  });

  return { sent: true, verifyUrl };
}

export async function verifyEmailToken(token) {
  if (!token) {
    return { ok: false, error: "Verification token is required." };
  }

  const user = await prisma.user.findFirst({
    where: { emailVerifyToken: token },
  });

  if (!user) {
    return { ok: false, error: "Invalid or expired verification link." };
  }

  if (user.emailVerifyExpiresAt && user.emailVerifyExpiresAt < new Date()) {
    return { ok: false, error: "Verification link has expired. Request a new one." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      emailVerified: true,
      emailVerifyToken: null,
      emailVerifyExpiresAt: null,
    },
  });

  return { ok: true, email: user.email };
}

export function requireEmailVerificationEnabled() {
  return process.env.REQUIRE_EMAIL_VERIFICATION === "true";
}

export async function assertUserEmailVerified(userId) {
  if (!requireEmailVerificationEnabled()) return true;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { emailVerified: true },
  });

  return Boolean(user?.emailVerified);
}
