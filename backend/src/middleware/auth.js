import jwt from 'jsonwebtoken'
import { config } from '../config.js'

// Issue a signed JWT and set it as an httpOnly cookie.
export function setAuthCookie(res, user) {
  const token = jwt.sign(
    { id: user.id, role: user.role, email: user.email, name: user.name },
    config.jwt.secret,
    { expiresIn: config.jwt.expiresIn },
  )
  res.cookie('edvax_token', token, {
    httpOnly: true,
    // Only mark Secure when actually serving over HTTPS. On plain HTTP (e.g. a
    // bare IP with no TLS yet) a Secure cookie is never sent back by the browser,
    // which breaks admin auth. Controlled by COOKIE_SECURE, default off.
    secure: config.cookieSecure,
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  })
}

export function clearAuthCookie(res) {
  res.clearCookie('edvax_token')
}

// Populates req.user if a valid token is present; does not block.
export function authOptional(req, _res, next) {
  const token = req.cookies?.edvax_token
  if (token) {
    try {
      req.user = jwt.verify(token, config.jwt.secret)
    } catch {
      // ignore invalid token
    }
  }
  next()
}

// Blocks unauthenticated requests.
export function requireAuth(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  next()
}

// Blocks non-admin requests.
export function requireAdmin(req, res, next) {
  if (!req.user) return res.status(401).json({ error: 'Authentication required' })
  if (req.user.role !== 'admin') return res.status(403).json({ error: 'Admin access required' })
  next()
}
