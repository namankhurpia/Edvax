import { Router } from 'express'
import { z } from 'zod'
import { query } from '../db/pool.js'
import { validateBody, asyncHandler } from '../middleware/validate.js'
import { requireAdmin } from '../middleware/auth.js'
import { getRazorpay, verifyPaymentSignature, verifyWebhookSignature } from '../services/razorpay.js'
import { sendReceiptEmail } from '../services/email.js'

const router = Router()

// --- Admin: list purchases so staff can grant Zoom access / support buyers ---
router.get(
  '/admin/all',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const onlyPaid = req.query.status === 'paid'
    const { rows } = await query(
      `SELECT p.id, p.buyer_name, p.buyer_email, p.buyer_phone, p.buyer_address,
              p.amount_paise, p.status, p.invite_sent, p.razorpay_order_id, p.razorpay_payment_id, p.created_at,
              c.title AS course_title, c.id AS course_id
         FROM payments p JOIN courses c ON c.id = p.course_id
        ${onlyPaid ? `WHERE p.status = 'paid'` : ''}
        ORDER BY p.created_at DESC`,
    )
    res.json({ purchases: rows })
  }),
)

// --- Admin: toggle the "invite sent" flag for a purchase ---
router.post(
  '/admin/:id/invite',
  requireAdmin,
  validateBody(z.object({ sent: z.boolean() })),
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rows } = await query(
      `UPDATE payments SET invite_sent = $1 WHERE id = $2 RETURNING id, invite_sent`,
      [req.body.sent, id],
    )
    if (!rows[0]) return res.status(404).json({ error: 'Purchase not found' })
    res.json({ purchase: rows[0] })
  }),
)

// --- Admin: re-send the receipt + Zoom link email for a purchase ---
router.post(
  '/admin/:id/resend',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10)
    const { rows } = await query('SELECT razorpay_order_id, status FROM payments WHERE id = $1', [id])
    if (!rows[0]) return res.status(404).json({ error: 'Purchase not found' })
    if (rows[0].status !== 'paid') return res.status(400).json({ error: 'Purchase is not paid' })
    await sendReceiptForOrder(rows[0].razorpay_order_id)
    res.json({ ok: true })
  }),
)

// Send the receipt (payment details + buyer details + Zoom link). Idempotent-ish:
// safe to call again; we only send when the payment row is marked paid.
async function sendReceiptForOrder(orderId) {
  const { rows } = await query(
    `SELECT p.id, p.buyer_name, p.buyer_email, p.buyer_phone, p.buyer_address,
            p.amount_paise, p.razorpay_order_id, p.razorpay_payment_id, p.created_at,
            c.title AS course_title, c.zoom_recording_url
       FROM payments p JOIN courses c ON c.id = p.course_id
      WHERE p.razorpay_order_id = $1`,
    [orderId],
  )
  const p = rows[0]
  if (!p || !p.buyer_email) return
  try {
    await sendReceiptEmail({
      to: p.buyer_email,
      buyer: { name: p.buyer_name, email: p.buyer_email, phone: p.buyer_phone, address: p.buyer_address },
      courseTitle: p.course_title,
      amountPaise: p.amount_paise,
      orderId: p.razorpay_order_id,
      paymentId: p.razorpay_payment_id,
      date: p.created_at,
      receiptNo: `EDVAX-${String(p.id).padStart(6, '0')}`,
      zoomRecordingUrl: p.zoom_recording_url,
    })
  } catch (e) {
    console.error('[payments] receipt email failed:', e.message)
  }
}

const buyerSchema = z.object({
  courseId: z.number().int().positive(),
  name: z.string().min(2).max(120),
  email: z.string().email().max(160),
  phone: z.string().min(6).max(20),
  address: z.string().min(4).max(400),
})

// --- Create a Razorpay order for a course, capturing buyer details ---
router.post(
  '/order',
  validateBody(buyerSchema),
  asyncHandler(async (req, res) => {
    const { courseId, name, email, phone, address } = req.body
    const { rows } = await query(
      `SELECT id, title, price_paise FROM courses WHERE id = $1 AND status = 'published'`,
      [courseId],
    )
    const course = rows[0]
    if (!course) return res.status(404).json({ error: 'Course not found' })

    const rzp = getRazorpay()
    if (!rzp) {
      return res.status(503).json({
        error: 'Payments are not configured yet. Please set Razorpay keys.',
      })
    }

    const order = await rzp.orders.create({
      amount: course.price_paise,
      currency: 'INR',
      receipt: `course_${course.id}_${Date.now()}`,
      notes: { courseId: String(course.id), email },
    })

    await query(
      `INSERT INTO payments
        (course_id, buyer_name, buyer_email, buyer_phone, buyer_address,
         razorpay_order_id, amount_paise, status)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'created')`,
      [course.id, name, email.toLowerCase(), phone, address, order.id, course.price_paise],
    )

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseTitle: course.title,
      buyer: { name, email, phone },
    })
  }),
)

// --- Verify payment after Checkout success (client callback) ---
router.post(
  '/verify',
  validateBody(
    z.object({
      razorpay_order_id: z.string(),
      razorpay_payment_id: z.string(),
      razorpay_signature: z.string(),
    }),
  ),
  asyncHandler(async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body

    const ok = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    })
    if (!ok) return res.status(400).json({ error: 'Payment signature verification failed' })

    const { rowCount } = await query(
      `UPDATE payments SET razorpay_payment_id = $1, status = 'paid'
        WHERE razorpay_order_id = $2 AND status <> 'paid'`,
      [razorpay_payment_id, razorpay_order_id],
    )
    // Only email on the transition to paid (rowCount > 0 means we just flipped it).
    if (rowCount > 0) await sendReceiptForOrder(razorpay_order_id)

    res.json({ ok: true })
  }),
)

// --- Razorpay webhook (server-to-server, signature-verified). ---
router.post(
  '/webhook',
  asyncHandler(async (req, res) => {
    const signature = req.headers['x-razorpay-signature']
    const raw = req.body // Buffer (raw)
    if (!verifyWebhookSignature(raw, signature)) {
      return res.status(400).json({ error: 'Invalid webhook signature' })
    }
    const event = JSON.parse(raw.toString('utf8'))

    if (event.event === 'payment.captured' || event.event === 'order.paid') {
      const entity = event.payload?.payment?.entity || event.payload?.order?.entity
      const orderId = entity?.order_id || entity?.id
      const paymentId = event.payload?.payment?.entity?.id
      if (orderId) {
        const { rowCount } = await query(
          `UPDATE payments SET status='paid',
             razorpay_payment_id = COALESCE(razorpay_payment_id, $2)
           WHERE razorpay_order_id = $1 AND status <> 'paid'`,
          [orderId, paymentId || null],
        )
        if (rowCount > 0) await sendReceiptForOrder(orderId)
      }
    }
    res.json({ ok: true })
  }),
)

export default router
