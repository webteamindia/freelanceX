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
| Medium | Cron: daily auto-release | GitHub Action `.github/workflows/auto-release.yml` — set `DATABASE_URL` and PayPal secrets |
| Low | Real `ads.txt` publisher id | Optional |

## Product / engineering gaps

| Area | Gap | Suggestion |
|------|-----|------------|
| Payments | PayPal webhook signature | Production rejects webhooks unless `PAYPAL_WEBHOOK_ID` verifies |
| Payments | Refunds | Admin approve calls the PayPal capture refund API |
| Gigs | Create gig requires Cloudinary upload | Smoke test seeds gig via DB; API needs images |
| Auth | Email verification | Turns on automatically when SMTP is configured. Set `REQUIRE_EMAIL_VERIFICATION=false` to keep it off |
| Auth | Admin 2FA | Account settings → Admin authenticator. Required at login once enabled |
| Ops | Error monitoring | Set `SENTRY_DSN` on the API |
| Ops | E2E | Playwright runs in `.github/workflows/ci.yml` |
| Branding | Public name is ffiver | Site, legal pages, and social accounts use ffiver. The repo folder is freelanceX |
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
