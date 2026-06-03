#!/usr/bin/env node
/**
 * Auto-release seller payouts for orders held longer than AUTO_RELEASE_DAYS.
 * Run via cron, e.g. daily: 0 9 * * * cd server && node scripts/auto-release-payouts.mjs
 *
 * Requires: DATABASE_URL, PayPal credentials (or PAYPAL_SIMULATE_PAYOUTS=true in dev)
 */

import "../loadEnv.js";
import { PrismaClient } from "@prisma/client";
import { executeSellerPayout, loadOrderForPayout } from "../services/payoutService.js";

const prisma = new PrismaClient();
const days = Number(process.env.AUTO_RELEASE_DAYS || 14);

const cutoff = new Date();
cutoff.setDate(cutoff.getDate() - days);

async function main() {
  console.log(`Auto-release: orders held since before ${cutoff.toISOString()}`);

  const orders = await prisma.order.findMany({
    where: {
      isCompleted: true,
      payoutStatus: "held",
      createdAt: { lte: cutoff },
    },
    take: 50,
  });

  console.log(`Found ${orders.length} candidate(s)`);

  let released = 0;
  let failed = 0;

  for (const row of orders) {
    const order = await loadOrderForPayout(row.id);
    const result = await executeSellerPayout(order);
    if (result.ok) {
      released += 1;
      console.log(`  OK  ${row.id}`);
    } else {
      failed += 1;
      console.log(`  FAIL ${row.id}: ${result.error}`);
    }
  }

  console.log(`Done. released=${released} failed=${failed}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
