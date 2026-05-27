# Deployment guide

Recommended setup: **Vercel** (client) + **Render** or similar (API) + **MongoDB Atlas**.

## 1. MongoDB Atlas

1. Create a cluster and database user.
2. Allow network access (0.0.0.0/0 for Render, or restrict to host IPs).
3. Copy the connection string into `DATABASE_URL`.

## 2. API (Render)

- **Build command:** `cd server && pnpm install && pnpm exec prisma generate`
- **Start command:** `cd server && node index.js`
- **Root directory:** repository root, or set subdirectory to `server`

### Required environment variables

Copy from `server/.env.template`. Minimum for production:

| Variable | Notes |
|----------|--------|
| `NODE_ENV` | `production` |
| `PORT` | Set by host (e.g. `10000`) |
| `DATABASE_URL` | MongoDB connection string |
| `PUBLIC_URL` | Frontend URL(s), comma-separated, e.g. `https://yourapp.vercel.app` |
| `JWT_SECRET` | 32+ random characters |
| `CLOUDINARY_*` | All three Cloudinary keys |
| `PAYPAL_CLIENT_ID` | Live app credentials when launching |
| `PAYPAL_CLIENT_SECRET` | Live secret |
| `PAYPAL_MODE` | `live` for real payments, `sandbox` for testing |

Optional: `SMTP_*`, `SUPPORT_EMAIL`, `PAYPAL_BRAND_NAME`.

The server refuses to start in production if secrets are missing or weak.

## 3. Frontend (Vercel)

- **Root directory:** `client`
- **Build command:** `pnpm run build`
- **Install:** `pnpm install`

### Required environment variables

Copy from `client/env.example`:

| Variable | Notes |
|----------|--------|
| `NEXT_PUBLIC_SERVER_URL` | Public API URL, no trailing slash |
| `NEXTAUTH_URL` | Your Vercel URL, e.g. `https://yourapp.vercel.app` |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | OAuth client |
| `GOOGLE_CLIENT_SECRET` | OAuth secret |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Match PayPal mode (sandbox/live) |

In Google Cloud Console, add authorized redirect URI:

`https://yourapp.vercel.app/api/auth/callback/google`

## 4. PayPal (checkout + seller payouts)

1. Create sandbox and live apps in the [PayPal Developer Dashboard](https://developer.paypal.com/).
2. Use sandbox keys with `PAYPAL_MODE=sandbox` until end-to-end testing passes.
3. Switch both server and client to **live** credentials and `PAYPAL_MODE=live` for production.
4. Enable **Payouts** on your PayPal business account (required to pay sellers).
5. Set `PLATFORM_FEE_PERCENT` (default `10`) on the API.

### Payment flow

1. Buyer pays at checkout → funds captured to your platform PayPal account.
2. Seller must set **PayPal email** in account settings.
3. Buyer clicks **Approve & pay seller** on their order → API sends seller earnings via PayPal Payouts.
4. For local testing without Payouts API: `PAYPAL_SIMULATE_PAYOUTS=true` (development only).

## 5. Post-deploy checks

1. `GET https://your-api.onrender.com/api/health` → `{ "ok": true }`
2. Sign up / log in / Google sign-in
3. Create a gig with image upload
4. Complete a sandbox PayPal checkout
5. Send messages on an order (messages should refresh within ~5s)
6. Forgot password (requires SMTP)
7. Admin panel with `isAdmin` user

## 6. Admin user

In MongoDB, set on your user document:

```json
{ "isAdmin": true }
```

## 7. Custom domain

- Point Vercel domain to the client.
- Update `PUBLIC_URL` and `NEXTAUTH_URL` to the production domain.
- Update Google OAuth redirect URIs.
- Rebuild the client so `NEXT_PUBLIC_SERVER_URL` and image patterns stay correct.
