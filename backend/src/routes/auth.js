import { Router } from 'express'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { validateBody, asyncHandler } from '../middleware/validate.js'
import { setAuthCookie, clearAuthCookie, requireAuth } from '../middleware/auth.js'

const router = Router()

const registerSchema = z.object({
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  password: z.string().min(8).max(200),
})

const loginSchema = z.object({
  email: z.string().email().max(160),
  password: z.string().min(1).max(200),
})

router.post(
  '/register',
  validateBody(registerSchema),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body
    const exists = await query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (exists.rowCount > 0) {
      return res.status(409).json({ error: 'An account with that email already exists' })
    }
    const hash = await bcrypt.hash(password, 12)
    const { rows } = await query(
      `INSERT INTO users (name, email, password_hash) VALUES ($1, $2, $3)
       RETURNING id, name, email, role`,
      [name, email.toLowerCase(), hash],
    )
    const user = rows[0]
    setAuthCookie(res, user)
    res.status(201).json({ user })
  }),
)

router.post(
  '/login',
  validateBody(loginSchema),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body
    const { rows } = await query(
      'SELECT id, name, email, role, password_hash FROM users WHERE email = $1',
      [email.toLowerCase()],
    )
    const user = rows[0]
    if (!user) return res.status(401).json({ error: 'Invalid email or password' })
    const ok = await bcrypt.compare(password, user.password_hash)
    if (!ok) return res.status(401).json({ error: 'Invalid email or password' })
    delete user.password_hash
    setAuthCookie(res, user)
    res.json({ user })
  }),
)

router.post('/logout', (req, res) => {
  clearAuthCookie(res)
  res.json({ ok: true })
})

router.get('/me', requireAuth, (req, res) => {
  const { id, name, email, role } = req.user
  res.json({ user: { id, name, email, role } })
})

export default router
