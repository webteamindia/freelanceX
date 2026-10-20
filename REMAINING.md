# Remaining work — freelanceX

Last updated after refunds, email verification, WebSockets, and Playwright E2E. Use this as a launch and polish checklist.

## Done recently

- PayPal checkout + hold → buyer approve → seller payout (PayPal Payouts)
- **`PAYPAL_SIMULATE_CHECKOUT=true`** — local payment intent + Simulate payment button (no PayPal API)
- Seller PayPal email in account settings
- Admin dashboard (tabs, payouts, force-release, refund approve/reject)
- Production env validation, rate limits, health check
- API smoke test (`server/scripts/smoke-test.mjs`) — includes notification prefs, email verify, refunds
- PayPal webhook handler (`POST /api/webhooks/paypal`) + payment status polling on success page
- Order/payout email notifications when SMTP is configured (respects user notification prefs)
- Auto-release cron script (`pnpm run auto-release`, `AUTO_RELEASE_DAYS`)
- Email verification on signup + `/verify-email` + optional `REQUIRE_EMAIL_VERIFICATION`
- Buyer refund requests + admin refund workflow
- Socket.IO real-time messaging (`useOrderSocket` + 30s fallback poll)
- Playwright E2E (`client/e2e/`, `pnpm run test:e2e`)
- Seller delete own gig, self-purchase block, category browse wired to search, footer/nav polish

## Before production launch

| Priority | Item | Notes |
|----------|------|--------|
| High | Deploy API + client + MongoDB | [DEPLOYMENT.md](./DEPLOYMENT.md) |
| High | `prisma db push` on production DB | User verify fields, refund columns, notification prefs |
| High | PayPal **live** credentials + Payouts enabled | Sandbox first |
| High | Set `isAdmin: true` on your user | MongoDB |
| High | Run smoke test against staging | `PAYPAL_SIMULATE_PAYOUTS=true` on API |
| High | Register PayPal webhook URL | `https://your-api.com/api/webhooks/paypal` |
| Medium | Google OAuth production URLs | NextAuth + Google Console |
| Medium | SMTP for password reset + order emails | Required for verification emails |
| Medium | `NEXT_PUBLIC_SOCKET_URL` on client | Same host as API (wss in prod) |
| Medium | Custom domain + update `PUBLIC_URL` / `NEXTAUTH_URL` | |
| Medium | Cron: `pnpm run auto-release` | Daily on host |
| Low | Real `ads.txt` publisher id | Optional |

## Product / engineering gaps

| Area | Gap | Suggestion |
|------|-----|------------|
| Payments | PayPal webhook full signature verify | Handler re-checks via PayPal API; add `PAYPAL_WEBHOOK_ID` verify in prod |
| Payments | Refunds are status-only | No automatic PayPal money-back API yet — process in PayPal dashboard |
| Gigs | Create gig requires Cloudinary upload | Smoke test seeds gig via DB; API needs images |
| Auth | Email verification off by default | Set `REQUIRE_EMAIL_VERIFICATION=true` when SMTP is ready |
| Auth | No 2FA | Optional for admins |
| Ops | No error monitoring | Sentry / similar |
| Ops | E2E not in CI yet | Add Playwright job to GitHub Actions |
| Ops | No DB backups policy | MongoDB Atlas backups |
| Branding | ffiver vs freelanceX mixed | Pick one for marketing |

## Smoke test limitations

The smoke test covers **API flows** against a running server. It does **not**:

- Test the Next.js UI (login forms, PayPal buttons, admin pages) — use Playwright for that
- Upload gigs through Cloudinary (uses DB fixture)
- Call real PayPal unless `SMOKE_TRY_PAYPAL=1` (optional step)
- Replace manual QA of mobile layout and OAuth redirect in browser

## Quick commands

```bash
# Terminal 1 — API (simulated checkout + payouts for local/smoke)
cd server
PAYPAL_SIMULATE_CHECKOUT=true PAYPAL_SIMULATE_PAYOUTS=true pnpm run dev

# Terminal 2 — smoke test
cd server
pnpm run smoke

# E2E (client dev server must be running on :3000)
cd client
pnpm exec playwright install chromium
pnpm run test:e2e
```
