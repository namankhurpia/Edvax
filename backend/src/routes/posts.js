import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { validateBody, asyncHandler } from '../middleware/validate.js'
import { requireAdmin } from '../middleware/auth.js'
import { slugify } from '../utils/slug.js'

const router = Router()

// --- Public: list published posts, optional ?type=blog|news ---
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { type } = req.query
    const params = []
    let where = `status = 'published'`
    if (type === 'blog' || type === 'news') {
      params.push(type)
      where += ` AND type = $${params.length}`
    }
    const { rows } = await query(
      `SELECT id, slug, type, title, excerpt, author, cover_url, published_at
         FROM posts WHERE ${where} ORDER BY published_at DESC NULLS LAST, created_at DESC`,
      params,
    )
    res.json({ posts: rows })
  }),
)

// --- Public: single published post ---
router.get(
  '/:slug',
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, type, title, excerpt, body, author, cover_url, published_at
         FROM posts WHERE slug = $1 AND status = 'published'`,
      [req.params.slug],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Post not found' })
    res.json({ post: rows[0] })
  }),
)

// ===== Admin CRUD =====
const postSchema = z.object({
  type: z.enum(['blog', 'news']).default('blog'),
  title: z.string().min(3).max(250),
  excerpt: z.string().max(600).optional().default(''),
  body: z.string().max(50000).optional().default(''),
  author: z.string().max(160).optional().default(''),
  cover_url: z.string().max(500).optional().default(''),
  status: z.enum(['draft', 'published']).default('draft'),
})

router.get(
  '/admin/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const { rows } = await query(
      `SELECT id, slug, type, title, author, status, published_at, created_at
         FROM posts ORDER BY created_at DESC`,
    )
    res.json({ posts: rows })
  }),
)

// Admin: full single record (all fields) for the edit form.
router.get(
  '/admin/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rows } = await query(
      `SELECT id, slug, type, title, excerpt, body, author, cover_url, status
         FROM posts WHERE id = $1`,
      [id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Post not found' })
    res.json({ post: rows[0] })
  }),
)

router.post(
  '/admin',
  requireAdmin,
  validateBody(postSchema),
  asyncHandler(async (req, res) => {
    const b = req.body
    const slug = slugify(b.title) + '-' + Date.now().toString(36)
    const publishedAt = b.status === 'published' ? new Date() : null
    const { rows } = await query(
      `INSERT INTO posts (slug,type,title,excerpt,body,author,cover_url,status,published_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id, slug`,
      [slug, b.type, b.title, b.excerpt, b.body, b.author, b.cover_url, b.status, publishedAt],
    )
    res.status(201).json({ post: rows[0] })
  }),
)

router.put(
  '/admin/:id',
  requireAdmin,
  validateBody(postSchema),
  asyncHandler(async (req, res) => {
    const b = req.body
    const id = parseInt(req.params.id, 10)
    // Set published_at when first published; keep existing otherwise.
    const { rows } = await query(
      `UPDATE posts SET
        type=$2, title=$3, excerpt=$4, body=$5, author=$6, cover_url=$7, status=$8,
        published_at = CASE WHEN $8='published' AND published_at IS NULL THEN now() ELSE published_at END,
        updated_at=now()
       WHERE id=$1 RETURNING id, slug`,
      [id, b.type, b.title, b.excerpt, b.body, b.author, b.cover_url, b.status],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Post not found' })
    res.json({ post: rows[0] })
  }),
)

router.delete(
  '/admin/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rowCount } = await query('DELETE FROM posts WHERE id = $1', [id])
    if (!rowCount) return res.status(404).json({ error: 'Post not found' })
    res.json({ ok: true })
  }),
)

export default router
