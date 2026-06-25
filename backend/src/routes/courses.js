import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { validateBody, asyncHandler } from '../middleware/validate.js'
import { requireAdmin } from '../middleware/auth.js'
import { slugify } from '../utils/slug.js'

const router = Router()

// Columns that are SAFE to expose publicly. zoom_recording_url is NEVER here.
const PUBLIC_COLS = `id, slug, title, subtitle, description, instructor, category,
  price_paise, mrp_paise, lessons, hours, thumbnail_url, chapters, status, created_at`

// --- Public: list published courses ---
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT ${PUBLIC_COLS} FROM courses WHERE status = 'published' ORDER BY created_at DESC`,
    )
    res.json({ courses: rows })
  }),
)

// --- Public: single published course (no zoom link) ---
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT ${PUBLIC_COLS} FROM courses WHERE slug = $1 AND status = 'published'`,
      [req.params.slug],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' })
    res.json({ course: rows[0] })
  }),
)

// NOTE: There is no public account system. The Zoom recording link is delivered
// ONLY via the receipt email after a verified payment (see services/email.js).
// It is never returned by any public endpoint here.

// ===== Admin CRUD =====
const courseSchema = z.object({
  title: z.string().min(3).max(200),
  subtitle: z.string().max(300).optional().default(''),
  description: z.string().max(5000).optional().default(''),
  instructor: z.string().max(160).optional().default(''),
  category: z.string().max(80).optional().default(''),
  price_paise: z.number().int().min(0).default(0),
  mrp_paise: z.number().int().min(0).default(0),
  lessons: z.number().int().min(0).default(0),
  hours: z.number().min(0).default(0),
  // Accepts an uploaded path ("/uploads/..") or a full URL. Empty allowed.
  thumbnail_url: z.string().max(500).optional().default(''),
  zoom_recording_url: z.string().max(500).optional().default(''),
  // Named chapters. Empty array = no chapters (course detail shows description only).
  chapters: z
    .array(z.object({ title: z.string().min(1).max(200) }))
    .max(100)
    .optional()
    .default([]),
  status: z.enum(['draft', 'published']).default('draft'),
})

// Admin: list ALL courses (includes drafts; still hides zoom link in list)
router.get(
  '/admin/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT ${PUBLIC_COLS}, (zoom_recording_url IS NOT NULL AND zoom_recording_url <> '') AS has_zoom
         FROM courses ORDER BY created_at DESC`,
    )
    res.json({ courses: rows })
  }),
)

// Admin: full single record (all fields incl. zoom link) for the edit form.
router.get(
  '/admin/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rows } = await query(
      `SELECT ${PUBLIC_COLS}, zoom_recording_url FROM courses WHERE id = $1`,
      [id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' })
    res.json({ course: rows[0] })
  }),
)

router.post(
  '/admin',
  requireAdmin,
  validateBody(courseSchema),
  asyncHandler(async (req, res) => {
    const b = req.body
    const slug = slugify(b.title) + '-' + Date.now().toString(36)
    const { rows } = await query(
      `INSERT INTO courses
        (slug,title,subtitle,description,instructor,category,price_paise,mrp_paise,lessons,hours,thumbnail_url,zoom_recording_url,chapters,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING id, slug`,
      [slug, b.title, b.subtitle, b.description, b.instructor, b.category, b.price_paise,
       b.mrp_paise, b.lessons, b.hours, b.thumbnail_url, b.zoom_recording_url,
       JSON.stringify(b.chapters), b.status],
    )
    res.status(201).json({ course: rows[0] })
  }),
)

router.put(
  '/admin/:id',
  requireAdmin,
  validateBody(courseSchema),
  asyncHandler(async (req, res) => {
    const b = req.body
    const id = parseInt(req.params.id, 10)
    const { rows } = await query(
      // If an empty zoom_recording_url is sent (field removed from the form),
      // keep whatever is already stored — don't wipe it.
      `UPDATE courses SET
        title=$2, subtitle=$3, description=$4, instructor=$5, category=$6,
        price_paise=$7, mrp_paise=$8, lessons=$9, hours=$10,
        thumbnail_url=$11,
        zoom_recording_url = CASE WHEN $12 = '' THEN zoom_recording_url ELSE $12 END,
        chapters=$13, status=$14, updated_at=now()
       WHERE id=$1 RETURNING id, slug`,
      [id, b.title, b.subtitle, b.description, b.instructor, b.category, b.price_paise,
       b.mrp_paise, b.lessons, b.hours, b.thumbnail_url, b.zoom_recording_url,
       JSON.stringify(b.chapters), b.status],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Course not found' })
    res.json({ course: rows[0] })
  }),
)

router.delete(
  '/admin/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rowCount } = await query('DELETE FROM courses WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Course not found' })
    res.json({ ok: true })
  }),
)

export default router
