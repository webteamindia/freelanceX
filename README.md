# freelanceX (ffiver)

Freelance marketplace built with Next.js, Tailwind CSS, Node.js, Express, Prisma, and MongoDB.

## Features

- User authentication (email/password + Google)
- Gigs, search, favorites, reviews
- Orders and PayPal checkout
- Buyer/seller messaging (auto-refresh every 5s)
- Admin dashboard
- Cloudinary image uploads

## Local development

### 1. Server

```bash
cd server
cp .env.template .env
# Edit .env — set DATABASE_URL and other keys
pnpm install
pnpm run dev
```

API runs at `http://localhost:5001` by default.

### 2. Client

```bash
cd client
cp env.example .env.local
# Edit .env.local — set NEXT_PUBLIC_SERVER_URL=http://localhost:5001
pnpm install
pnpm run dev
```

App runs at `http://localhost:3000`.

### 3. Database

Use MongoDB Atlas or a local instance. Run seed data optionally:

```bash
cd server && pnpm run seed
```

Promote an admin user in MongoDB: set `isAdmin: true` on your user document.

## Environment variables

| Location | Template file |
|----------|----------------|
| API | `server/.env.template` |
| Web app | `client/env.example` |

Production startup validates required server secrets. See [DEPLOYMENT.md](./DEPLOYMENT.md) for hosting steps.

## Payments & seller payouts

Buyers pay via PayPal; funds are held until the buyer approves delivery, then released to the seller's PayPal email. See [PAYMENTS.md](./PAYMENTS.md).

## Health check

`GET /api/health` — returns `{ ok, database }` when MongoDB is reachable.

## Scripts

| Command | Where | Description |
|---------|-------|-------------|
| `pnpm run dev` | server / client | Development |
| `pnpm start` | server | Production API |
| `pnpm run build` | client | Production frontend build |
| `pnpm run seed` | server | Demo data |

## CI

GitHub Actions runs `prisma generate` on the server and `next build` on the client for pushes and PRs to `main`.

## AdSense

If using Google AdSense, replace the placeholder publisher id in `client/public/ads.txt` with your real `pub-` id.
