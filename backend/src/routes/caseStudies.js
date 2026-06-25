import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { validateBody, asyncHandler } from '../middleware/validate.js'
import { requireAdmin } from '../middleware/auth.js'
import { slugify } from '../utils/slug.js'

const router = Router()

router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, title, court, citation, category, summary, cover_url
         FROM case_studies WHERE status = 'published' ORDER BY created_at DESC`,
    )
    res.json({ caseStudies: rows })
  }),
)

router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, title, court, citation, category, summary, body, cover_url
         FROM case_studies WHERE slug = $1 AND status = 'published'`,
      [req.params.slug],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Case study not found' })
    res.json({ caseStudy: rows[0] })
  }),
)

const csSchema = z.object({
  title: z.string().min(3).max(250),
  court: z.string().max(160).optional().default(''),
  citation: z.string().max(160).optional().default(''),
  category: z.string().max(80).optional().default(''),
  summary: z.string().max(1000).optional().default(''),
  body: z.string().max(50000).optional().default(''),
  cover_url: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'published']).default('draft'),
})

router.get(
  '/admin/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, title, court, citation, category, status, created_at
         FROM case_studies ORDER BY created_at DESC`,
    )
    res.json({ caseStudies: rows })
  }),
)

// Admin: full single record (all fields) for the edit form.
router.get(
  '/admin/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rows } = await query(
      `SELECT id, slug, title, court, citation, category, summary, body, cover_url, status
         FROM case_studies WHERE id = $1`,
      [id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Case study not found' })
    res.json({ caseStudy: rows[0] })
  }),
)

router.post(
  '/admin',
  requireAdmin,
  validateBody(csSchema),
  asyncHandler(async (req, res) => {
    const b = req.body
    const slug = slugify(b.title) + '-' + Date.now().toString(36)
    const { rows } = await query(
      `INSERT INTO case_studies (slug,title,court,citation,category,summary,body,cover_url,status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, slug`,
      [slug, b.title, b.court, b.citation, b.category, b.summary, b.body, b.cover_url, b.status],
    )
    res.status(201).json({ caseStudy: rows[0] })
  }),
)

router.put(
  '/admin/:id',
  requireAdmin,
  validateBody(csSchema),
  asyncHandler(async (req, res) => {
    const b = req.body
    const id = parseInt(req.params.id, 10)
    const { rows } = await query(
      `UPDATE case_studies SET
        title=$2, court=$3, citation=$4, category=$5, summary=$6, body=$7, cover_url=$8, status=$9, updated_at=now()
       WHERE id=$1 RETURNING id, slug`,
      [id, b.title, b.court, b.citation, b.category, b.summary, b.body, b.cover_url, b.status],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Case study not found' })
    res.json({ caseStudy: rows[0] })
  }),
)

router.delete(
  '/admin/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rowCount } = await query('DELETE FROM case_studies WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Case study not found' })
    res.json({ ok: true })
  }),
)

export default router
