import nodemailer from 'nodemailer'
import { config } from '../config.js'

// Lazily build a transporter. If SMTP isn't configured, we log instead of failing —
// so the rest of the flow (payment, receipt record) still works with placeholders.
let transporter = null
function getTransporter() {
  if (transporter) return transporter
  if (!config.smtp.host || !config.smtp.user) return null
  transporter = nodemailer.createTransport({
    host: config.smtp.host,
    port: config.smtp.port,
    secure: config.smtp.secure,
    auth: { user: config.smtp.user, pass: config.smtp.pass },
  })
  return transporter
}

const inr = (paise) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(
    (paise || 0) / 100,
  )

// Receipt email: payment details + buyer details + support footer + Zoom link.
export async function sendReceiptEmail({
  to, buyer, courseTitle, amountPaise, orderId, paymentId, date, receiptNo, zoomRecordingUrl,
}) {
  const subject = `EDVAX receipt ${receiptNo} — ${courseTitle}`
  const when = new Date(date || Date.now()).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  })

  const row = (label, value) =>
    `<tr>
       <td style="padding:6px 0;color:#566177;font-size:13px;vertical-align:top">${label}</td>
       <td style="padding:6px 0;color:#0e1a2b;font-size:13px;text-align:right">${value || '—'}</td>
     </tr>`

  const html = `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:600px;margin:auto;color:#0e1a2b">
    <div style="background:#0a1626;padding:22px 24px;border-radius:10px 10px 0 0">
      <span style="color:#c9a14a;font-size:22px;font-weight:bold">EDVAX</span>
      <span style="color:#d6e0ee;font-size:13px;float:right;margin-top:6px">Payment receipt</span>
    </div>
    <div style="border:1px solid #eee;border-top:none;border-radius:0 0 10px 10px;padding:24px">
      <p style="margin:0 0 4px">Hi ${buyer?.name || 'there'},</p>
      <p style="margin:0 0 18px;color:#566177;font-size:14px">
        Thank you for your purchase. This email is your receipt and also contains your course recording link.
      </p>

      <h3 style="margin:0 0 8px;color:#142b46;font-size:15px">Payment details</h3>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee">
        ${row('Receipt no.', receiptNo)}
        ${row('Course', courseTitle)}
        ${row('Amount paid', inr(amountPaise))}
        ${row('Payment ID', paymentId)}
        ${row('Order ID', orderId)}
        ${row('Date', when)}
      </table>

      <h3 style="margin:22px 0 8px;color:#142b46;font-size:15px">Billed to</h3>
      <table style="width:100%;border-collapse:collapse;border-top:1px solid #eee">
        ${row('Name', buyer?.name)}
        ${row('Email', buyer?.email)}
        ${row('Phone', buyer?.phone)}
        ${row('Address', (buyer?.address || '').replace(/\n/g, '<br/>'))}
      </table>

      ${
        zoomRecordingUrl
          ? `<div style="margin:24px 0;padding:16px;background:#faf6ea;border:1px solid #e8d9a8;border-radius:8px">
               <p style="margin:0 0 10px;font-size:14px"><strong>Your course recording</strong></p>
               <a href="${zoomRecordingUrl}" style="background:#c9a14a;color:#0a1626;padding:10px 18px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:14px">Open recording</a>
               <p style="margin:10px 0 0;font-size:12px;color:#888">This link is for your purchase. Please don't share it.</p>
             </div>`
          : `<p style="margin:24px 0;font-size:13px;color:#888">Your course recording link will be shared shortly.</p>`
      }

      <hr style="border:none;border-top:1px solid #eee;margin:22px 0"/>
      <p style="font-size:12px;color:#888;margin:0 0 4px">
        Need help? Contact <a href="mailto:edvax.info@gmail.com" style="color:#a07f2e">edvax.info@gmail.com</a> or call +91 98268 04435.
        See our <a href="#" style="color:#a07f2e">refund policy</a>.
      </p>
      <p style="font-size:12px;color:#aaa;margin:0">EDVAX · Outskill. Outshine. Outperform.</p>
    </div>
  </div>`

  const t = getTransporter()
  if (!t) {
    console.log(`[email] (SMTP not configured) Would send receipt "${subject}" to ${to}`)
    return { skipped: true }
  }
  await t.sendMail({ from: config.smtp.from, to, subject, html })
  return { sent: true }
}
