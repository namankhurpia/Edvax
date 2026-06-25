import express from 'express'
import helmet from 'helmet'
import cors from 'cors'
import cookieParser from 'cookie-parser'
import rateLimit from 'express-rate-limit'

import { config } from './config.js'
import { runMigrations } from './db/migrate.js'
import { authOptional } from './middleware/auth.js'

import authRoutes from './routes/auth.js'
import courseRoutes from './routes/courses.js'
import postRoutes from './routes/posts.js'
import caseStudyRoutes from './routes/caseStudies.js'
import paymentRoutes from './routes/payments.js'
import uploadRoutes, { UPLOAD_DIR } from './routes/uploads.js'

const app = express()
app.set('trust proxy', 1)

// --- Security headers ---
app.use(helmet())

// --- CORS locked to known origins, credentials on for cookie auth ---
app.use(
  cors({
    origin: config.corsOrigins,
    credentials: true,
  }),
)

// --- Razorpay webhook needs the RAW body for signature verification.
//     Mount it BEFORE express.json so the buffer is intact. ---
app.use('/api/payments/webhook', express.raw({ type: '*/*' }))

app.use(express.json({ limit: '1mb' }))
app.use(cookieParser())
app.use(authOptional)

// --- Rate limiting ---
const generalLimiter = rateLimit({ windowMs: 60 * 1000, max: 120, standardHeaders: true, legacyHeaders: false })
const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 30, standardHeaders: true, legacyHeaders: false })
const paymentLimiter = rateLimit({ windowMs: 60 * 1000, max: 20, standardHeaders: true, legacyHeaders: false })

app.use('/api/', generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/payments/order', paymentLimiter)
app.use('/api/payments/verify', paymentLimiter)

// --- Health check ---
app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date().toISOString() }))

// --- Routes ---
// Serve uploaded images (persistent volume). 30-day cache.
app.use('/uploads', express.static(UPLOAD_DIR, { maxAge: '30d', immutable: true }))

app.use('/api/auth', authRoutes)
app.use('/api/uploads', uploadRoutes)
app.use('/api/courses', courseRoutes)
app.use('/api/posts', postRoutes)
app.use('/api/case-studies', caseStudyRoutes)
app.use('/api/payments', paymentRoutes)

// --- 404 + error handler ---
app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))
app.use((err, req, res, _next) => {
  console.error('[error]', err)
  res.status(err.status || 500).json({ error: config.isProd ? 'Internal server error' : err.message })
})

async function start() {
  try {
    await runMigrations()
  } catch (e) {
    console.error('[startup] migration failed:', e.message)
  }
  app.listen(config.port, () => {
    console.log(`[edvax] API listening on :${config.port} (${config.nodeEnv})`)
  })
}

start()

export default app
