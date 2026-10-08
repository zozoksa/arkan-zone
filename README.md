# Arkan Zone

Arabic-first (RTL) e-learning platform: course catalogue, real accounts, paid checkout with Paymob, protected video lessons, progress tracking, certificates, reviews, notifications and an admin panel.

> **دليل التشغيل والنشر بالعربي خطوة بخطوة:** [`SETUP-AR.md`](SETUP-AR.md)

## Stack

| Layer | Tools |
| --- | --- |
| Frontend | React 19, Vite 7, JavaScript/JSX, Tailwind CSS v4, React Router 7, Lucide |
| Backend | Node.js 22, Express 5, Knex, JWT, bcrypt, zod, helmet, rate limiting, multer, nodemailer |
| Database | SQLite in development (zero setup), PostgreSQL in production (MySQL also supported) |
| Payments | Paymob (cards, wallets, kiosk) + a local mock gateway for development |
| Video | Bunny Stream with signed, expiring embed URLs |
| Quality | ESLint, Vitest (frontend), node:test + supertest (API), tested on SQLite and PostgreSQL |

## Quick start (development)

Requires Node.js 22+.

```bash
npm run setup                          # installs frontend + API
cp .env.example .env
cp server/.env.example server/.env
npm run server                         # terminal 1 → http://localhost:5000/api
npm run dev                            # terminal 2 → http://localhost:5173
```

On first start the API creates `server/storage/arkan.sqlite`, runs migrations and seeds the catalogue.

| Account | Email | Password |
| --- | --- | --- |
| Admin | `admin@arkanzone.com` | `Admin@12345` |
| Student (dev only) | `demo@arkanzone.com` | `123456` |

In development, without SMTP/Paymob/Bunny keys:
- **Emails** (verification, password reset, receipts, certificates) are printed in the API terminal, including their links.
- **Payments** use a mock gateway page (`/checkout/mock/:id`) where you choose success or failure. Coupon `WELCOME20` gives 20% off.
- **Lessons** show a placeholder until a video is linked.

## Features

**Students:** register/login (JWT), email verification, forgot/reset password, profile with avatar upload and password change, free enrolment, paid checkout with coupons, purchase history, lesson player with progress saved on the server, automatic certificate on completion (public verification page, prints to a single A4 PDF), course reviews (enrolled students only, one per course), favorites, in-app notifications, dashboard with stats, streak and activity.

**Admin (`/admin`):** revenue and enrollment stats with a 14-day chart, orders (filter by status), users (search, promote/demote admin), coupons (create, limit uses, expiry, enable/disable), contact-form inbox.

**Platform:** RTL Arabic UI, light/dark themes, responsive 320px → 1440px+, per-page SEO meta, optional Google Analytics 4 / Microsoft Clarity, FAQ, privacy, terms and refund-policy pages.

## Configuration

All variables are documented in `.env.example` (frontend) and `server/.env.example` (API). The important ones:

| Variable | Where | Purpose |
| --- | --- | --- |
| `VITE_API_URL` | frontend | API base URL (`/api` behind nginx) |
| `DB_CLIENT`, `DATABASE_URL` / `DB_FILENAME` | API | `better-sqlite3` (dev) or `pg` (prod) |
| `JWT_SECRET` | API | **Required in production** |
| `ADMIN_EMAIL`, `ADMIN_PASSWORD` | API | Admin account created on first start |
| `CLIENT_URL`, `API_PUBLIC_URL` | API | Used in emails, payment redirects and the webhook URL |
| `SMTP_*`, `MAIL_FROM` | API | Transactional email |
| `PAYMOB_SECRET_KEY`, `PAYMOB_PUBLIC_KEY`, `PAYMOB_HMAC_SECRET`, `PAYMOB_INTEGRATION_IDS` | API | Enables real payments |
| `BUNNY_LIBRARY_ID`, `BUNNY_TOKEN_KEY` | API | Enables video playback |
| `VITE_GA_ID`, `VITE_CLARITY_ID` | frontend | Optional analytics |

## Payments (Paymob)

1. Create a Paymob account and get the **secret key**, **public key**, **HMAC secret** and the **integration IDs** for the methods you want (card, wallet, kiosk).
2. Put them in `server/.env` and set `API_PUBLIC_URL` to the public HTTPS address of the API.
3. In the Paymob dashboard set the transaction **callback URL** to `https://YOUR_DOMAIN/api/payments/paymob/webhook`.

Flow: `POST /api/checkout` creates a pending order and a Paymob payment intention, the student pays on Paymob's hosted page, Paymob calls the webhook (HMAC-verified) and the order becomes paid and the student is enrolled. The redirect back to `/checkout/result` is also HMAC-verified, so local setups work without a public webhook. Orders are only ever marked paid once. Test with Paymob's test-mode keys before going live.

## Video (Bunny Stream)

1. Create a Stream library on bunny.net, enable **Token Authentication**, and copy the library ID and token key into `server/.env`.
2. Upload a video and link it to a lesson:
   ```bash
   npm --prefix server run video:assign -- 2-l5 <bunny-video-id>
   ```
   Lesson IDs are visible in the API response (`GET /api/courses/2`). Only enrolled students (or anyone, for preview lessons) receive a signed embed URL valid for 3 hours.

## API

Responses are `{ data, meta? }`; errors are `{ message, details? }` with proper status codes (400, 401, 402, 403, 404, 409, 422, 429, 502, 503).

| Area | Endpoints |
| --- | --- |
| Catalogue | `GET /courses` (`search`, `category`, `level`, `featured`, `sort`), `GET /courses/:id` (id or slug), `GET /courses/:id/related`, `GET /categories`, `GET /levels` |
| Lessons | `GET /courses/:id/lessons/:lessonId/playback`, `POST /courses/:id/reviews` |
| Auth | `POST /auth/register`, `/auth/login`, `/auth/forgot-password`, `/auth/reset-password`, `/auth/verify-email`, `/auth/resend-verification`, `GET /auth/me` |
| Me | `PATCH /me`, `PATCH /me/password`, `POST /me/avatar`, `GET /me/learning`, `POST /me/lessons/open`, `POST /me/lessons/complete`, `PUT/DELETE /me/favorites/:courseId`, `GET /me/orders`, `GET /me/notifications`, `POST /me/notifications/read-all`, `PATCH /me/notifications/:id/read`, `GET /users/:id/courses` |
| Commerce | `POST /enroll` (free), `GET /checkout/quote`, `POST /checkout`, `GET /orders/:id`, `POST /orders/:id/confirm`, `POST /orders/:id/mock-pay` (dev), `POST /payments/paymob/webhook` |
| Public | `GET /certificates/:code`, `POST /contact`, `GET /health` |
| Admin | `GET /admin/stats`, `GET /admin/users`, `PATCH /admin/users/:id/role`, `GET /admin/orders`, `GET /admin/messages`, `PATCH /admin/messages/:id`, `GET/POST /admin/coupons`, `PATCH/DELETE /admin/coupons/:code` |

## Project structure

```
arkan-zone/
├── src/                      # React app
│   ├── pages/                # route pages (+ pages/admin/)
│   ├── components/           # ui, common, layout, home, courses, dashboard, auth, admin
│   ├── context/              # Auth, Learning (server-synced), Theme, Toast
│   ├── services/api.js       # the only place that calls fetch()
│   ├── hooks/ utils/ data/
├── server/
│   ├── server.js app.js      # boot (migrate + seed) / express app
│   ├── config/               # env, database (Knex)
│   ├── db/                   # migrations, seed
│   ├── routes/ controllers/ services/ middleware/ utils/
│   ├── data/courses.js       # seed catalogue
│   ├── scripts/              # video:assign, make-admin
│   └── tests/api.test.js
├── deploy/                   # nginx.conf, .env.production.example
├── Dockerfile                # web (build + nginx)
├── server/Dockerfile         # API
└── docker-compose.yml        # PostgreSQL + API + web
```

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` / `build` / `preview` | Frontend |
| `npm run server` | API with auto-reload |
| `npm run lint` | ESLint |
| `npm test` | Frontend unit tests |
| `npm run test:server` | API integration tests (in-memory SQLite) |
| `npm --prefix server run make-admin -- email@x.com` | Promote a user to admin |
| `npm --prefix server run video:assign -- <lessonId> <videoId>` | Link a Bunny video |

## Deployment (Docker)

```bash
cp deploy/.env.production.example .env.production   # fill in every value
docker compose --env-file .env.production up -d --build
```

This starts PostgreSQL, the API (migrations and seeding run automatically) and nginx on port 80, which serves the site and proxies `/api` and `/uploads`. Put HTTPS in front of it (Cloudflare, Caddy, or certbot), then point Paymob's callback to `https://YOUR_DOMAIN/api/payments/paymob/webhook`. Data lives in the `pgdata` and `uploads` volumes; back them up.

## Security notes

Passwords are hashed with bcrypt; reset and verification tokens are single-use, stored hashed and expire; JWTs are validated against the database on every request so role changes apply immediately; inputs are validated with zod; login, registration and contact endpoints are rate-limited; payment callbacks are HMAC-verified; video IDs are never exposed and embeds are signed; uploads are type- and size-checked.

## Not included

Course and lesson authoring (creating/editing courses, uploading videos from the UI) is intentionally out of scope; the catalogue is seeded from `server/data/courses.js` and videos are linked with `video:assign`.
