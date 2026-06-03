# Smoke test

End-to-end API smoke test for freelanceX. Exercises auth, gigs, orders, messaging, payouts, reviews, support, and admin.

## Prerequisites

1. MongoDB running and `DATABASE_URL` set in `server/.env` (Atlas IP allowlist or local `mongodb://127.0.0.1:27017/freelancex`)
2. API server running:

   ```bash
   cd server
   PAYPAL_SIMULATE_PAYOUTS=true pnpm run dev
   ```

3. Dev JWT secret in `.env` (production validation is skipped when `NODE_ENV` is not `production`)

## Run

```bash
cd server
pnpm run smoke
```

Custom API URL:

```bash
SMOKE_BASE_URL=http://localhost:5001 pnpm run smoke
```

Keep test users in DB for debugging:

```bash
SMOKE_NO_CLEANUP=1 pnpm run smoke
```

Optional: hit real PayPal sandbox on order create:

```bash
SMOKE_TRY_PAYPAL=1 pnpm run smoke
```

## What each step tests

| Step | Flow |
|------|------|
| Health | `GET /ping`, `GET /api/health` |
| Auth | Seller & buyer signup, JWT, profile, PayPal email |
| Gig & order | DB fixture (paid order, payout held) — avoids Cloudinary + PayPal checkout in CI |
| Discovery | Get gig, search, favorites |
| Negative | Order blocked if seller has no PayPal |
| Orders | Buyer/seller order lists |
| Messages | Send + fetch order thread |
| Dashboard | Seller stats |
| Payout | Buyer `release-payout` (needs `PAYPAL_SIMULATE_PAYOUTS=true` on server) |
| Review | Buyer review after completed order |
| Support | Contact form → ticket in DB |
| Admin | Temporary admin on buyer, overview/users/orders |

## Exit codes

- `0` — all required steps passed
- `1` — at least one required step failed

## Not covered

- Next.js pages / PayPal JS buttons
- Google OAuth
- Gig image upload (Cloudinary)
- Browser E2E

Add Playwright or Cypress later for full UI smoke.
