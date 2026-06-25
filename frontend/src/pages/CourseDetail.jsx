import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { formatINR } from '../data/mock'
import { content } from '../lib/api'
import { normalizeCourse } from '../lib/transform'
import { purchaseCourse } from '../lib/checkout'

export default function CourseDetail() {
  const { slug } = useParams()
  const [course, setCourse] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    setLoading(true)
    content
      .course(slug)
      .then((d) => setCourse(normalizeCourse(d.course)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container-edvax py-24">
        <div className="mx-auto h-8 w-64 animate-pulse rounded bg-white/70" />
        <div className="mx-auto mt-4 h-4 w-96 animate-pulse rounded bg-white/60" />
      </div>
    )
  }

  if (notFound || !course) {
    return (
      <div className="container-edvax py-24 text-center">
        <h1 className="font-serif text-2xl font-bold">Course not found</h1>
        <Link to="/courses" className="btn-primary mt-6">Back to courses</Link>
      </div>
    )
  }

  const off = course.mrp > course.price ? Math.round(((course.mrp - course.price) / course.mrp) * 100) : 0
  const hasChapters = course.chapters && course.chapters.length > 0

  return (
    <>
      {/* Hero */}
      <div className="bg-navy-900 text-white">
        <div className="container-edvax grid gap-10 py-14 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Link to="/courses" className="text-sm font-medium text-gold-soft hover:underline">← All courses</Link>
            <span className="mt-3 block"><span className="badge bg-white/10 text-gold-soft">{course.category}</span></span>
            <h1 className="mt-4 font-serif text-3xl font-bold sm:text-4xl">{course.title}</h1>
            {course.subtitle && <p className="mt-3 max-w-2xl text-lg text-navy-100/85">{course.subtitle}</p>}
            <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-navy-100/75">
              {course.instructor && <span>By {course.instructor}</span>}
              {course.lessons > 0 && <span>{course.lessons} lessons</span>}
              {course.hours > 0 && <span>{course.hours} hours</span>}
              {hasChapters && <span>{course.chapters.length} chapters</span>}
            </div>
          </div>
        </div>
      </div>

      <div className="container-edvax grid gap-10 py-12 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Description — always shown */}
          <section>
            <h2 className="font-serif text-2xl font-bold text-ink">About this course</h2>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-ink-muted">
              {course.description || 'Course details coming soon.'}
            </p>
          </section>

          {/* Chapters — only when the admin added them */}
          {hasChapters && (
            <section className="mt-12">
              <div className="flex items-baseline justify-between">
                <h2 className="font-serif text-2xl font-bold text-ink">Course chapters</h2>
                <span className="text-sm text-ink-muted">{course.chapters.length} chapters</span>
              </div>
              <ol className="mt-5 space-y-3">
                {course.chapters.map((ch, i) => (
                  <li key={i} className="flex items-start gap-4 rounded-xl bg-white p-4 shadow-card ring-1 ring-ink/5">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy-800 text-sm font-semibold text-gold">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <div className="pt-1">
                      <p className="font-serif text-base font-bold text-ink">{ch.title || `Chapter ${i + 1}`}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="mt-10 rounded-xl border border-gold/30 bg-gold/5 p-5 text-sm text-ink-soft">
            🔒 This course is delivered as a recorded Zoom session. After secure UPI payment, the recording link is emailed to you along with your receipt — and is never shared publicly.
          </div>
        </div>

        {/* Sticky purchase card */}
        <aside className="lg:col-span-1">
          <div className="card sticky top-20 overflow-hidden">
            <img src={course.thumbnail} alt={course.title} className="aspect-video w-full object-cover" />
            <div className="p-6">
              <div className="flex items-end gap-2">
                <span className="font-serif text-3xl font-bold text-ink">{formatINR(course.price)}</span>
                {off > 0 && <span className="pb-1 text-sm text-ink-muted line-through">{formatINR(course.mrp)}</span>}
                {off > 0 && <span className="mb-1 rounded-full bg-gold/15 px-2 py-0.5 text-xs font-bold text-gold-dark">{off}% off</span>}
              </div>
              <button onClick={() => setShowForm(true)} className="btn-primary mt-5 w-full">Enrol via UPI</button>
              <p className="mt-3 text-center text-xs text-ink-muted">Secure checkout · Razorpay UPI · Recording emailed to you</p>
              {/* TODO (pre-launch): confirm which perks actually apply (certificate?
                  lifetime access?) and remove any that don't. Placeholders for now. */}
              <ul className="mt-6 space-y-2 text-sm text-ink-soft">
                {course.hours > 0 && <li>✓ {course.hours} hours of recordings</li>}
                {hasChapters && <li>✓ {course.chapters.length} structured chapters</li>}
                <li>✓ Recording link emailed after payment</li>
              </ul>
            </div>
          </div>
        </aside>
      </div>

      {showForm && <EnrolModal course={course} onClose={() => setShowForm(false)} />}
    </>
  )
}

function EnrolModal({ course, onClose }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', address: '' })
  const [status, setStatus] = useState('form') // form | paying | success
  const [error, setError] = useState('')

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  async function submit(e) {
    e.preventDefault()
    setError('')
    setStatus('paying')
    try {
      await purchaseCourse({ courseId: course.id, ...form })
      setStatus('success')
    } catch (err) {
      setError(err.message || 'Something went wrong.')
      setStatus('form')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/60 p-4" onClick={onClose}>
      <div className="card w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
        {status === 'success' ? (
          <div className="py-8 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-gold/20 text-2xl text-gold-dark">✓</div>
            <h3 className="mt-4 font-serif text-xl font-bold text-ink">Payment successful</h3>
            <p className="mt-2 text-sm text-ink-muted">
              Your receipt and the course recording link have been emailed to <strong>{form.email}</strong>.
              Please check your inbox (and spam folder).
            </p>
            <button onClick={onClose} className="btn-primary mt-6">Done</button>
          </div>
        ) : (
          <>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-serif text-xl font-bold text-ink">Enrol — {course.title}</h3>
                <p className="mt-1 text-sm text-ink-muted">{formatINR(course.price)} · pay via UPI</p>
              </div>
              <button onClick={onClose} aria-label="Close" className="text-ink-muted hover:text-ink">✕</button>
            </div>

            {error && <p className="mt-4 rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>}

            <form onSubmit={submit} className="mt-4 space-y-3">
              <input required placeholder="Full name" value={form.name} onChange={set('name')}
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              <input required type="email" placeholder="Email (receipt + recording go here)" value={form.email} onChange={set('email')}
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              <input required placeholder="Phone number" value={form.phone} onChange={set('phone')}
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              <textarea required rows={2} placeholder="Address" value={form.address} onChange={set('address')}
                className="w-full rounded-md border border-ink/15 px-3 py-2 text-sm focus:border-gold focus:outline-none" />
              <button disabled={status === 'paying'} className="btn-primary w-full disabled:opacity-60">
                {status === 'paying' ? 'Opening payment…' : `Pay ${formatINR(course.price)} via UPI`}
              </button>
              <p className="text-center text-xs text-ink-muted">
                Secured by Razorpay. Your recording link is emailed after payment.
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  )
}
