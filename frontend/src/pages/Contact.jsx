import { useState } from 'react'
import { SectionHeading } from '../components/Section.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)
  return (
    <div className="container-edvax grid gap-12 py-14 lg:grid-cols-2">
      <div>
        <SectionHeading eyebrow="Contact" title="We'd love to hear from you" subtitle="Questions about a course or a payment? Reach out and we'll be glad to help." />
        <div className="mt-8 space-y-4 text-sm text-ink-soft">
          <p><span className="font-semibold text-ink">Contact:</span> Palash Khurpia</p>
          <p><span className="font-semibold text-ink">Email:</span> <a href="mailto:edvax.info@gmail.com" className="text-gold-dark hover:underline">edvax.info@gmail.com</a></p>
          <p><span className="font-semibold text-ink">Phone:</span> <a href="tel:+919826804435" className="text-gold-dark hover:underline">+91 98268 04435</a></p>
          <p><span className="font-semibold text-ink">Hours:</span> Mon–Sat, 10am – 6pm IST</p>
          <p><span className="font-semibold text-ink">Payments:</span> Razorpay UPI (India)</p>
        </div>
      </div>

      <form
        onSubmit={(e) => { e.preventDefault(); setSent(true) }}
        className="card space-y-4 p-7"
      >
        {sent ? (
          <div className="py-10 text-center">
            <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gold/20 text-gold-dark">✓</div>
            <p className="mt-4 font-semibold text-ink">Thanks — we'll be in touch soon.</p>
          </div>
        ) : (
          <>
            <div>
              <label className="text-sm font-medium text-ink">Name</label>
              <input required className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Email</label>
              <input type="email" required className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
            </div>
            <div>
              <label className="text-sm font-medium text-ink">Message</label>
              <textarea required rows={5} className="mt-1 w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
            </div>
            <button className="btn-primary w-full">Send message</button>
          </>
        )}
      </form>
    </div>
  )
}
