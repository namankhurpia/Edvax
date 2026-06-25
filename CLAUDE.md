# EDVAX — Project Plan, Architecture & Progress Log

> **Maintainer note:** This file is the single source of truth for the project. Because of rate limits, **every meaningful unit of progress is logged here** (see the Progress Log at the bottom). When resuming work, read this file first.

---

## 0. Pre-launch checklist (placeholders to replace before going live)
Search the frontend for `TODO (pre-launch)` to find each spot.
- [x] **Support email + phone** — set to `edvax.info@gmail.com` / `+91 98268 04435` in `components/Layout.jsx` (footer), `pages/Contact.jsx`, and the `services/email.js` receipt footer. (Note: `MAIL_FROM` envelope in `.env` is separate — set the sending address there.)
- [ ] **Hero/about stats** — `pages/Home.jsx` and `pages/About.jsx` now show honest placeholder labels (course count is real; the rest are descriptors, not invented metrics). Replace with real figures if/when available.
- [ ] **Course ratings** — not tracked in the DB; UI hides ratings (`transform.js` sets `rating: null`). Wire real ratings or leave hidden.
- [ ] **Course perks** — `pages/CourseDetail.jsx`: confirm whether a certificate / lifetime access actually apply; removed the unverified ones, kept "recording emailed".
- [ ] **Razorpay + SMTP keys** — fill real values in `.env` (see §5). Until then checkout returns a clear 503 and receipts log instead of send.
- [ ] **Dead files to delete locally** (sandbox couldn't remove; not committed thanks to .gitignore): `frontend/src/pages/Login.jsx` (unrouted), `frontend/dist_*`, `frontend/dist_check`, `frontend/dist2`.

---

## 1. What we are building

A production-ready e-learning + content platform for **EDVAX** — a law / tax / finance education brand (Naman's brother's website). The public site showcases courses and case studies; an admin panel manages courses, blogs, news, and case studies; users buy courses via **Razorpay (UPI, India)** and then gain secure access to **Zoom recording links** for the courses they paid for.

This is an **original build** inspired by reference sites (edvax.lovable.app, academy.taxscan.in). We do **not** copy their content, images, copy text, or proprietary assets — only the general structure/spirit of a professional tax-law academy.

### Core requirements (from the user)
- React (Vite) frontend, clean design, law/case-study focus.
- Post & manage **blogs / news** (admin section).
- Post & manage **courses** (admin section).
- **Razorpay UPI** payment integration (India only).
- **Zoom recording links**: each course is a recorded Zoom session. Only accounts that **paid** for a course can access its Zoom link. Automate link delivery (e.g. email on payment success). Links must never be publicly exposed.
- **Data persistence is critical** — updates/redeploys must NOT wipe data. Use PostgreSQL with a persistent Docker volume; migrations are additive.
- **No security flaws** — proper auth, secret handling, payment signature verification, rate limiting.
- Self-hosted on an SSH instance (credentials + open ports to be provided later).
- Everything documented; progress tracked in this `.md`.

---

## 2. Architecture

```
┌──────────────┐     HTTPS      ┌─────────────────┐     SQL      ┌──────────────┐
│ React (Vite) │ ─────────────▶ │ Node / Express  │ ───────────▶ │ PostgreSQL   │
│  public +    │   REST + JWT   │  API server     │   (pg pool)  │ (Docker vol) │
│  admin SPA   │ ◀───────────── │                 │ ◀─────────── │ persistent   │
└──────────────┘                └────────┬────────┘              └──────────────┘
                                         │
                                ┌────────┴─────────┐
                                │ Razorpay (UPI)   │  order + webhook signature verify
                                │ SMTP (Zoom link) │  email automation on payment success
                                └──────────────────┘
```

### Stack decisions (confirmed with user)
- **Frontend:** React 18 + Vite + Tailwind CSS + React Router. SPA with public + admin areas.
- **Backend:** Node.js + Express. REST API. JWT auth (httpOnly cookie).
- **Database:** PostgreSQL. Data lives in a **named Docker volume** so `docker compose down && up` / image rebuilds never drop data. Migrations are **additive only** (never destructive on deploy).
- **Payments:** Razorpay Orders API + Checkout (UPI). Server verifies `razorpay_signature` (HMAC) and webhook signature. Enrollment is granted **only** after verified payment.
- **Zoom access model:** Course rows store `zoom_recording_url` (never sent to public endpoints). A gated endpoint `GET /api/courses/:id/access` returns the link **only** if the authenticated user has a `paid` enrollment for that course. On payment success, the link is also emailed (SMTP). This satisfies "only those accounts can access those zoom links" and is fully feasible.
- **Hosting:** Docker Compose (db + api + nginx serving built frontend). Deploy via SSH once credentials are supplied.

---

## 3. Data model (PostgreSQL)

| Table | Key columns | Purpose |
|-------|-------------|---------|
| `users` | id, name, email (unique), password_hash, role (`user`/`admin`), created_at | Accounts & admin |
| `courses` | id, slug, title, subtitle, description, instructor, price_paise, mrp_paise, lessons, hours, category, thumbnail_url, **zoom_recording_url** (private), status (`draft`/`published`), created_at | Course catalog + private Zoom link |
| `enrollments` | id, user_id, course_id, status (`pending`/`paid`), created_at | Who has access to what |
| `payments` | id, user_id, course_id, razorpay_order_id, razorpay_payment_id, amount_paise, status, created_at | Payment audit trail |
| `posts` | id, slug, type (`blog`/`news`), title, excerpt, body (markdown/html), author, cover_url, status, published_at, created_at | Blogs & news |
| `case_studies` | id, slug, title, court, citation, summary, body, category, status, created_at | Law case studies |

**Account model (updated):** No public accounts/login. Purchases are accountless — buyer details captured on a form, stored on the `payments` row (`buyer_name/email/phone/address`, `user_id` nullable). The `zoom_recording_url` is delivered ONLY in the post-payment **receipt email**; it is never returned by any HTTP endpoint. Admin login (role-based) is retained for content + viewing purchases.

**Persistence guarantees:** DB lives on volume `edvax_pgdata`. Migrations run with `CREATE TABLE IF NOT EXISTS` + additive `ALTER` — never `DROP` on deploy.

---

## 4. Security checklist (reviewed 2026-06-20 — all implemented)
- [x] Passwords hashed with bcrypt (cost 12). — `routes/auth.js`
- [x] JWT in httpOnly + SameSite cookie (Secure in prod). — `middleware/auth.js`
- [x] Razorpay payment + webhook signatures verified server-side (timing-safe). — `services/razorpay.js`
- [x] Zoom links never returned by any HTTP endpoint — delivered only via the post-payment receipt email. Verified by grep audit. — `routes/courses.js`, `services/email.js`
- [x] Admin routes protected by `requireAdmin` role middleware.
- [x] Rate limiting on auth + payment + general endpoints. — `server.js`
- [x] Input validation (zod) on all writes.
- [x] Secrets only via `.env` (never committed); `.env.example` provided at root + backend.
- [x] CORS locked to configured origin(s).
- [x] Helmet security headers (API) + nginx headers (web). HTTPS to be terminated by a front proxy on the server.
- [x] SQL parameterized everywhere; only non-user constant (`PUBLIC_COLS`) is interpolated. Verified by grep audit.
- [x] Order-to-user binding on payment verify prevents cross-user access grants.

---

## 5. Environment variables (placeholders for now)

```
# --- API ---
PORT=4000
NODE_ENV=production
JWT_SECRET=__change_me__
CORS_ORIGIN=https://edvax.example.com

# --- Database ---
DATABASE_URL=postgres://edvax:__change_me__@db:5432/edvax

# --- Razorpay (India / UPI) ---
RAZORPAY_KEY_ID=__rzp_test_xxx__
RAZORPAY_KEY_SECRET=__change_me__
RAZORPAY_WEBHOOK_SECRET=__change_me__

# --- Email (Zoom link delivery) ---
SMTP_HOST=__smtp_host__
SMTP_PORT=587
SMTP_USER=__user__
SMTP_PASS=__change_me__
MAIL_FROM="EDVAX <no-reply@edvax.example.com>"
```

---

## 6. Build order (milestones)
1. **Docs** (this file). ✅ in progress
2. **Frontend scaffold** + design system.
3. **Public UI** with mock data (home, courses, course detail, blogs, news, case studies, about, contact). ← user's first priority
4. **Backend API + Postgres schema** (persistence-safe).
5. **Auth + secure Zoom access**.
6. **Razorpay UPI**.
7. **Admin panel**.
8. **Docker + SSH deploy + security review**.

---

## 7. How to run (filled in as we build)
*(Local dev + Docker instructions added once scaffold exists.)*

---

## 8. Progress Log
*(Newest at top. Each entry: date — what was done — what's next.)*

- **2026-06-20 (13)** — **Invite-sent tracking on purchases (per user).** Added a per-purchase "invite sent / not sent" switch in the admin Purchases table so staff can track who's received the Zoom invite. **Backend:** additive `invite_sent BOOLEAN DEFAULT false` on `payments` (fresh `CREATE` + `ALTER`, non-destructive); admin purchases query now returns `invite_sent`; new admin endpoint `POST /payments/admin/:id/invite` (zod-validated `{sent:boolean}`) flips the flag. **Frontend:** `admin.setInviteSent(id,sent)`; new "Invite" column with a green pill toggle showing Sent/Not sent, optimistic update with revert-on-error. **Verified:** backend parses; frontend builds (~68 kB gzip). **Note:** requires `./deploy.sh up` to apply the new column. The switch is manual tracking only — it does NOT itself send anything (the receipt email already carries the Zoom link; "Resend receipt" re-sends it). **Also (separate):** added `infra/oci/` — corrected Terraform for the Oracle free-tier Mumbai instance (public IP + security list opening 22/80/443 + Docker cloud-init) and a `retry-apply.sh` loop that cycles availability domains to beat 'out of host capacity'. HCL + shell validated; user runs it locally with their own OCI credentials.
- **2026-06-20 (12)** — **Consistency audit + cleanup (per user).** Audited the codebase for drift after iterative changes. Findings + fixes: (1) **fake ratings** — every course showed a hardcoded ★4.8 though ratings aren't in the DB; `transform.js` now sets `rating: null` and `CourseCard`/`CourseDetail` hide the rating when absent. (2) **invented stats** — Home hero and About grid showed "25+/10k+/50+/4.8★"; replaced with honest labels (real course count + specialisation descriptors) marked `TODO (pre-launch)`. (3) **placeholder support email** (`support@edvax.example.com`) in footer + Contact marked TODO. (4) **unverified course perks** ("certificate", "lifetime access") removed; kept "recording emailed", marked TODO to confirm. (5) **dead code/clutter** — `frontend/.gitignore` now excludes `dist2`/`dist_*`/`dist_check`; `Login.jsx` is unrouted/unimported (host-locked, safe to delete locally). Added a **Pre-launch checklist (§0)** listing every placeholder. Auth code retained — it backs the admin login (not dead). **Verified:** frontend builds clean. **Next:** none outstanding; user to fill real values per §0 before launch.
- **2026-06-20 (11)** — **Fixed edit-loses-content bug + polished detail-page design (per user).** **Bug:** admin `/admin/all` list endpoints return only a few columns (no body/summary/excerpt/cover), so clicking Edit populated the form from the partial row and saving would wipe long fields. **Fix — backend:** added `GET /admin/:id` to courses, posts, and case-studies returning the FULL record (courses includes `zoom_recording_url`). **Fix — frontend:** `admin.course/post/caseStudy(id)` get-one helpers; `ResourceManager` now has `openEdit()` which fetches the full record via `api.getOne` before opening the form, so every field loads back in and saves correctly; all three resource configs pass `getOne`. **Design:** `CaseStudyDetail` and `PostDetail` redesigned to a cleaner editorial layout — white hero band with back-link/badges/title/court, 21:9 cover, and the summary now rendered as an understated serif lead with a thin gold left-rule (replaced the boxy callout the user disliked); uppercase-tracked section labels ("Summary", "Full analysis"). **Verified:** backend parses; frontend builds (62 modules, ~68 kB gzip). **Next:** none outstanding.
- **2026-06-20 (10)** — **Case study detail page + image upload everywhere (per user).** Two issues: (1) clicking a case study showed nothing (no detail page/route existed) and news detail looked empty; (2) blog/case-study admin forms still asked for an image URL. **Backend:** added `cover_url TEXT` to `case_studies` (fresh `CREATE` + additive `ALTER`); case-studies route returns `cover_url` in list+detail and accepts it in admin CRUD; relaxed `posts.cover_url` and `case_studies.cover_url` validation to accept `/uploads/..` paths (was URL-only). **Frontend:** new **`CaseStudyDetail`** page + route `/case-studies/:slug` (hero, citation, cover image, summary callout, full body); case-study cards (list + home) now link to it with a "Read full case →" affordance; blog admin **cover image** and case-study **cover image** fields switched from URL text to the `image` upload component (recommended 1280×720, max 2 MB). Article (news/blog) detail at `/blog/:slug` confirmed rendering full `body`. **Verified:** backend parses; frontend builds (61 modules, ~68 kB gzip). **Note:** requires `./deploy.sh up` to apply the new `cover_url` column. All three content types (courses, blog/news, case studies) now use uploads — no URL fields remain.
- **2026-06-20 (9)** — **Course image upload (no URL) + removed Zoom field from the form (per user).** **Backend:** added `multer@2` + `routes/uploads.js` — admin-only `POST /api/uploads/image`, accepts JPG/PNG/WebP, **max 2 MB**, random filename, returns `{ url: "/uploads/<file>" }`; files saved to `UPLOAD_DIR` (`/app/uploads`) served via `express.static('/uploads')`; new Docker named volume **`edvax_uploads`** mounted into the API so images persist across updates (same guarantee as the DB). Courses route: `thumbnail_url`/`zoom_recording_url` validation relaxed to accept the `/uploads/..` path; course UPDATE now **preserves an existing zoom link when an empty value is sent** (field removed from form, so it won't be wiped). nginx + vite dev proxy both forward `/uploads`. **Frontend:** new `ImageUpload` component (upload-only, live preview, shows **recommended 1280×720 (16:9), max 2 MB**) wired as an `image` field type in `ResourceManager`; course admin form now uses image upload for the thumbnail and the **Zoom recording URL field is removed**. **Verified:** backend boots, upload route rejects unauthenticated calls (401); frontend builds (60 modules, ~67 kB gzip); docker-compose valid with both volumes. **Next:** none outstanding for this request. (Zoom links can be set later via seed/DB or re-added to the form if needed.)
- **2026-06-20 (8)** — **Wired public pages to the live API + added named, configurable chapters.** Two user issues fixed: (1) admin-created courses weren't showing on the site because public pages still read mock data; (2) courses needed named, count-configurable chapters (0 = description only). **Backend:** added `chapters JSONB DEFAULT '[]'` to courses (fresh `CREATE` + additive `ALTER` — non-destructive); courses route includes `chapters` in `PUBLIC_COLS` and admin CRUD validates `chapters: [{title}]` (max 100) and stores via `JSON.stringify`; seed gives sample courses 4 example chapters. **Frontend:** new `lib/transform.js` (maps API paise/snake_case → UI shape); `Courses`, `CourseDetail`, `Blog`, `PostDetail`, `CaseStudies`, and `Home` now fetch from the API with loading skeletons + friendly empty states ("Add one from the admin panel"); `CourseDetail` redesigned professionally — hero, always-on description, and a numbered **chapter list that only renders when chapters exist** (0 chapters → description only); admin course form has a new **ChapterEditor** (set the count, name each chapter, reorder up/down). **Verified:** frontend builds (59 modules, ~67 kB gzip); backend `routes/courses`, `db/migrate`, `db/seed` pass `node --check`. **Note:** to see it locally, (re)build + reseed: `./deploy.sh up` then `./deploy.sh seed` (or `docker compose exec api node src/db/seed.js`). A course added in the admin panel now appears on the site immediately (set status = published).
- **2026-06-20 (7)** — **Switched to accountless purchase model + admin Purchases view (per user).** User decided: no public accounts/login; instead "Enrol via UPI" opens a buyer-details form (name, email, phone, address) → Razorpay UPI checkout → on verified payment, an **email receipt** is sent containing payment details (receipt no., course, amount, payment/order id, date), buyer details, a support/refund footer, **and the Zoom recording link**. **Backend:** payments table reworked — `user_id` now nullable, added `buyer_name/email/phone/address` (fresh `CREATE` + additive `ALTER`s, still non-destructive); `routes/payments.js` rewritten accountless (`/order` takes buyer details, `/verify` + webhook flip to paid and email receipt only on the paid transition); removed the account-gated `/courses/:id/access` and `/me/enrolled` routes (Zoom link now delivered ONLY via the receipt email); new admin endpoints `GET /payments/admin/all` (purchases list, `?status=paid`) and `POST /payments/admin/:id/resend` (re-email receipt+link). `services/email.js` replaced access email with full HTML **receipt**. **Frontend:** removed public `/login` + header link (admin login at /admin kept); `lib/checkout.js` loads Razorpay Checkout and runs order→pay→verify; `CourseDetail` enrol button opens a modal form with success screen; new **admin Purchases page** (buyer contact, course, amount, status, date, resend-receipt) + dashboard "Paid purchases" card + sidebar link. **Verified:** frontend builds (57 modules, ~67 kB gzip); all backend modules pass `node --check`; confirmed no account-gated course routes remain. **Note:** public catalog/blog pages still read mock data — wiring them to the live API is the one remaining task. Razorpay keys still needed for real payments (checkout returns a clear 503 until set); SMTP still needed to actually send receipts (logged otherwise).
- **2026-06-20 (6)** — **Local run + Docker + git prepared for handoff.** Added `.dockerignore` to backend + frontend (stops host `node_modules`/`dist` polluting the build context — frontend `COPY . .` would otherwise drag them in), `.env.local.example` (safe localhost defaults: site on :8080, throwaway JWT secret, admin@edvax.local / admin12345, Razorpay/SMTP blank → graceful), and `start-local.sh` (one command: git init + initial commit → create .env → `docker compose up -d --build` → seed). **Verified (Docker not in sandbox, so simulated each stage):** docker-compose.yml valid, both build contexts resolve to real Dockerfiles, named volume present; frontend clean-copy `npm install && npm run build` passes (765 ms) — confirms the host `dist`-lock is a mount quirk, NOT a Docker problem; backend clean prod-install boots + listens. Both shell scripts pass `bash -n`. **Note:** git could not be committed from the sandbox — `.git` lock files are blocked on the mounted FS. `start-local.sh` does git init + first commit on the user's machine, where it works. **To run locally:** `./start-local.sh` (Docker Desktop running) → http://localhost:8080, admin at /admin.
- **2026-06-20 (5)** — **Deployment + security review done.** Added: `backend/Dockerfile`, `frontend/Dockerfile` (multi-stage, nginx-served), `frontend/nginx.conf` (SPA + `/api` proxy + security headers + asset caching), root `docker-compose.yml` (db + api + web; **named volume `edvax_pgdata`** so updates never lose data; db/api not published to host), root `.env.example`, `deploy.sh` (up/seed/backup/logs — re-runnable, never wipes data), and `README.md` (local dev, prod deploy, update-without-data-loss, backups, API table). **Security review:** grep-audited SQL (all parameterized; only constant `PUBLIC_COLS` interpolated) and `zoom_recording_url` exposure (only gated access route + payment email — confirmed no leak path). `docker-compose.yml` valid YAML; `deploy.sh` passes `bash -n`. Checklist §4 fully ticked. **Remaining (small, post-handoff):** wire public pages from mock data to the live API; add TLS termination on the server; drop in real Razorpay + SMTP creds + SSH host when provided, then `./deploy.sh up && ./deploy.sh seed`.
- **2026-06-20 (4)** — **Admin panel + API client built.** Frontend now has: `lib/api.js` (fetch wrapper, credentials/cookies), `lib/AuthContext.jsx` (session state), and an admin area under `/admin`: AdminLogin (admin-only gate), Dashboard (content counts), and a generic `ResourceManager` driving three CRUD screens — Courses (incl. private Zoom URL field), Blog & News, Case Studies. Admin routes guarded by `RequireAdmin`. App split into public Layout tree + standalone admin shell. **Verified:** full frontend builds (56 modules, ~66 kB gzip). Note: host-mounted `dist/` is FS-locked from an earlier build — harmless, real deploys build fresh inside Docker. **Next:** Docker (db + api + nginx, persistent volume), deploy script, README, security review (#8). Public pages still read mock data — switching them to the API is a small follow-up I'll do during deploy wiring.
- **2026-06-20 (3)** — **Backend API + Postgres + auth + secure Zoom access + Razorpay built.** Node/Express in `backend/`. Persistence-safe migrations (`CREATE TABLE IF NOT EXISTS`, additive only — never DROP). Tables: users, courses, enrollments, payments, posts, case_studies. Routes: auth (register/login/logout/me, bcrypt cost 12, JWT httpOnly cookie), courses (public list/detail **exclude zoom link**; gated `GET /:id/access` returns Zoom link ONLY to `paid` enrollees; admin CRUD), posts (blog/news), case-studies, payments (Razorpay order → signature-verified `/verify` → grant access + email Zoom link; signature-verified webhook). Security: helmet, CORS allowlist, rate limiters (auth/payments/general), zod validation, parameterized SQL, timing-safe signature compare. Seed script creates first admin + sample content (idempotent). **Verified:** all 13 modules pass `node --check`; server boots; `/api/health` ok; validation returns 400 w/ field errors; 404 handler works; DB errors handled gracefully (no Postgres in sandbox — runs via Docker in deploy). Razorpay/SMTP use placeholders and degrade gracefully (clear 503 / log instead of crash). **Next:** admin panel UI (task #7), then Docker + SSH deploy + security review (#8). Frontend still needs API wiring (currently mock data) — to do alongside admin.
- **2026-06-20 (2)** — **Frontend scaffolded + public UI complete.** Vite + React 18 + Tailwind + React Router. Built: Layout (header/footer, mobile nav), Home (hero, courses, why-edvax, case studies, mentors, CTA), Courses (filter + search), CourseDetail (curriculum + Zoom-access note + UPI enrol CTA), CaseStudies, Blog & News (tabbed), PostDetail, About, Contact (form), Login/Register, NotFound. Original brand: navy + gold, Playfair/Inter. Mock data in `src/data/mock.js`. **`npm run build` passes** (48 modules, ~62 kB gzip JS). Run locally: `cd frontend && npm install && npm run dev` (port 5173). **Next:** backend API + Postgres schema (task #4).
- **2026-06-20** — Reviewed reference sites (edvax.lovable.app is a JS-rendered Lovable SPA; academy.taxscan.in used for structure inspiration). Confirmed stack with user: **Node + PostgreSQL**, frontend-first, placeholder keys, **Zoom-recording-link access model** (paid accounts only). Created task list + this planning doc. **Next:** scaffold Vite React frontend + Tailwind, then build public UI with mock data.
