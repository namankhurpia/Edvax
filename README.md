# EDVAX — Tax, Law & Finance learning platform

A production-ready e-learning + content platform: React frontend, Node/Express API, PostgreSQL, Razorpay (UPI) payments, secure Zoom-recording access, and an admin panel for courses, blogs/news and case studies.

> Full architecture, data model and the running progress log live in **`CLAUDE.md`**. Read that first.

## Repository layout

```
.
├── frontend/        React (Vite) SPA — public site + /admin panel
├── backend/         Node/Express API + PostgreSQL migrations
├── docker-compose.yml   db + api + web (nginx), persistent volume
├── deploy.sh        build / update / seed / backup helper
├── .env.example     root deployment config (copy to .env on server)
└── CLAUDE.md        plan, architecture, progress log
```

## Local development

Run the backend and frontend separately.

```bash
# 1) Backend — needs a local Postgres (or use the Docker db below)
cd backend
cp .env.example .env          # fill DATABASE_URL, JWT_SECRET, etc.
npm install
npm run seed                  # migrations + first admin + sample content
npm run dev                   # API on http://localhost:4000

# 2) Frontend (new terminal)
cd frontend
npm install
npm run dev                   # http://localhost:5173 (proxies /api to :4000)
```

Admin panel: http://localhost:5173/admin — log in with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.

## Production deployment (your SSH instance)

On the server, with Docker + Docker Compose installed:

```bash
git clone <repo> edvax && cd edvax
cp .env.example .env          # fill in ALL values (see below)
./deploy.sh up                # build images + start db, api, web
./deploy.sh seed              # create first admin + sample content (first run only)
```

The site is served on `WEB_PORT` (default 80). Put a TLS terminator (Caddy/nginx/your
load balancer) in front for HTTPS, or extend the `web` service with certificates.

### Required `.env` values
Generate secrets, then fill Razorpay + SMTP when you have them:

```bash
openssl rand -hex 32   # use for JWT_SECRET
```

Razorpay and SMTP can stay blank initially — the app degrades gracefully (payments
return a clear "not configured" message; emails are logged instead of sent).

### Updating without data loss
Course/user/payment data lives in the **`edvax_pgdata`** Docker volume. To deploy an update:

```bash
git pull
./deploy.sh up                # rebuilds images, keeps the volume → no data loss
```

Migrations are **additive only** (`CREATE TABLE IF NOT EXISTS`, additive `ALTER`) and
run automatically on API boot. Nothing in the deploy path ever drops or truncates data.

### Backups
```bash
./deploy.sh backup            # writes backups/edvax_<timestamp>.sql
```
Schedule this via cron for off-box copies.

## How course access works (Zoom model)

1. A course row stores a private `zoom_recording_url`. It is **never** returned by any
   public or list endpoint.
2. A user registers, then pays for a course via Razorpay UPI Checkout.
3. The server verifies the Razorpay signature, marks the enrollment `paid`, and
   **emails the Zoom link** to the buyer.
4. The link is also retrievable in-app via `GET /api/courses/:id/access`, which returns
   it **only** to authenticated users with a `paid` enrollment for that course.

This means only paying accounts can ever reach the recording link.

## Security summary

See the checklist in `CLAUDE.md §4`. Implemented:
bcrypt password hashing (cost 12); JWT in httpOnly/SameSite cookie; Razorpay payment +
webhook signature verification (timing-safe); Zoom links exposed only through the gated
access route; admin routes behind role middleware; rate limiting on auth/payment/general;
zod input validation; parameterized SQL throughout; Helmet headers; CORS locked to the
configured origin; DB not exposed to the host network; secrets only via `.env`.

## API quick reference

| Method | Path | Access | Purpose |
|--------|------|--------|---------|
| POST | `/api/auth/register` `/login` `/logout` | public | accounts |
| GET | `/api/courses` `/api/courses/:slug` | public | catalog (no zoom link) |
| GET | `/api/courses/:id/access` | paid user | returns Zoom link |
| POST | `/api/payments/order` `/verify` | user | Razorpay UPI flow |
| POST | `/api/payments/webhook` | Razorpay | signed, grants access |
| GET | `/api/posts` `/api/case-studies` | public | content |
| `*` | `/api/{courses,posts,case-studies}/admin/*` | admin | CRUD |
```
