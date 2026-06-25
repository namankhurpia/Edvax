import { Router } from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import crypto from 'crypto'
import { requireAdmin } from '../middleware/auth.js'

const router = Router()

// Uploads live in a directory backed by a persistent Docker volume so they
// survive updates/redeploys (same guarantee as the database).
export const UPLOAD_DIR = process.env.UPLOAD_DIR || path.resolve('uploads')
fs.mkdirSync(UPLOAD_DIR, { recursive: true })

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp'])
const MAX_BYTES = 2 * 1024 * 1024 // 2 MB

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp' }[file.mimetype] || ''
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: MAX_BYTES, files: 1 },
  fileFilter: (_req, file, cb) => {
    if (!ALLOWED.has(file.mimetype)) {
      return cb(new Error('Only JPG, PNG or WebP images are allowed'))
    }
    cb(null, true)
  },
})

// POST /api/uploads/image  (admin only) -> { url }
router.post(
  '/image',
  requireAdmin,
  (req, res) => {
    upload.single('image')(req, res, (err) => {
      if (err) {
        const msg = err.code === 'LIMIT_FILE_SIZE' ? 'Image must be 2 MB or smaller' : err.message
        return res.status(400).json({ error: msg })
      }
      if (!req.file) return res.status(400).json({ error: 'No image provided' })
      // Public URL served by the static handler mounted in server.js.
      res.status(201).json({ url: `/uploads/${req.file.filename}` })
    })
  },
)

export default router
