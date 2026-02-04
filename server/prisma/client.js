// Ensure .env is loaded before Prisma reads DATABASE_URL
import "../loadEnv.js";

import pkg from "@prisma/client";
const { PrismaClient } = pkg;

let prisma = new PrismaClient();

export default prisma;
