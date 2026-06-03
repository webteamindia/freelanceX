#!/usr/bin/env node
/**
 * freelanceX platform smoke test
 *
 * Prerequisites:
 *   - API server running (pnpm run dev in server/)
 *   - MongoDB reachable via DATABASE_URL in server/.env
 *   - For payout step: PAYPAL_SIMULATE_PAYOUTS=true on the server
 *
 * Usage:
 *   cd server && pnpm run smoke
 *   SMOKE_BASE_URL=http://localhost:5001 pnpm run smoke
 *   SMOKE_NO_CLEANUP=1 pnpm run smoke   # keep test data for inspection
 */

import "../loadEnv.js";
import { PrismaClient } from "@prisma/client";
import { calculateOrderSplit } from "../utils/payments.js";
import {
  SmokeRunner,
  assert,
  createApiClient,
  uniqueEmail,
} from "./smoke-lib.mjs";

const BASE_URL =
  process.env.SMOKE_BASE_URL || `http://localhost:${process.env.PORT || 5001}`;
const PASSWORD = process.env.SMOKE_PASSWORD || "SmokeTest123!";
const NO_CLEANUP = process.env.SMOKE_NO_CLEANUP === "1";
const TRY_PAYPAL_ORDER = process.env.SMOKE_TRY_PAYPAL === "1";

const prisma = new PrismaClient();
const api = createApiClient(BASE_URL);
const run = new SmokeRunner();

const state = {
  seller: { email: uniqueEmail("seller"), jwt: null, id: null },
  buyer: { email: uniqueEmail("buyer"), jwt: null, id: null },
  admin: { jwt: null },
  gigId: null,
  orderId: null,
  ticketId: null,
  receiverId: null,
};

async function signupAndLogin(user, label) {
  const signup = await api.post("/api/auth/signup", {
    body: { email: user.email, password: PASSWORD },
  });
  assert(signup.status === 200, `${label} signup failed`, signup.data);
  assert(signup.data?.jwt, `${label} signup missing jwt`, signup.data);
  user.jwt = signup.data.jwt;

  const info = await api.post("/api/auth/get-user-info", {
    token: user.jwt,
    body: {},
  });
  assert(info.status === 200, `${label} get-user-info failed`, info.data);
  user.id = info.data.user.id;
  return user;
}

async function cleanup() {
  if (NO_CLEANUP) {
    console.log("\nSMOKE_NO_CLEANUP=1 — test data left in database.");
    console.log(`  Seller: ${state.seller.email}`);
    console.log(`  Buyer:  ${state.buyer.email}`);
    return;
  }

  const ids = {
    orderId: state.orderId,
    gigId: state.gigId,
    sellerId: state.seller.id,
    buyerId: state.buyer.id,
    ticketId: state.ticketId,
  };

  if (ids.orderId) {
    await prisma.messages.deleteMany({ where: { orderId: ids.orderId } });
    await prisma.reviews.deleteMany({
      where: { gigId: ids.gigId, reviewerId: ids.buyerId },
    });
    await prisma.order.deleteMany({ where: { id: ids.orderId } });
  }

  if (ids.gigId) {
    await prisma.favorite.deleteMany({ where: { gigId: ids.gigId } });
    await prisma.gig.deleteMany({ where: { id: ids.gigId } });
  }

  if (ids.ticketId) {
    await prisma.supportTicket.deleteMany({ where: { id: ids.ticketId } });
  }

  for (const userId of [ids.sellerId, ids.buyerId]) {
    if (!userId) continue;
    await prisma.passwordResetToken.deleteMany({ where: { userId } });
    await prisma.favorite.deleteMany({ where: { userId } });
    await prisma.messages.deleteMany({
      where: { OR: [{ senderId: userId }, { receiverId: userId }] },
    });
    await prisma.reviews.deleteMany({ where: { reviewerId: userId } });
    await prisma.order.deleteMany({ where: { buyerId: userId } });
    await prisma.gig.deleteMany({ where: { userId } });
    await prisma.user.deleteMany({ where: { id: userId } });
  }
}

async function seedGigAndOrder() {
  const split = calculateOrderSplit(49);

  const gig = await prisma.gig.create({
    data: {
      title: `Smoke Test Gig ${Date.now()}`,
      description: "Automated smoke test gig listing.",
      category: "web-development",
      deliveryTime: 3,
      revisions: 2,
      features: ["API test", "Smoke coverage"],
      price: 49,
      shortDesc: "Smoke gig",
      images: ["https://res.cloudinary.com/demo/image/upload/sample.jpg"],
      userId: state.seller.id,
    },
  });
  state.gigId = gig.id;

  const paymentIntent = `smoke_order_${Date.now()}_${Math.random().toString(36).slice(2)}`;

  const order = await prisma.order.create({
    data: {
      paymentIntent,
      price: 49,
      isCompleted: true,
      payoutStatus: "held",
      platformFeeAmount: split.platformFee,
      sellerEarningsAmount: split.sellerEarnings,
      buyerId: state.buyer.id,
      gigId: gig.id,
    },
  });
  state.orderId = order.id;
  state.receiverId = state.seller.id;

  return { gig, order };
}

async function main() {
  console.log(`\n${"═".repeat(50)}`);
  console.log("  freelanceX — platform smoke test");
  console.log(`  API: ${BASE_URL}`);
  console.log(`${"═".repeat(50)}\n`);

  try {
    await run.step("Database reachable", async () => {
      try {
        await prisma.$connect();
        await prisma.$runCommandRaw({ ping: 1 });
      } catch (err) {
        throw new Error(
          `Cannot connect to MongoDB (check DATABASE_URL in server/.env). ${err.message}`
        );
      }
    });

    await run.step("Server health check", async () => {
      const ping = await api.get("/ping");
      assert(ping.status === 200, "ping failed", ping.data);

      const health = await api.get("/api/health");
      assert(health.status === 200, "health failed", health.data);
      assert(health.data?.ok === true, "health not ok", health.data);
      assert(
        health.data?.database === "connected",
        "database not connected on API — is the server using the same DATABASE_URL?",
        health.data
      );
    });

    await run.step("Seller signup & login", async () => {
      await signupAndLogin(state.seller, "Seller");
    });

    await run.step("Buyer signup & login", async () => {
      await signupAndLogin(state.buyer, "Buyer");
    });

    await run.step("Seller profile & PayPal email", async () => {
      const slug = `smoke_seller_${Date.now()}`;
      const profile = await api.post("/api/auth/set-user-info", {
        token: state.seller.jwt,
        body: {
          userName: slug,
          fullName: "Smoke Test Seller",
          description: "Seller created by smoke test.",
        },
      });
      assert(profile.status === 200, "set-user-info failed", profile.data);

      const paypal = await api.post("/api/auth/set-paypal-email", {
        token: state.seller.jwt,
        body: { paypalEmail: "smoke-seller-payout@ffiver.test" },
      });
      assert(paypal.status === 200, "set-paypal-email failed", paypal.data);
    });

    await run.step("Public seller profile", async () => {
      const info = await api.post("/api/auth/get-user-info", {
        token: state.seller.jwt,
        body: {},
      });
      const username = info.data.user.username;
      const profile = await api.get(`/api/auth/profile/${username}`);
      assert(profile.status === 200, "public profile failed", profile.data);
      assert(profile.data?.profile, "missing profile", profile.data);
    });

    await run.step("Seed gig + paid order (DB fixture)", async () => {
      const { gig, order } = await seedGigAndOrder();
      assert(gig.id, "gig not created");
      assert(order.isCompleted, "order should be completed");
      assert(order.payoutStatus === "held", "order should be held");
    });

    await run.step("Get gig by id", async () => {
      const res = await api.get(`/api/gigs/get/${state.gigId}`);
      assert(res.status === 200, "get gig failed", res.data);
      assert(res.data?.gig?.id === state.gigId, "gig id mismatch", res.data);
    });

    await run.step("Search gigs", async () => {
      const res = await api.get("/api/gigs/search", {
        query: { searchTerm: "Smoke Test" },
      });
      assert(res.status === 200, "search failed", res.data);
      const list = res.data?.gigs || res.data?.results || [];
      assert(Array.isArray(list), "search should return array", res.data);
    });

    await run.step("Buyer favorites flow", async () => {
      const add = await api.post("/api/gigs/favorites", {
        token: state.buyer.jwt,
        body: { gigId: state.gigId },
      });
      assert(add.status === 200 || add.status === 201, "add favorite failed", add.data);

      const list = await api.get("/api/gigs/favorites", {
        token: state.buyer.jwt,
      });
      assert(list.status === 200, "get favorites failed", list.data);
      const gigs = list.data?.gigs || [];
      assert(
        gigs.some((g) => g.id === state.gigId),
        "gig not in favorites",
        gigs
      );

      const del = await api.delete(`/api/gigs/favorites/${state.gigId}`, {
        token: state.buyer.jwt,
      });
      assert(del.status === 200, "remove favorite failed", del.data);
    });

    await run.step("Checkout blocked without seller PayPal", async () => {
      const tempSeller = { email: uniqueEmail("nopaypal"), jwt: null, id: null };
      await signupAndLogin(tempSeller, "Temp seller");
      const { gig: orphanGig } = await seedGigForUser(tempSeller.id, 25);

      const create = await api.post("/api/orders/create", {
        token: state.buyer.jwt,
        body: { gigId: orphanGig.id },
      });
      assert(
        create.status === 400,
        "expected 400 when seller has no PayPal",
        create.data
      );
      assert(
        create.data?.code === "SELLER_PAYOUT_NOT_CONFIGURED",
        "expected SELLER_PAYOUT_NOT_CONFIGURED code",
        create.data
      );

      await prisma.gig.delete({ where: { id: orphanGig.id } });
      await prisma.user.delete({ where: { id: tempSeller.id } });
    });

    await run.step("Buyer & seller order lists", async () => {
      const buyerOrders = await api.get("/api/orders/get-buyer-orders", {
        token: state.buyer.jwt,
      });
      assert(buyerOrders.status === 200, "buyer orders failed", buyerOrders.data);
      const bo = buyerOrders.data?.orders || [];
      assert(
        bo.some((o) => o.id === state.orderId),
        "buyer order missing",
        bo
      );

      const sellerOrders = await api.get("/api/orders/get-seller-orders", {
        token: state.seller.jwt,
      });
      assert(sellerOrders.status === 200, "seller orders failed", sellerOrders.data);
      const so = sellerOrders.data?.orders || [];
      assert(
        so.some((o) => o.id === state.orderId),
        "seller order missing",
        so
      );
    });

    await run.step("Order messaging", async () => {
      const send = await api.post(`/api/messages/send-message/${state.orderId}`, {
        token: state.buyer.jwt,
        body: {
          message: "Smoke test message from buyer",
          receiverId: state.receiverId,
        },
      });
      assert(send.status === 201, "send message failed", send.data);

      const get = await api.get(`/api/messages/get-messages/${state.orderId}`, {
        token: state.seller.jwt,
      });
      assert(get.status === 200, "get messages failed", get.data);
      assert(
        (get.data?.messages || []).length >= 1,
        "expected at least one message",
        get.data
      );
      assert(get.data?.receiverId, "missing receiverId", get.data);
    });

    await run.step("Seller dashboard stats", async () => {
      const res = await api.get("/api/dashboard/seller", {
        token: state.seller.jwt,
      });
      assert(res.status === 200, "seller dashboard failed", res.data);
      assert(res.data?.dashboardData, "missing dashboardData", res.data);
      assert(
        res.data.dashboardData.orders >= 1,
        "seller should have orders",
        res.data.dashboardData
      );
    });

    await run.step("Buyer releases payout to seller", async () => {
      const res = await api.post(
        `/api/orders/${state.orderId}/release-payout`,
        { token: state.buyer.jwt, body: {} }
      );

      if (res.status === 502 && !process.env.PAYPAL_SIMULATE_PAYOUTS) {
        throw new Error(
          "Payout failed. Start server with PAYPAL_SIMULATE_PAYOUTS=true for local smoke tests."
        );
      }

      assert(
        res.status === 200,
        "release payout failed",
        res.data
      );
      assert(
        res.data?.payoutStatus === "released" ||
          res.data?.order?.payoutStatus === "released",
        "payout should be released",
        res.data
      );
    });

    await run.step("Post-delivery review", async () => {
      const res = await api.post(`/api/gigs/review/${state.gigId}`, {
        token: state.buyer.jwt,
        body: { reviewText: "Great smoke test delivery!", rating: 5 },
      });
      assert(res.status === 201, "add review failed", res.data);
      assert(res.data?.newReview, "missing newReview", res.data);
    });

    await run.step("Support ticket", async () => {
      const res = await api.post("/api/support/contact", {
        body: {
          email: state.buyer.email,
          subject: "Smoke test support",
          message: "Automated smoke test ticket — safe to delete.",
        },
      });
      assert(res.status === 200, "support contact failed", res.data);

      const ticket = await prisma.supportTicket.findFirst({
        where: { email: state.buyer.email },
        orderBy: { createdAt: "desc" },
      });
      assert(ticket, "ticket not found in db");
      state.ticketId = ticket.id;
    });

    await run.step("Notification preferences", async () => {
      const res = await api.post("/api/auth/set-notification-preferences", {
        token: state.buyer.jwt,
        body: { notifyOrderEmails: false, notifyMessageEmails: true },
      });
      assert(res.status === 200, "notification prefs failed", res.data);

      const user = await prisma.user.findUnique({ where: { id: state.buyer.id } });
      assert(user?.notifyOrderEmails === false, "notifyOrderEmails not saved");
      assert(user?.notifyMessageEmails === true, "notifyMessageEmails not saved");

      await api.post("/api/auth/set-notification-preferences", {
        token: state.buyer.jwt,
        body: { notifyOrderEmails: true, notifyMessageEmails: true },
      });
    });

    await run.step("Email verification token", async () => {
      const token = `smoke-verify-${Date.now()}`;
      await prisma.user.update({
        where: { id: state.seller.id },
        data: {
          emailVerified: false,
          emailVerifyToken: token,
          emailVerifyExpiresAt: new Date(Date.now() + 3600_000),
        },
      });

      const res = await api.get(`/api/auth/verify-email?token=${token}`);
      assert(res.status === 200, "verify email failed", res.data);

      const seller = await prisma.user.findUnique({ where: { id: state.seller.id } });
      assert(seller?.emailVerified === true, "seller should be verified");
      assert(!seller?.emailVerifyToken, "token should be cleared");
    });

    await run.step("Refund request and admin decision", async () => {
      const heldOrder = await prisma.order.create({
        data: {
          gigId: state.gigId,
          buyerId: state.buyer.id,
          sellerId: state.seller.id,
          price: 49,
          isCompleted: true,
          paymentIntent: `smoke-refund-${Date.now()}`,
          paymentStatus: "paid",
          payoutStatus: "held",
          platformFeeAmount: 1,
          sellerEarningsAmount: 9,
        },
      });

      const req = await api.post(`/api/orders/${heldOrder.id}/request-refund`, {
        token: state.buyer.jwt,
        body: { reason: "Smoke test refund" },
      });
      assert(req.status === 200, "request refund failed", req.data);

      await prisma.user.update({
        where: { id: state.buyer.id },
        data: { isAdmin: true },
      });

      const reject = await api.post(`/api/admin/orders/${heldOrder.id}/refund`, {
        token: state.buyer.jwt,
        body: { action: "reject", note: "Smoke test reject" },
      });
      assert(reject.status === 200, "reject refund failed", reject.data);

      await prisma.order.update({
        where: { id: heldOrder.id },
        data: { refundStatus: null, refundReason: null, refundRequestedAt: null },
      });

      const req2 = await api.post(`/api/orders/${heldOrder.id}/request-refund`, {
        token: state.buyer.jwt,
        body: { reason: "Smoke test approve" },
      });
      assert(req2.status === 200, "second refund request failed", req2.data);

      const approve = await api.post(`/api/admin/orders/${heldOrder.id}/refund`, {
        token: state.buyer.jwt,
        body: { action: "approve", note: "Smoke test approve" },
      });
      assert(approve.status === 200, "approve refund failed", approve.data);

      const updated = await prisma.order.findUnique({ where: { id: heldOrder.id } });
      assert(updated?.refundStatus === "approved", "refund should be approved");
      assert(updated?.payoutStatus === "refunded", "payout should be refunded");

      await prisma.user.update({
        where: { id: state.buyer.id },
        data: { isAdmin: false },
      });
      await prisma.order.delete({ where: { id: heldOrder.id } });
    });

    await run.step("Admin panel API", async () => {
      await prisma.user.update({
        where: { id: state.buyer.id },
        data: { isAdmin: true },
      });

      const overview = await api.get("/api/admin/overview", {
        token: state.buyer.jwt,
      });
      assert(overview.status === 200, "admin overview failed", overview.data);
      assert(overview.data?.overview?.users >= 2, "overview users", overview.data);

      const users = await api.get("/api/admin/users", {
        token: state.buyer.jwt,
      });
      assert(users.status === 200, "admin users failed", users.data);

      const orders = await api.get("/api/admin/orders", {
        token: state.buyer.jwt,
      });
      assert(orders.status === 200, "admin orders failed", orders.data);
      assert(
        (orders.data?.orders || []).some((o) => o.id === state.orderId),
        "admin should see smoke order",
        orders.data
      );

      await prisma.user.update({
        where: { id: state.buyer.id },
        data: { isAdmin: false },
      });
    });

    await run.step("PayPal order create (live API)", async () => {
      if (!TRY_PAYPAL_ORDER) {
        throw new Error("Set SMOKE_TRY_PAYPAL=1 to run this step");
      }
      const create = await api.post("/api/orders/create", {
        token: state.buyer.jwt,
        body: { gigId: state.gigId },
      });
      assert(create.status === 201, "PayPal create order failed", create.data);
      assert(create.data?.orderId, "missing PayPal orderId", create.data);
    }, { optional: true });

    const ok = run.summary();
    if (!ok) process.exitCode = 1;
  } catch (err) {
    run.summary();
    console.error(`\n${err.message || err}`);
    process.exitCode = 1;
  } finally {
    try {
      await cleanup();
    } catch (e) {
      console.error("Cleanup error:", e.message);
    }
    await prisma.$disconnect();
  }
}

async function seedGigForUser(userId, price) {
  const gig = await prisma.gig.create({
    data: {
      title: `Orphan gig ${Date.now()}`,
      description: "Temp gig for negative test",
      category: "testing",
      deliveryTime: 1,
      revisions: 1,
      features: ["test"],
      price,
      shortDesc: "temp",
      images: [],
      userId,
    },
  });
  return { gig };
}

main();
