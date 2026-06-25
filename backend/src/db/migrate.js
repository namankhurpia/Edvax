import { pool } from './pool.js'

/**
 * Persistence-safe migrations.
 * - Every statement uses IF NOT EXISTS or additive ALTER.
 * - NEVER DROP or TRUNCATE here. Data must survive every deploy.
 * - Run automatically on server boot and via `npm run migrate`.
 */
const statements = [
  `CREATE TABLE IF NOT EXISTS users (
    id            SERIAL PRIMARY KEY,
    name          TEXT NOT NULL,
    email         TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role          TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user','admin')),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS courses (
    id                 SERIAL PRIMARY KEY,
    slug               TEXT NOT NULL UNIQUE,
    title              TEXT NOT NULL,
    subtitle           TEXT,
    description        TEXT,
    instructor         TEXT,
    category           TEXT,
    price_paise        INTEGER NOT NULL DEFAULT 0,
    mrp_paise          INTEGER NOT NULL DEFAULT 0,
    lessons            INTEGER NOT NULL DEFAULT 0,
    hours              NUMERIC(5,1) NOT NULL DEFAULT 0,
    thumbnail_url      TEXT,
    zoom_recording_url TEXT,
    chapters           JSONB NOT NULL DEFAULT '[]'::jsonb,
    status             TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at         TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS enrollments (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    course_id   INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status      TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','paid')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    UNIQUE (user_id, course_id)
  )`,

  // Accountless purchases: buyer enters details on a form (no login). user_id is
  // nullable and kept only for backward compatibility / optional future accounts.
  `CREATE TABLE IF NOT EXISTS payments (
    id                  SERIAL PRIMARY KEY,
    user_id             INTEGER REFERENCES users(id) ON DELETE SET NULL,
    course_id           INTEGER NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    buyer_name          TEXT,
    buyer_email         TEXT,
    buyer_phone         TEXT,
    buyer_address       TEXT,
    razorpay_order_id   TEXT NOT NULL,
    razorpay_payment_id TEXT,
    amount_paise        INTEGER NOT NULL,
    status              TEXT NOT NULL DEFAULT 'created' CHECK (status IN ('created','paid','failed')),
    invite_sent         BOOLEAN NOT NULL DEFAULT false,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS posts (
    id           SERIAL PRIMARY KEY,
    slug         TEXT NOT NULL UNIQUE,
    type         TEXT NOT NULL DEFAULT 'blog' CHECK (type IN ('blog','news')),
    title        TEXT NOT NULL,
    excerpt      TEXT,
    body         TEXT,
    author       TEXT,
    cover_url    TEXT,
    status       TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    published_at TIMESTAMPTZ,
    created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  `CREATE TABLE IF NOT EXISTS case_studies (
    id          SERIAL PRIMARY KEY,
    slug        TEXT NOT NULL UNIQUE,
    title       TEXT NOT NULL,
    court       TEXT,
    citation    TEXT,
    category    TEXT,
    summary     TEXT,
    body        TEXT,
    cover_url   TEXT,
    status      TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
  )`,

  // --- Additive migrations for existing databases (never destructive) ---
  `ALTER TABLE courses ADD COLUMN IF NOT EXISTS chapters JSONB NOT NULL DEFAULT '[]'::jsonb`,
  `ALTER TABLE case_studies ADD COLUMN IF NOT EXISTS cover_url TEXT`,

  // Make payments work without accounts: nullable user_id + buyer detail columns.
  `ALTER TABLE payments ALTER COLUMN user_id DROP NOT NULL`,
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS buyer_name TEXT`,
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS buyer_email TEXT`,
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS buyer_phone TEXT`,
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS buyer_address TEXT`,
  // Tracks whether the admin has sent the Zoom invite to this buyer.
  `ALTER TABLE payments ADD COLUMN IF NOT EXISTS invite_sent BOOLEAN NOT NULL DEFAULT false`,

  // Helpful indexes (idempotent)
  `CREATE INDEX IF NOT EXISTS idx_courses_status ON courses(status)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_buyer_email ON payments(buyer_email)`,
  `CREATE INDEX IF NOT EXISTS idx_posts_status_type ON posts(status, type)`,
  `CREATE INDEX IF NOT EXISTS idx_enrollments_user ON enrollments(user_id)`,
  `CREATE INDEX IF NOT EXISTS idx_payments_order ON payments(razorpay_order_id)`,
]

export async function runMigrations() {
  for (const sql of statements) {
    await pool.query(sql)
  }
  console.log(`[migrate] ${statements.length} statements applied (additive, non-destructive).`)
}

// Allow running directly: `npm run migrate`
if (import.meta.url === `file://${process.argv[1]}`) {
  runMigrations()
    .then(() => pool.end())
    .then(() => process.exit(0))
    .catch((e) => {
      console.error('[migrate] failed:', e)
      process.exit(1)
    })
}
