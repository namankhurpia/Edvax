import crypto from 'crypto'
import Razorpay from 'razorpay'
import { config } from '../config.js'

// Instance is only created when keys exist. With placeholders, order creation
// returns a clear error instead of crashing the server.
let instance = null
export function getRazorpay() {
  if (instance) return instance
  if (!config.razorpay.keyId || !config.razorpay.keySecret) return null
  instance = new Razorpay({
    key_id: config.razorpay.keyId,
    key_secret: config.razorpay.keySecret,
  })
  return instance
}

// Verify the signature returned by Razorpay Checkout (client-side success).
export function verifyPaymentSignature({ orderId, paymentId, signature }) {
  const expected = crypto
    .createHmac('sha256', config.razorpay.keySecret)
    .update(`${orderId}|${paymentId}`)
    .digest('hex')
  return safeEqual(expected, signature)
}

// Verify the webhook signature (server-to-server).
export function verifyWebhookSignature(rawBody, signature) {
  if (!config.razorpay.webhookSecret) return false
  const expected = crypto
    .createHmac('sha256', config.razorpay.webhookSecret)
    .update(rawBody)
    .digest('hex')
  return safeEqual(expected, signature)
}

function safeEqual(a, b) {
  if (!a || !b) return false
  const ab = Buffer.from(a)
  const bb = Buffer.from(b)
  if (ab.length !== bb.length) return false
  return crypto.timingSafeEqual(ab, bb)
}
