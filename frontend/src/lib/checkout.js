import { api } from './api'

// Loads the Razorpay Checkout script once.
function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true)
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

/**
 * Runs the full accountless purchase flow for a course.
 * 1. POST /payments/order with buyer details -> Razorpay order
 * 2. Open Razorpay Checkout (UPI etc.)
 * 3. On success, POST /payments/verify -> server verifies signature, emails receipt + Zoom link
 * Returns a promise that resolves on verified success, rejects on failure/cancel.
 */
export async function purchaseCourse({ courseId, name, email, phone, address }) {
  const order = await api.post('/payments/order', { courseId, name, email, phone, address })

  const ok = await loadRazorpayScript()
  if (!ok) throw new Error('Could not load the payment gateway. Check your connection.')

  return new Promise((resolve, reject) => {
    const rzp = new window.Razorpay({
      key: order.keyId,
      amount: order.amount,
      currency: order.currency,
      name: 'EDVAX',
      description: order.courseTitle,
      order_id: order.orderId,
      prefill: { name: order.buyer?.name, email: order.buyer?.email, contact: order.buyer?.phone },
      theme: { color: '#0e1f33' },
      handler: async (resp) => {
        try {
          await api.post('/payments/verify', {
            razorpay_order_id: resp.razorpay_order_id,
            razorpay_payment_id: resp.razorpay_payment_id,
            razorpay_signature: resp.razorpay_signature,
          })
          resolve({ paymentId: resp.razorpay_payment_id })
        } catch (e) {
          reject(e)
        }
      },
      modal: { ondismiss: () => reject(new Error('Payment cancelled.')) },
    })
    rzp.on('payment.failed', (r) => reject(new Error(r.error?.description || 'Payment failed.')))
    rzp.open()
  })
}
