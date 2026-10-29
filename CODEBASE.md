# freelanceX (ffiver)

## What it is

A two-package freelance marketplace. The public product name in the UI, emails, and legal copy is **ffiver**. The repository folder and API health payload use **freelanceX**.

Buyers search gigs, pay with PayPal, message the seller on the order, and release the seller’s share after approving delivery. Sellers create gigs, receive held payouts to a PayPal email, and see a dashboard of earnings. Admins (a boolean on the user, not a separate role table) manage users, gigs, orders, refunds, and support tickets.

`client/` is a Next.js Pages Router app. `server/` is an Express API plus Socket.IO, using Prisma against MongoDB. There is no shared package; the client talks to the API over HTTP with a JWT stored in a browser cookie named `jwt`.

## Who uses it and what they can do

There is no buyer/seller account type. Anyone with a user record can buy and sell. The navbar toggles a client-only `isSeller` flag in React state (`StateReducer`) that changes which links are shown. It is not stored on the user.

**Visitor (no JWT)**

- Browse the landing page, search, category pages, gig pages, and public seller profiles.
- Read static pages: how it works, pricing, help, contact, terms, privacy.
- Submit the contact form (creates a `SupportTicket`, no login).
- Sign up, log in, reset a password, verify an email, or start Google sign-in.

**Signed-in user**

- Set username, full name, description, and profile image.
- Save a PayPal payout email and email notification toggles.
- Create, edit, and delete their own gigs (delete is blocked if the gig has any orders).
- Favorite gigs, order someone else’s gig, review a gig only after a completed order.
- See buyer orders and seller orders, open an order message thread, request a refund while the payout is still held.
- As the buyer of a paid order, release the seller payout.

**Admin (`User.isAdmin === true`, and `isActive`)**

- Open `/admin`. The page loads overview, users, orders, tickets, and gigs.
- Activate or deactivate users, grant or revoke `isAdmin` (not on themselves).
- Change an order’s `isCompleted`, force-release a payout, approve or reject a refund, delete any gig, resolve a support ticket.
- Optionally enroll an authenticator (TOTP). Once `totpEnabled` is true, login requires a 6-digit code. Non-admins cannot set up 2FA (`setupAdminTotp` returns 403).

Admin is not created by signup. `server/prisma/seed.js` does not set `isAdmin`. An operator sets `isAdmin: true` on the MongoDB user document (also stated in `README.md`).

## Tech stack

Two independent packages. CI (`.github/workflows/ci.yml`) uses **Node 20** and **pnpm 9**. Neither `package.json` declares `engines` or `packageManager`. Both directories have a `pnpm-lock.yaml`.

**Client** (`client/package.json`, version 0.1.0)

| Library | Version in package.json | Role |
| --- | --- | --- |
| next | 14.2.10 | Pages Router (`src/pages`) |
| react / react-dom | 18.2.0 | UI |
| next-auth | ^4.24.13 | Google OAuth session only; the marketplace JWT is separate |
| axios | ^1.13.4 | All API calls |
| @paypal/react-paypal-js | ^8.7.0 | PayPal Buttons |
| socket.io-client | ^4.8.1 | Order chat |
| react-cookie | ^4.1.1 | Stores the API JWT |
| tailwindcss | 3.3.2 | Styling (`tailwind.config.js`, `postcss.config.js`) |
| framer-motion, react-slick, slick-carousel, react-toastify, react-icons, react-loader-spinner, nextjs-progressbar | see package.json | UI |
| @playwright/test | ^1.49.1 (dev) | E2E in `client/e2e/` |

**Server** (`server/package.json`, version 1.0.0, `"type": "module"`)

| Library | Version | Role |
| --- | --- | --- |
| express | ^4.22.1 | HTTP API |
| @prisma/client / prisma | ^4.16.2 | MongoDB ORM. Provider is `mongodb` in `server/prisma/schema.prisma` |
| jsonwebtoken | ^9.0.3 | Access JWT |
| bcryptjs | ^2.4.3 | Password hashes |
| socket.io | ^4.8.1 | Realtime messages |
| cloudinary, multer 1.4.5-lts.2, multer-storage-cloudinary | image uploads |
| nodemailer | ^8.0.2 | SMTP |
| express-rate-limit | ^8.5.2 | Auth and API limits |
| helmet, cors, cookie-parser, morgan, dotenv, debug | middleware and config |
| fuse.js | ^7.1.0 | In-memory re-rank of gig search |
| nodemon | ^3.1.11 (dev) | `pnpm run dev` |

PayPal is called with `fetch` in `server/utils/paypal.js`. There is no PayPal SDK on the server and no Stripe.

## How to run it

### Server

```bash
cd server
cp .env.template .env
pnpm install
pnpm run dev
```

`pnpm install` runs `postinstall`: `prisma generate`. `pnpm run dev` is `DEBUG=app:* nodemon index.js`. `pnpm start` is `node index.js`. Default port is **5001** (`PORT` or the fallback in `server/index.js`).

Other scripts:

| Script | What it does |
| --- | --- |
| `pnpm run seed` | `node prisma/seed.js` — deletes users, gigs, orders, reviews, messages, then inserts demo data |
| `pnpm test` / `pnpm run smoke` | `node scripts/smoke-test.mjs` against a running API |
| `pnpm run auto-release` | `node scripts/auto-release-payouts.mjs` |

`server/loadEnv.js` calls `dotenv.config()` before Prisma. `server/index.js` imports it first, then `validateProductionEnv()`, then creates an HTTP server, attaches Socket.IO, and listens.

### Client

```bash
cd client
cp env.example .env.local
pnpm install
pnpm run dev
```

Scripts: `dev` (`next dev`), `build`, `start`, `lint`, `test:e2e`, `test:e2e:ui`. Playwright (`client/playwright.config.js`) uses `PLAYWRIGHT_BASE_URL` or `http://localhost:3000`, and in CI builds then starts the client. There are two templates: `client/env.example` (includes `NEXT_PUBLIC_SOCKET_URL`) and `client/.env.example` (does not). README tells you to copy `client/env.example`.

### Server environment variable names

From `server/.env.template` and code that reads `process.env`:

Required in production by `validateProductionEnv()` in `server/utils/validate-env.js`: `DATABASE_URL`, `PUBLIC_URL`, `JWT_SECRET` (at least 32 characters, not a listed placeholder), `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`.

Also read by the server:

`NODE_ENV`, `PORT`, `BASE_PATH`, `JWT_EXPIRES_IN`, `JWT_REFRESH_SECRET`, `JWT_REFRESH_EXPIRES_IN`, `FRONTEND_ORIGIN`, `PAYPAL_CLIENT_ID`, `PAYPAL_CLIENT_SECRET`, `PAYPAL_MODE`, `PAYPAL_BRAND_NAME`, `PAYPAL_WEBHOOK_ID`, `PAYPAL_SIMULATE_CHECKOUT`, `PAYPAL_SIMULATE_PAYOUTS`, `PLATFORM_FEE_PERCENT`, `AUTO_RELEASE_DAYS`, `REQUIRE_EMAIL_VERIFICATION`, `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM`, `SUPPORT_EMAIL`, `SENTRY_DSN`.

Smoke script only: `SMOKE_BASE_URL`, `SMOKE_PASSWORD`, `SMOKE_NO_CLEANUP`, `SMOKE_TRY_PAYPAL`.

`BASE_PATH` and `FRONTEND_ORIGIN` are loaded into `Env` in `server/config/env.config.js` and are not referenced elsewhere. CORS uses `PUBLIC_URL` (`getCorsOrigins`). If `PUBLIC_URL` is empty outside production, CORS origin is `true` (reflect any origin).

### Client environment variable names

`NEXT_PUBLIC_SERVER_URL`, `NEXT_PUBLIC_SOCKET_URL`, `NEXTAUTH_URL`, `NEXTAUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_PAYPAL_CLIENT_ID`, `AGENT_API`, `NEXT_PUBLIC_ADSENSE_CLIENT`, `NEXT_PUBLIC_ADSENSE_HOME_SLOT`, `NEXT_PUBLIC_ADSENSE_SEARCH_SLOT`, `PLAYWRIGHT_BASE_URL`.

Production `next build` throws if `NEXT_PUBLIC_SERVER_URL` is empty (`client/next.config.js`). Production NextAuth throws if `NEXTAUTH_SECRET` is empty.

### Config files

- `server/prisma/schema.prisma` — MongoDB models
- `server/config/env.config.js`, `server/config/cloudinary.config.js`
- `client/next.config.js` — Cloudinary, Unsplash, and API image remote patterns. Production fallback hostname if the server URL cannot be parsed: `freelancex.onrender.com`
- `client/middleware.js` — redirects `/dev` to `/` in production
- `client/tailwind.config.js`, `client/postcss.config.js`, `client/playwright.config.js`
- `.github/workflows/ci.yml`, `.github/workflows/auto-release.yml` (daily 03:00 UTC)

## Repository map

```
freelanceX/
  README.md
  DEPLOYMENT.md
  PAYMENTS.md
  REMAINING.md
  .github/workflows/ci.yml
  .github/workflows/auto-release.yml
  .github/ISSUE_TEMPLATE/
  client/
    package.json
    env.example
    .env.example
    next.config.js
    middleware.js
    tailwind.config.js
    postcss.config.js
    playwright.config.js
    e2e/                  Playwright specs (home, auth)
    public/               Static images, ads.txt, ADSENSE.md
    src/pages/            Next.js routes, including pages/api
    src/components/       UI used by pages
    src/context/          Login modal and userInfo reducer
    src/hooks/            useOrderSocket
    src/utils/            API URL constants, categories, order helpers
    src/styles/globals.css
  server/
    index.js              HTTP + Socket.IO listen
    app.js                Express app
    loadEnv.js
    package.json
    prisma/schema.prisma
    prisma/client.js
    prisma/seed.js
    config/               Cloudinary multer + env object
    routes/               Express routers
    controllers/
    services/
    middlewares/          JWT and admin checks
    socket/socketServer.js
    scripts/              smoke test and auto-release
    utils/
```

`client/src/pages` is the route tree. `server/routes/index.js` mounts every API prefix. Uploaded bytes do not stay on disk: multer streams them to Cloudinary. `app.js` still serves `uploads/` and `uploads/profiles` as static files if those directories exist.

## Runtime architecture

### Browser request for a page

Next.js serves `client/src/pages/*`. `src/pages/_app.jsx` wraps every page in `SessionProvider` (NextAuth), `StateProvider`, `NavBar`, `Footer`, `AIChatBot`, toasts, and the progress bar. `NavBar` posts to `GET_USER_INFO` (`POST /api/auth/get-user-info`) when the `jwt` cookie exists and stores the user in context. There is no Next.js data layer (`getServerSideProps` exists only on `/dev`). Gig, search, and order data are loaded in `useEffect` with axios.

`client/src/utils/constants.js` builds URLs as `` `${NEXT_PUBLIC_SERVER_URL}/api/...` ``. Axios sends `Authorization: Bearer ${cookies.jwt}`. The cookie is not an httpOnly server cookie; `react-cookie` sets it from JavaScript (`AuthForm`, `google-callback`).

### Signup and login

1. `client/src/pages/login.jsx` or `signup.jsx` renders `AuthForm`.
2. `AuthForm` posts to `POST /api/auth/login` or `POST /api/auth/signup`.
3. `server/routes/AuthRoutes.js` calls `login` or `signup` in `server/controllers/AuthControllers.js`.
4. Those call `loginUser` / `registerUser` in `server/services/authService.js` (bcrypt via `generatePassword`, Prisma `user`).
5. `generateToken` signs `{ email, userId }` with `JWT_SECRET` and `expiresIn` of `3 * 24 * 60 * 60` seconds. The `JWT_EXPIRES_IN` env value is not used here.
6. The client stores `data.jwt` as cookie `jwt` (path `/`, `maxAge` 3 days, `sameSite: lax`, `secure` in production).

`verifyToken` in `server/middlewares/AuthMiddleware.js` reads only the `Authorization` bearer token. It does not read cookies. Socket.IO uses the same JWT from `handshake.auth.token`.

### Google sign-in

1. `AuthForm` calls `signIn("google")` from next-auth.
2. `client/src/pages/api/auth/[...nextauth].js` uses `GoogleProvider` and a JWT session. It does not call the Express API.
3. NextAuth’s redirect target in this app is the page `client/src/pages/auth/google-callback.jsx` (the Google button’s callback path is whatever NextAuth is configured to use; the page itself waits for `useSession()`).
4. That page posts `{ email, name }` to `POST /api/auth/oauth-google` (`oauthGoogle`). This route is mounted twice: on the auth router and directly in `routes/index.js`.
5. `oauthGoogle` finds or creates a user, sets `emailVerified: true`, and returns the same marketplace JWT, which the page stores as cookie `jwt`.

The Google flow does not check TOTP. An admin with 2FA enabled can still obtain a JWT through `oauthGoogle` if they use Google with the same email.

### Gig search

`/search` and `/category/[slug]` call `GET /api/gigs/search?searchTerm=&category=` with no auth. `searchGigs` in `GigController` requires at least one of those query params, then `SearchService.fuzzySearch` (`server/services/searchService.js`): a Prisma `findMany` (max 100 gigs, optional category `contains` and title/description/features filters), then Fuse.js re-ranking when a search term is present.

### Checkout and payout

1. `client/src/pages/checkout.jsx` reads `gigId` from the query and posts `POST /api/orders/create` with the bearer token.
2. `createOrder` (`OrderController`) calls `assertUserEmailVerified`. If `REQUIRE_EMAIL_VERIFICATION` is unset, verification is required only when SMTP is fully configured (`requireEmailVerificationEnabled` in `emailVerificationService.js`). It rejects self-purchase and sellers with no `paypalEmail`.
3. `calculateOrderSplit` (`server/utils/payments.js`) takes `PLATFORM_FEE_PERCENT` (default 10, clamped 0–50).
4. If `NODE_ENV !== "production"` and `PAYPAL_SIMULATE_CHECKOUT=true`, `createSimulatedCheckoutOrder` returns an id prefixed `sim_checkout_`. Otherwise `createPayPalCheckoutOrder` in `server/utils/paypal.js` gets an OAuth token from `api-m.sandbox.paypal.com` or `api-m.paypal.com` (`PAYPAL_MODE=live`) and creates a v2 checkout order.
5. Prisma inserts an `Order` with `paymentIntent` set to that PayPal (or simulated) id, `isCompleted: false`, `payoutStatus: "held"`.
6. `PayPalCheckout` either shows PayPal Buttons (`NEXT_PUBLIC_PAYPAL_CLIENT_ID`) or a “simulate” button. Buttons use `createOrder` that returns the existing id (the server already created it). On approve, the client navigates to `/success?orderID=...`. Cancel goes to `/checkout-cancelled`. Error goes to `/payment-failed`.
7. `client/src/pages/success.jsx` polls `GET /api/orders/payment-status/:paymentIntent` and calls `confirmOrderWithRetry` (`client/src/utils/confirmOrder.js`), which `PUT`s `/api/orders/success` with `{ orderID }` up to 4 times.
8. `confirmOrder` checks the caller is `buyerId`, then `completeOrderFromPayPal` (`orderPaymentService.js`). That captures the PayPal order (skipped for `sim_checkout_*`), sets `isCompleted: true`, stores `paypalCaptureId`, leaves `payoutStatus` as `held`, and emails the seller via `notifyOrderPaid` if `notifyOrderEmails` is not false.
9. PayPal can also hit `POST /api/webhooks/paypal` (`handlePayPalWebhook`). It verifies the signature when `PAYPAL_WEBHOOK_ID` is set. In production, a missing webhook id returns 401. It then calls the same `completeOrderFromPayPal`.
10. The buyer clicks release in `ReleasePayoutButton`, which posts `POST /api/orders/:orderId/release-payout`. `releasePayoutToSeller` allows only the buyer, blocks refunds in progress, and calls `executeSellerPayout` (`payoutService.js`). That calls PayPal Payouts (`createPayPalPayout`) unless non-production `PAYPAL_SIMULATE_PAYOUTS=true`, then sets `payoutStatus: "released"`, `paidOutAt`, `payoutBatchId`, and emails the seller.
11. `server/scripts/auto-release-payouts.mjs` does the same for completed orders still `held` whose `createdAt` is older than `AUTO_RELEASE_DAYS` (default 14), 50 at a time. GitHub Action `.github/workflows/auto-release.yml` runs it daily if `DATABASE_URL` is set; if the secret is missing the job exits 0.

### Refund

`RequestRefundButton` posts `POST /api/orders/:orderId/request-refund`. `requestOrderRefund` allows only the buyer, only if paid, not already refunded, and not in `released` / `cancelled` / `refunded`. It sets `refundStatus: "requested"`. Admin `POST /api/admin/orders/:orderId/refund` with `{ action: "approve" | "reject", note }` calls `processRefundAsAdmin`. Approve calls `refundPayPalCapture` (simulated checkout returns a simulated refund without moving money).

### Messages

`MessageContainer` loads `GET /api/messages/get-messages/:orderId`, sends `POST /api/messages/send-message/:orderId` with `{ receiverId, message }`, joins Socket.IO room `order:{orderId}` via `useOrderSocket`, and also polls every 30 seconds. `addMessage` checks the user is buyer or gig owner, writes `Messages`, calls `emitOrderMessage`, and `notifyNewMessage` if the receiver has `notifyMessageEmails` enabled (default true).

## Routes and pages

All of these are files under `client/src/pages`. `_app.jsx` adds navbar, footer, and the chat widget on every page, including admin. Data loads are client-side unless noted.

| Path | File | What it renders | Data |
| --- | --- | --- | --- |
| `/` | `index.js` | Landing sections: HeroBanner, Companies, PopularServices, AdsenseAd, Everything, Services, Business, JoinFreelance | No API. Ad slot from `NEXT_PUBLIC_ADSENSE_HOME_SLOT` |
| `/login` | `login.jsx` | `AuthForm type="login"` | Posts login |
| `/signup` | `signup.jsx` | `AuthForm type="signup"` | Posts signup |
| `/logout` | `logout.jsx` | “Logout successful…” then full navigation to origin | Removes cookie `jwt`, clears user in context |
| `/forgot-password` | `forgot-password.jsx` | Email form | `POST /api/auth/forgot-password` |
| `/reset-password` | `reset-password.jsx` | New password form | Query `token`. `POST /api/auth/reset-password` |
| `/check-email` | `check-email.jsx` | Static “check your email” | None |
| `/verify-email` | `verify-email.jsx` | Verification result | Query `token`. `GET /api/auth/verify-email` |
| `/auth/google-callback` | `auth/google-callback.jsx` | “Completing sign-in…” | NextAuth session, then `POST /api/auth/oauth-google` |
| `/search` | `search.jsx` | Gig grid + search AdSense slot | Query `q`, `category`. `GET /api/gigs/search` |
| `/category/[slug]` | `category/[slug].jsx` | Category heading and gig grid | Slug matched to `categories.js` names, else title-cased. `GET /api/gigs/search?category=` |
| `/gig/[gigId]` | `gig/[gigId].jsx` | Details, Pricing, Reviews, AddReview | `GET /api/gigs/get/:gigId`. If JWT, `GET /api/gigs/check-gig-order/:gigId` |
| `/checkout` | `checkout.jsx` | PayPal or simulate button | Query `gigId`. `POST /api/orders/create` |
| `/success` | `success.jsx` | Payment confirmation states | Query `orderID`. Payment status + confirm |
| `/payment-failed` | `payment-failed.jsx` | Failure copy and links | Query `orderID` displayed only |
| `/checkout-cancelled` | `checkout-cancelled.jsx` | Cancelled copy and links | Query `orderID` displayed only |
| `/favorites` | `favorites.jsx` | Saved gigs | `GET /api/gigs/favorites` |
| `/profile` | `profile.jsx` | Edit username, name, description, image | Uses context user; `POST /api/auth/set-user-info` and `set-user-image` |
| `/account/settings` | `account/settings.jsx` | PayPal email, notification toggles, resend verification, admin TOTP | `POST /api/auth/get-user-info` plus the settings endpoints |
| `/seller` | `seller/index.jsx` | Seller stat cards | `GET /api/dashboard/seller` |
| `/seller/gigs` | `seller/gigs/index.jsx` | Own gigs, delete | `GET /api/gigs`, `DELETE /api/gigs/:gigId` |
| `/seller/gigs/create` | `seller/gigs/create.jsx` | Gig form with images | `POST /api/gigs/add` multipart |
| `/seller/gigs/[gigId]` | `seller/gigs/[gigId].jsx` | Edit gig (component is named `create`) | `GET /api/gigs/get/:gigId`, `PUT /api/gigs/edit/:gigId` |
| `/seller/orders` | `seller/orders/index.jsx` | Orders on the user’s gigs | `GET /api/orders/get-seller-orders` |
| `/seller/orders/messages/[orderId]` | `seller/orders/messages/[orderId].jsx` | `MessageContainer` | Messages API + socket. `orderId` comes from the router inside the container |
| `/seller/unread-messages` | `seller/unread-messages.jsx` | Unread list | `GET /api/messages/unread-messages`, `PUT /api/messages/mark-as-read/:messageId` |
| `/seller/[username]` | `seller/[username].jsx` | Public seller profile and gigs | `GET /api/auth/profile/:username` |
| `/buyer/orders` | `buyer/orders/index.jsx` | Buyer orders, release and refund buttons | `GET /api/orders/get-buyer-orders` |
| `/buyer/orders/messages/[orderId]` | `buyer/orders/messages/[orderId].jsx` | Same `MessageContainer` | Same as seller thread |
| `/buyer/unread-messages` | `buyer/unread-messages.jsx` | Same unread UI as seller | Same unread endpoints |
| `/admin` | `admin/index.jsx` | Tabs for overview, users, orders, gigs, tickets | Five admin GETs; mutations listed in the API section |
| `/contact` | `contact.jsx` | Support form | `POST /api/support/contact` |
| `/help` | `help.jsx` | Static FAQ-style headings (topics are labels, not linked articles) | None |
| `/how-it-works` | `how-it-works.jsx` | Buyer and seller step lists | None |
| `/pricing` | `pricing.jsx` | Fee explanation copy | None. The percent itself is computed on the server |
| `/terms` | `terms.jsx` | Terms of Service text | None |
| `/privacy` | `privacy.jsx` | Privacy Policy text | None |
| `/dev` | `dev.jsx` | Link list for local pages | `getServerSideProps` redirects to `/` in production. Middleware does the same |
| `/404` | `404.jsx` | Custom not-found page | None |
| `/api/ai-chat` | `api/ai-chat.js` | Not a page | See API section |
| `/api/auth/*` | `api/auth/[...nextauth].js` | Not a page | NextAuth Google |

`NavBar` links seller mode to `/seller`, gigs, orders, unread messages, and buyer mode to orders, unread, favorites. Admin link appears when `userInfo.isAdmin` is true. A “Dev pages” link to `/dev` is rendered only when `NODE_ENV === "development"`.

## API and server endpoints

Express app is `server/app.js`. Global middleware: helmet, morgan (`combined` in production, `dev` otherwise), cookie-parser, JSON and urlencoded bodies limited to 1mb, rate limits, CORS. Auth limiter: 40 requests / 15 min in production, 200 otherwise, on `/api/auth`. API limiter: 300 / 15 min in production, 1000 otherwise, on `/api` except paths starting with `/webhooks`. Routes mount at `/` via `server/routes/index.js`. Unknown paths throw `AppError(404)`. `errorHandler` returns `{ status, message }` and, if `SENTRY_DSN` is set, POSTs a minimal payload to Sentry’s store API (no Sentry SDK).

Auth means `verifyToken`: bearer JWT, sets `req.userId` and `req.userEmail`. Admin means that plus `verifyAdmin`: user exists, `isActive`, `isAdmin`.

| Method | Path | File / function | Auth | Reads / writes |
| --- | --- | --- | --- | --- |
| GET | `/` | `app.js` | No | Text “FreelanceX API Playground” |
| GET | `/ping` | `routes/index.js` | No | Text `pong` |
| GET | `/api/health` | `routes/index.js` | No | `prisma.$runCommandRaw({ ping: 1 })`. 200 `{ ok, service, database }` or 503 |
| GET | `/uploads/profiles/*`, `/uploads/*` | `routes/index.js` | No | Static files if present |
| POST | `/api/auth/signup` | `AuthControllers.signup` | No | Creates `User`, sends verification email, returns JWT |
| POST | `/api/auth/login` | `login` | No | Checks password, active, optional email verification, optional admin TOTP. Returns JWT |
| POST | `/api/auth/oauth-google` | `oauthGoogle` | No | Find or create user by email, mark email verified, return JWT. Also mounted at the same path from `routes/index.js` |
| POST | `/api/auth/forgot-password` | `requestPasswordReset` | No | Always 200 generic message. If user exists, writes `PasswordResetToken` (1 hour) and emails link |
| POST | `/api/auth/reset-password` | `resetPassword` | No | Body `{ token, password }`. Updates password, marks token used |
| GET or POST | `/api/auth/verify-email` | `verifyEmail` | No | Query or body `token`. Sets `emailVerified` |
| POST | `/api/auth/get-user-info` | `getUserInfo` | JWT | Reads user by id, fallback by email. Strips `password` and `totpSecret` |
| GET | `/api/auth/profile/:username` | `getPublicProfile` | No | User plus gigs and reviews. Strips password, isAdmin, passwordResets, totpSecret |
| POST | `/api/auth/set-user-info` | `setUserInfo` | JWT | Body `userName`, `fullName`, `description`. Sets `isProfileInfoSet` |
| POST | `/api/auth/set-user-image` | `setUserImage` | JWT + `uploadSingle` field `images` | Writes Cloudinary URL to `profileImage` |
| POST | `/api/auth/set-paypal-email` | `setPaypalEmail` | JWT | Lowercases email if it matches a simple regex |
| POST | `/api/auth/resend-verification` | `resendVerificationEmail` | JWT | New token and email if not already verified |
| POST | `/api/auth/set-notification-preferences` | `setNotificationPreferences` | JWT | Booleans `notifyOrderEmails`, `notifyMessageEmails` |
| POST | `/api/auth/2fa/setup` | `setupAdminTotp` | JWT + `isAdmin` | Stores new `totpSecret`, `totpEnabled: false`. Returns secret and otpauth URL |
| POST | `/api/auth/2fa/enable` | `enableAdminTotp` | JWT + admin with secret | Body `totpCode`. Sets `totpEnabled` |
| POST | `/api/auth/2fa/disable` | `disableAdminTotp` | JWT + admin | Body `totpCode` if currently enabled. Clears secret |
| POST | `/api/gigs/add` | `GigController.addGig` | JWT + `upload.array("images", 5)` | **Fields are read from `req.query`**, not the body: title, description, category, features, price, revisions, time, shortDesc. Images from Cloudinary |
| GET | `/api/gigs` | `getAllUserGigs` | JWT | Gigs where `userId` is the caller |
| GET | `/api/gigs/get/:gigId` | `getGigById` | No | Gig, creator (no password), reviews |
| PUT | `/api/gigs/edit/:gigId` | `updateGig` | JWT + images | Owner only. Query fields plus optional new images |
| DELETE | `/api/gigs/:gigId` | `deleteOwnGig` | JWT | Owner only. Refuses if any order exists. Deletes favorites and reviews first |
| GET | `/api/gigs/search` | `searchGigs` | No | Query `searchTerm` and/or `category` |
| GET | `/api/gigs/check-gig-order/:gigId` | `checkGigOrder` | JWT | `{ hasUserOrderedGig }` for a completed order |
| POST | `/api/gigs/review/:gigId` | `addReview` | JWT | Body `reviewText`, `rating`. Requires a completed order |
| GET | `/api/gigs/favorites` | `getFavorites` | JWT | Caller’s favorites with gig, creator, reviews |
| POST | `/api/gigs/favorites` | `addFavorite` | JWT | Body `gigId`. Idempotent if already saved |
| DELETE | `/api/gigs/favorites/:gigId` | `removeFavorite` | JWT | Deletes the favorite row |
| POST | `/api/orders/create` | `OrderController.createOrder` | JWT | Body `gigId`. Creates PayPal or simulated order and `Order` row |
| GET | `/api/orders/payment-status/:paymentIntent` | `getPaymentStatus` | JWT | Buyer only. `{ isCompleted, payoutStatus, orderId }` |
| PUT | `/api/orders/success` | `confirmOrder` | JWT | Body `orderID` or `paymentIntent`. Buyer only. Captures payment |
| POST | `/api/orders/:orderId/release-payout` | `releasePayoutToSeller` | JWT | Buyer only. PayPal payout or simulation |
| POST | `/api/orders/:orderId/request-refund` | `RefundController.buyerRequestRefund` | JWT | Body `reason`. Buyer only |
| GET | `/api/orders/get-buyer-orders` | `getBuyerOrders` | JWT | Orders where `buyerId` is caller, with gig and seller |
| GET | `/api/orders/get-seller-orders` | `getSellerOrders` | JWT | Completed and incomplete orders on caller’s gigs |
| GET | `/api/dashboard/seller` | `DashboardController.getSellerData` | JWT | Counts and sums of `sellerEarningsAmount` |
| POST | `/api/messages/send-message/:orderId` | `MessagesController.addMessage` | JWT | Body `receiverId`, `message`. Participant only |
| GET | `/api/messages/get-messages/:orderId` | `getMessages` | JWT | Participant only. Marks nothing read by itself |
| GET | `/api/messages/unread-messages` | `getUnreadMessages` | JWT | Messages where `receiverId` is caller and `isRead` is false |
| PUT | `/api/messages/mark-as-read/:messageId` | `markAsRead` | JWT | Receiver only |
| POST | `/api/support/contact` | `SupportController.createSupportTicket` | No | Body `email`, `subject`, `message`. Inserts ticket, emails `SUPPORT_EMAIL` or `SMTP_FROM` |
| POST | `/api/webhooks/paypal` | `WebhookController.handlePayPalWebhook` | PayPal signature when `PAYPAL_WEBHOOK_ID` is set; required in production | Completes the order for the id found in the event |
| GET | `/api/admin/overview` | `AdminController.getAdminOverview` | Admin | Counts, payout aggregates, 8 recent orders, 5 open tickets |
| GET | `/api/admin/users` | `getAdminUsers` | Admin | Users without secrets, with gig and order counts |
| GET | `/api/admin/users/:userId` | `getAdminUserDetails` | Admin | One user plus related gigs and orders |
| PATCH | `/api/admin/users/:userId/status` | `updateUserStatus` | Admin | Body `{ isActive }`. Cannot target self |
| PATCH | `/api/admin/users/:userId/role` | `updateUserRole` | Admin | Body `{ isAdmin }`. Cannot target self |
| GET | `/api/admin/orders` | `getAdminOrders` | Admin | Orders with buyer and gig |
| PATCH | `/api/admin/orders/:orderId/status` | `updateOrderStatus` | Admin | Body `{ isCompleted }` |
| POST | `/api/admin/orders/:orderId/release-payout` | `adminReleaseOrderPayout` | Admin | Same payout service, no buyer check |
| POST | `/api/admin/orders/:orderId/refund` | `adminProcessRefund` | Admin | Body `{ action, note }`. `action` is `approve` or `reject` |
| GET | `/api/admin/gigs` | `getAdminGigs` | Admin | All gigs |
| DELETE | `/api/admin/gigs/:gigId` | `deleteGigAsAdmin` | Admin | Deletes the gig (does not use the “no orders” guard in `deleteOwnGig`; see that function if delete fails on relations) |
| GET | `/api/admin/tickets` | `getAdminSupportTickets` | Admin | All tickets |
| PATCH | `/api/admin/tickets/:ticketId/status` | `resolveSupportTicket` | Admin | Sets status and `resolvedAt` |

Next.js route handlers (not Express):

| Method | Path | File | Auth | Behavior |
| --- | --- | --- | --- | --- |
| * | `/api/auth/[...nextauth]` | `client/src/pages/api/auth/[...nextauth].js` | NextAuth | Google provider only |
| POST | `/api/ai-chat` | `client/src/pages/api/ai-chat.js` | None | Body `{ messages, context }`. Proxies to OpenRouter model `deepseek/deepseek-v4-flash` with `AGENT_API`. 405 otherwise |

Socket.IO (`server/socket/socketServer.js`), path `/socket.io`:

- Middleware requires a JWT.
- Client event `join:order` with `{ orderId }`: joins room `order:{orderId}` only if the socket user is the buyer or the gig owner.
- Client event `leave:order`.
- Server emit `message:new` with `{ message }` from `emitOrderMessage`.

## Data model

Prisma MongoDB models in `server/prisma/schema.prisma`. Ids are `@db.ObjectId` mapped to `_id`.

**User:** `email` unique, `password` (hash, including a random hash for Google-created users), `username` unique optional, `fullName`, `description`, `profileImage`, `isProfileInfoSet` default false, `isAdmin` default false, `isActive` default true, `paypalEmail`, `emailVerified` default false, `emailVerifyToken`, `emailVerifyExpiresAt`, `totpSecret`, `totpEnabled` default false, `notifyOrderEmails` default true, `notifyMessageEmails` default true, `createdAt`. Relations: gigs, orders (as buyer), reviews, messages sent/received, password reset tokens, favorites.

Signup sets `username` to the email local-part plus `fx` (`authService.registerUser`). Google signup uses the local-part plus `ff`, with a numeric suffix on collision.

**Gig:** `title`, `description`, `category`, `deliveryTime`, `revisions`, `features` string array, `price` float, `shortDesc`, `createdAt`, `images` string array, `userId`.

**Order:** `buyerId`, `paymentIntent` unique (PayPal order id or `sim_checkout_...`), `isCompleted` default false, `payoutStatus` default `"held"` (comments also mention `released` and `failed`; refund code also writes `refunded`), `platformFeeAmount`, `sellerEarningsAmount`, `paypalCaptureId`, `paypalRefundId`, `buyerApprovedAt`, `paidOutAt`, `payoutBatchId`, `payoutError`, `refundStatus` default `"none"` (`requested`, `approved`, `rejected`, `completed` are used in code), `refundReason`, `refundRequestedAt`, `refundProcessedAt`, `refundNote`, `gigId`, `price` int, `createdAt`.

**Reviews:** `rating` int, `comment` optional, `gigId`, `reviewerId`, `createdAt`.

**Messages:** `text`, `isRead` default false, `senderId`, `receiverId`, `orderId`, `createdAt`.

**PasswordResetToken:** `token` unique, `userId`, `expiresAt`, `used` default false.

**Favorite:** `userId`, `gigId`, `createdAt`. No compound unique in the schema; `addFavorite` checks for an existing row first.

**SupportTicket:** `email`, `subject`, `message`, `status` default `"open"`, `resolvedAt`, `createdAt`.

`server/prisma/seed.js` wipes messages, reviews, orders, gigs, and users, then inserts sellers and gigs. It does not seed favorites, tickets, or admins. The demo password is a literal in that file.

## Auth and permissions

Passwords are bcrypt hashes (`bcryptjs`, salt from `genSalt()` with default rounds). Login compares with `compare`. Inactive users (`isActive === false`) cannot log in or use Google. They get 403 “Your account is deactivated.”

The session is a JWT in cookie `jwt`, sent as `Authorization: Bearer`. Payload is `{ email, userId }`. There is no refresh-token endpoint. `JWT_REFRESH_SECRET` and `JWT_REFRESH_EXPIRES_IN` are only validated or stored on the `Env` object.

Email verification: 32 random bytes, hex, 24-hour expiry, link `{PUBLIC_URL}/verify-email?token=`. Enforced on login and on `createOrder` when SMTP is configured, unless `REQUIRE_EMAIL_VERIFICATION=false`. `REQUIRE_EMAIL_VERIFICATION=true` forces the check even if you expected SMTP to be optional. Google accounts are created with `emailVerified: true`.

Admin TOTP is implemented in `server/utils/totp.js` (base32 secret, 30-second step, window of 1). It is not a third-party library. Login checks it only when `isAdmin && totpEnabled`. Setup and disable live on `/account/settings` via `AdminTwoFactor`.

What an admin can do is exactly the `/api/admin/*` routes plus 2FA endpoints. There is no permission matrix. A normal user who is not `isAdmin` gets 403 from `verifyAdmin`.

`getPublicProfile` removes `isAdmin` from the JSON. `getUserInfo` does not, so the navbar can show the admin link.

## Important files, explained

### Client app shell

`client/src/pages/_app.jsx` is the only layout. It loads AdSense’s script when `NEXT_PUBLIC_ADSENSE_CLIENT` is set, sets the document title to “ffiver”, and mounts `AIChatBot` globally. `client/src/pages/_document.js` loads Inter and Outfit from Google Fonts. `client/middleware.js` only guards `/dev`.

`client/src/context/StateContext.jsx` is a thin `useReducer` context. `StateReducer.js` holds `showLoginModal`, `showSignupModal`, `userInfo`, `isSeller`, `gigData`, `hasOrdered`, `reloadReviews`. `context/constants.js` exports the action type strings. `NavBar.jsx` is the largest shell component: it fetches the user, toggles seller mode, opens auth modals, and links buyer vs seller routes. `Footer.jsx` links to how-it-works, help, contact, terms, privacy, and hardcoded social URLs (`x.com/ffiver`, LinkedIn company `ffiver`, Instagram `ffiveruk`, Facebook). `AIChatBot.jsx` posts the visible conversation to `/api/ai-chat`. `AdsenseAd.jsx` renders nothing unless both client id and slot are set. `AuthForm.jsx` is login, signup, TOTP second step, and the Google button. `AdminTwoFactor.jsx` calls the three 2FA routes. `ContextMenu.jsx` is a small menu used from the navbar area. `ImageUpload.jsx` is the file picker used by gig and profile forms.

Landing components under `client/src/components/Landing/` (`HeroBanner`, `Companies`, `PopularServices`, `Everything`, `Services`, `Business`, `JoinFreelance`) are presentational. They do not fetch gigs. Category chips come from `client/src/utils/categories.js` (ten names: Graphic Design, Digital Marketing, Writing & Translation, Video & Animation, Music & Audio, Programming & Tech, Business, Lifestyle, Data, Photography).

Gig UI: `Gigs/Details.jsx`, `Gigs/Pricing.jsx` (checkout link), `Gigs/Reviews.jsx`, `Gigs/AddReview.jsx` (posts a review and dispatches `ADD_REVIEW`). Search cards are `search/SearchGridItem.jsx` (favorite toggle). Orders: `orders/ReleasePayoutButton.jsx`, `orders/RequestRefundButton.jsx`, labels in `utils/orderStatus.js`. Messages: `Messages/MessageContainer.jsx` plus `hooks/useOrderSocket.js`. Admin widgets: `admin/AdminStatCard.jsx` and `admin/adminUtils.js` (formatting helpers used by `pages/admin/index.jsx`).

`utils/constants.js` is the API map. `utils/confirmOrder.js` retries capture. `utils/get-env.js` is a small client helper. `utils/Loading.jsx` and `utils/AnimatedText.jsx` are presentational. `utils/categories.js` is the category list used by landing, search, and category pages.

`client/e2e/home.spec.js` expects the title to match `/ffiver/i`. `client/e2e/auth.spec.js` covers the auth pages. `client/public/ADSENSE.md` documents the AdSense env names. `client/public/ads.txt` is the AdSense authorization file.

### Server entry and HTTP

`server/index.js` validates production env, creates the HTTP server, and calls `createSocketServer`. `server/app.js` is middleware, Prisma connect, the router, 404, and the error handler. `server/loadEnv.js` loads `.env`. `server/prisma/client.js` exports one `PrismaClient`. `server/routes/index.js` mounts routers and the health check. Each file in `server/routes/` only wires paths to controllers; the behavior is in the controllers named above.

`server/middlewares/AuthMiddleware.js` is `verifyToken`. `server/middlewares/AdminMiddleware.js` is `verifyAdmin`.

### Controllers and services

`AuthControllers.js` is signup, login, profile, password reset, Google bridge, email verification, PayPal email, notification prefs, and TOTP. It calls `authService`, `emailVerificationService`, `mailer.sendMail`, `payments.isValidPaypalEmail`, and `totp.js`.

`GigController.js` is CRUD, search, reviews, and favorites. Search delegates to `SearchService`. Image deletes on update use the Cloudinary SDK.

`OrderController.js` creates and confirms orders, reads payment status, lists buyer and seller orders, and releases payouts. It calls `paypal.js`, `payments.js`, `payoutService.js`, `orderPaymentService.js`, and `emailVerificationService.js`.

`RefundController.js` is a thin wrapper around `refundService.js`. `WebhookController.js` verifies and completes PayPal events. `MessagesController.js` checks participation via `assertOrderParticipant`, writes messages, emits on the socket, and notifies. `DashboardController.js` aggregates seller counts and earnings. `SupportController.js` writes tickets and emails support. `AdminController.js` is the admin read and mutation surface; payout release reuses `payoutService`.

`authService.js` registers and logs in users. `emailVerificationService.js` creates tokens and decides whether verification is required. `orderPaymentService.js` is the idempotent capture used by both the buyer confirm route and the webhook. `payoutService.js` sends seller earnings. `refundService.js` requests and processes refunds, including PayPal capture refund. `searchService.js` is the Fuse-backed search class (default export).

### PayPal, mail, sockets, scripts

`server/utils/paypal.js` is the PayPal REST client: access token cache, create/get/capture order, payouts, refunds, webhook verification, and the simulate-checkout helpers. `server/utils/payments.js` is the fee split and email regex. `server/utils/mailer.js` builds a nodemailer transport only when all five SMTP variables are set; otherwise `sendMail` logs and returns. `server/utils/notifications.js` sends order, payout, message, and refund emails and checks user preferences. `server/utils/totp.js` is the authenticator implementation. `server/utils/errorHandler.js` plus `AppError.js` and `handleServiceError.js` are the error path. `server/utils/logger.js` is `debug` namespaces `app:search`, `app:db`, `app:api`. `server/utils/get-env.js` throws in production when a required key is missing (used by `env.config.js`). `server/utils/validate-env.js` is the production startup check and CORS origin parser. `server/utils/index.js` re-exports `AppError`, `errorHandler`, and `handleServiceError`.

`server/config/cloudinary.config.js` configures Cloudinary and two multer instances (`upload` up to 5 images, `uploadSingle` for avatars). JPEG and PNG only, 5MB. Folder name is `freelanceX`.

`server/socket/socketServer.js` owns the Socket.IO server and `emitOrderMessage`. `server/scripts/smoke-test.mjs` and `smoke-lib.mjs` hit a running API. `server/scripts/auto-release-payouts.mjs` is the payout cron. `server/scripts/SMOKE_TEST.md` documents the smoke env names.

## Integrations

**PayPal.** Server: `server/utils/paypal.js`, used by order create, capture, payout, refund, and webhook verify. Client: `PayPalCheckout.jsx` with `@paypal/react-paypal-js` and `NEXT_PUBLIC_PAYPAL_CLIENT_ID`. Brand name defaults to `ffiver` (`PAYPAL_BRAND_NAME`). Sandbox unless `PAYPAL_MODE=live`.

**Cloudinary.** `server/config/cloudinary.config.js`. Gig and profile uploads. `next.config.js` allows `res.cloudinary.com` images.

**SMTP / Nodemailer.** `server/utils/mailer.js`. Used for verification, password reset, support tickets, and `notifications.js` (order paid, payout released, new message, refund updates).

**Google OAuth.** NextAuth only, then the Express bridge. Not used as the session for API calls.

**OpenRouter.** `client/src/pages/api/ai-chat.js`, model `deepseek/deepseek-v4-flash`, key `AGENT_API`. The chatbot is mounted for every page in `_app.jsx`. There is no auth on this route.

**AdSense.** Script in `_app.jsx`. Slots on `/` and `/search`. `client/public/ads.txt` must match the publisher id. `AdsenseAd` renders nothing without both client and slot.

**Sentry.** Optional. `errorHandler` posts to the DSN’s store URL if `SENTRY_DSN` is set. No SDK.

**Socket.IO.** Same process as Express. Client URL is `NEXT_PUBLIC_SOCKET_URL` or `NEXT_PUBLIC_SERVER_URL` or `http://localhost:5001`.

## Background work and SEO

There is no sitemap, `robots.txt`, or structured data in the client. The document title is the static string “ffiver” in `_app.jsx`. Pages do not export `metadata` or `Head` titles of their own (except the shared title).

Scheduled work:

- GitHub Action `auto-release.yml`: cron `0 3 * * *`, runs `server/scripts/auto-release-payouts.mjs`.
- The script can also be run with `pnpm run auto-release`.
- It selects by `createdAt`, not by `buyerApprovedAt`. A newly paid order whose row was created earlier than the cutoff is eligible. Orders are created at checkout, before capture, so the clock starts at order creation.

CI (`.github/workflows/ci.yml`) on push and PR to `main` or `master`: server `pnpm install` and `prisma generate` (dummy `DATABASE_URL`), client production build, Playwright chromium e2e. It does not run the smoke test.

## Deeper behavior

One paid order crosses these pages and routes. `isCompleted` means PayPal capture succeeded (or the simulated checkout skipped capture). It is not a delivery flag. Approving delivery is `releasePayoutToSeller`, which moves `payoutStatus` off `"held"`. There is no separate delivered status on `Order`.

1. **Gig create.** Page `client/src/pages/seller/gigs/create.jsx`. The button calls `addGig`, which requires category, description, title, at least one feature, at least one file, `price > 0`, a short description, `revisions > 0`, and `time > 0`. Files go in `FormData` as `images`. Title, description, category, features, price, revisions, time, and shortDesc go in the axios `params` object (query string), with `Authorization: Bearer` from the `jwt` cookie. Route `POST /api/gigs/add` (`GigController.addGig`). When `req.files` and `req.query` are set it stores Cloudinary `file.path` values and `prisma.gig.create` with `deliveryTime: parseInt(time)`, `price: parseInt(price)`, `revisions: parseInt(revisions)`, and `createdBy` the JWT user. Response 201 is the text `"Successfuly created the gig."` The page then routes to `/seller/gigs` (`client/src/pages/seller/gigs/index.jsx`).

2. **Purchase.** Public gig page `client/src/pages/gig/[gigId].jsx`. `client/src/components/Gigs/Pricing.jsx` pushes `/checkout?gigId=`. `client/src/pages/checkout.jsx` POSTs `{ gigId }` to `POST /api/orders/create` with the bearer cookie. `OrderController.createOrder` returns 403 `EMAIL_NOT_VERIFIED` when `assertUserEmailVerified` fails, 400 when `gigId` is missing, 404 when the gig is missing, 400 `SELF_PURCHASE` when `gig.userId` is the buyer, and 400 `SELLER_PAYOUT_NOT_CONFIGURED` when the seller has no `paypalEmail`. `calculateOrderSplit` sets `platformFeeAmount` and `sellerEarningsAmount`. `isSimulateCheckoutEnabled()` picks `createSimulatedCheckoutOrder` or `createPayPalCheckoutOrder`. `prisma.order.create` sets `paymentIntent` to that PayPal (or `sim_checkout_`) id, `price` to `Math.round` of the gig price, `payoutStatus: "held"`, and connects buyer and gig. The JSON is `{ orderId, platformFee, sellerEarnings, feePercent, simulate }`. `PayPalCheckout` does not create a second PayPal order: `createOrder` returns the id from step 2. `onApprove` routes to `/success?orderID=`. Simulated checkout skips the PayPal script and navigates to the same success URL. Cancel goes to `/checkout-cancelled?orderID=`. Missing `NEXT_PUBLIC_PAYPAL_CLIENT_ID` renders an error and does not call PayPal.

3. **Capture.** `client/src/pages/success.jsx` calls `confirmOrderWithRetry` (`client/src/utils/confirmOrder.js`): up to 4 `PUT /api/orders/success` attempts with body `{ orderID }` and the bearer cookie, delays 800ms times the attempt number. `OrderController.confirmOrder` loads `Order` by `paymentIntent`, returns 403 when `buyerId` is not the caller, and calls `completeOrderFromPayPal`. If the PUT never succeeds, the page polls `GET /api/orders/payment-status/:paymentIntent` up to 8 times, 1.5 seconds apart, and treats `isCompleted` as confirmed. It then sends the browser to `/buyer/orders`.

4. **Webhook.** `POST /api/webhooks/paypal` is `WebhookController.handlePayPalWebhook` (`server/controllers/WebhookController.js`). The body must have `event_type` or the handler returns 400 `"Invalid webhook payload"`. In production, a missing `PAYPAL_WEBHOOK_ID` returns 401 `"PAYPAL_WEBHOOK_ID is required in production"`. When `PAYPAL_WEBHOOK_ID` is set, `verifyPayPalWebhookSignature` must return true or the handler returns 401 `"Invalid PayPal webhook signature"`. When the variable is unset and `NODE_ENV` is not production, verification is skipped. `extractPayPalOrderId` returns `resource.supplementary_data.related_ids.order_id` when present, otherwise `resource.id` when `event_type` contains `"CHECKOUT.ORDER"`, otherwise null. A null id returns 200 `{ received: true, handled: false }` and does not write. Any other id is passed to `completeOrderFromPayPal`, and the response is 200 `{ received, handled: result.ok, alreadyCompleted, event_type }`. A thrown error is 500 `"Webhook processing failed"`.

`completeOrderFromPayPal` (`server/services/orderPaymentService.js`) finds `Order` by `paymentIntent`. Missing order returns `{ ok: false, code: "NOT_FOUND" }` (the webhook still responds 200 with `handled: false`). If `isCompleted` is already true it returns `alreadyCompleted: true` and does not capture again. Ids that `isSimulatedCheckoutOrderId` recognizes skip the PayPal API and store `paypalCaptureId` `sim_capture_{order.id}` when none exists. Otherwise `capturePayPalOrder` runs. A failed capture still succeeds if `getPayPalOrder` reports status `"COMPLETED"` (already captured). Any other capture failure returns `CAPTURE_FAILED`, which `confirmOrder` turns into HTTP 502. The update sets `isCompleted: true`, keeps `payoutStatus` `"released"` if it already was, otherwise `"held"`, and stores `paypalCaptureId` from `extractCaptureDetails`. `notifyOrderPaid` emails and logs a failure without failing the update.

5. **Delivery.** Buyer list `client/src/pages/buyer/orders/index.jsx` loads `GET /api/orders/get-buyer-orders` (completed orders only). `ReleasePayoutButton` POSTs `POST /api/orders/:orderId/release-payout`. `releasePayoutToSeller` allows only `buyerId`, refuses `refundStatus` `requested` or `approved` and `payoutStatus` `"refunded"`, and calls `executeSellerPayout`. The success message is `"Payment released to the seller's PayPal account."` Thread pages are `client/src/pages/buyer/orders/messages/[orderId].jsx` and `client/src/pages/seller/orders/messages/[orderId].jsx`, which call `POST /api/messages/send-message/:orderId` and `GET /api/messages/get-messages/:orderId`. That is the in-app delivery conversation. Seller orders are `client/src/pages/seller/orders/index.jsx` via `GET /api/orders/get-seller-orders`.

6. **Review.** `client/src/components/Gigs/AddReview.jsx` on the gig page POSTs `{ reviewText, rating }` to `POST /api/gigs/review/:gigId`. `GigController.addReview` calls `checkOrder`, which is a completed order (`isCompleted: true`) for that buyer and gig. It does not check `payoutStatus`. It creates `Reviews` with `rating` parsed as an integer, `comment` from `reviewText`, and connections to the reviewer and the gig. The component dispatches `ADD_REVIEW` on HTTP 201.

## Known sharp edges

These are visible in the code or in `REMAINING.md` / `PAYMENTS.md`. They are not guesses about future work.

- Public name is ffiver; folder, Prisma Cloudinary folder, and health `service` string are freelanceX. Password-reset copy in `AuthControllers.js` hardcodes “ffiver” even though verification mail uses `PAYPAL_BRAND_NAME`.
- `JWT_EXPIRES_IN` is not applied. Access tokens use a hardcoded 3-day `maxAge`. Refresh secret env vars are unused.
- `BASE_PATH` and `FRONTEND_ORIGIN` are unused. CORS is `PUBLIC_URL`.
- `oauthGoogle` does not ask for a TOTP code, so admin 2FA does not cover Google sign-in.
- `createOrder` / gig create read gig fields from the query string while files travel as multipart. `features` is passed through to Prisma, which expects `String[]`. If the client sends a comma-separated string, behavior depends on query parsing.
- `addGig` returns before images are validated beyond multer; the smoke test inserts gigs in the database because the HTTP create path needs Cloudinary (`REMAINING.md`).
- Simulated checkout (`PAYPAL_SIMULATE_CHECKOUT`) and simulated payouts (`PAYPAL_SIMULATE_PAYOUTS`) only run when `NODE_ENV !== "production"`. The success page still calls `completeOrderFromPayPal`, which skips capture for `sim_checkout_` ids.
- Production webhooks are rejected when `PAYPAL_WEBHOOK_ID` is unset. Non-production webhooks are accepted without signature verification when that variable is unset.
- Auto-release uses `createdAt` and processes at most 50 orders per run. If `DATABASE_URL` is missing, the GitHub Action exits 0 and does not fail the workflow.
- `deleteGigAsAdmin` does not repeat the “has orders” check. Prisma relations may still reject the delete; `deleteOwnGig` is the path that deletes favorites and reviews first.
- Admin is a manual MongoDB flag. Seed users are not admins.
- Seed script deletes all users, gigs, orders, reviews, and messages before inserting demo data.
- `/help` lists question titles and does not load articles.
- `/dev` links to `/category/logo-design`, which is not one of the ten category slugs. The page still title-cases the slug and searches with that string.
- `next.config.js` falls back to hostname `freelancex.onrender.com` for images when production `NEXT_PUBLIC_SERVER_URL` is not a valid URL. The build already throws if the variable is empty, so this branch is only for a non-empty unparsable value.
- AI chat route has no authentication and no rate limit (the Express API limits do not apply to Next.js routes).
- `getUserInfo` is a POST, not a GET.
- Email verification turns on automatically when SMTP env vars are all set. `REMAINING.md` says to set `REQUIRE_EMAIL_VERIFICATION=false` to keep it off.
- Buyer and seller unread pages and message pages are duplicated files that call the same endpoints.
- `client/.env.example` omits `NEXT_PUBLIC_SOCKET_URL`; `client/env.example` includes it. The code falls back to `NEXT_PUBLIC_SERVER_URL`.
