// Ensure .env is loaded before Prisma reads DATABASE_URL
import "../loadEnv.js";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

let prisma = new PrismaClient();

// Debug: confirm which DB URL is used (password redacted). Remove after fixing.
if (process.env.NODE_ENV !== "production" && process.env.DATABASE_URL) {
  const url = process.env.DATABASE_URL.replace(/:([^:@]+)@/, ":****@");
  console.log("[Prisma] DATABASE_URL (redacted):", url);
}

export default prisma;
