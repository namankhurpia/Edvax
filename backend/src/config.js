import dotenv from 'dotenv'
dotenv.config()

const required = (key, fallback) => {
  const v = process.env[key] ?? fallback
  if (v === undefined) {
    console.warn(`[config] Missing env var ${key}`)
  }
  return v
}

export const config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  isProd: (process.env.NODE_ENV || 'development') === 'production',
  corsOrigins: (process.env.CORS_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((s) => s.trim()),
  databaseUrl: required('DATABASE_URL'),
  jwt: {
    secret: required('JWT_SECRET', 'dev_insecure_secret_change_me'),
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@edvax.example.com',
    password: process.env.ADMIN_PASSWORD || 'change_me_now',
  },
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    keySecret: process.env.RAZORPAY_KEY_SECRET || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
  },
  smtp: {
    host: process.env.SMTP_HOST || '',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.MAIL_FROM || 'EDVAX <no-reply@edvax.example.com>',
  },
}
