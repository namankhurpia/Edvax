import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { mentors } from '../data/mock'
import { content } from '../lib/api'
import { normalizeCourse, normalizeCaseStudy } from '../lib/transform'
import CourseCard from '../components/CourseCard.jsx'
import { SectionHeading } from '../components/Section.jsx'

const features = [
  { title: 'Learn From The Best', body: 'Practitioners and senior advocates who litigate and advise every day — not just teach.' },
  { title: 'Practical, Case-Led', body: 'Every module is built around real notices, judgments and filings you will actually face.' },
  { title: 'Flexible Recordings', body: 'Live-recorded Zoom sessions you can revisit anytime, with lifetime access to purchased courses.' },
]

export default function Home() {
  const [courses, setCourses] = useState([])
  const [caseStudies, setCaseStudies] = useState([])

  useEffect(() => {
    content.courses().then((d) => setCourses(d.courses.map(normalizeCourse))).catch(() => {})
    content.caseStudies().then((d) => setCaseStudies(d.caseStudies.map(normalizeCaseStudy))).catch(() => {})
  }, [])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #c9a14a 0, transparent 40%)' }} />
        <div className="container-edvax relative grid items-center gap-10 py-20 lg:grid-cols-2 lg:py-28">
          <div>
            <span className="badge bg-white/10 text-gold-soft">India's premier Tax &amp; Law academy</span>
            <h1 className="mt-5 font-serif text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
              Outskill. Outshine. <span className="text-gold">Outperform.</span>
            </h1>
            <p className="mt-5 max-w-xl text-lg text-navy-100/85">
              Expert-led, case-driven training in Taxation, Law and Finance. Learn the practice of the law — from the people who practise it.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/courses" className="btn-primary">Browse Courses</Link>
              <Link to="/case-studies" className="btn-outline border-white/30 text-white hover:border-gold hover:text-gold-soft">
                Explore Case Studies
              </Link>
            </div>
            {/* TODO (pre-launch): replace with real figures or remove. These are placeholders. */}
            <div className="mt-10 flex gap-8 text-sm">
              <div><div className="font-serif text-2xl font-bold text-gold">{courses.length || '—'}</div><div className="text-navy-100/70">Courses available</div></div>
              <div><div className="font-serif text-2xl font-bold text-gold">Tax · Law</div><div className="text-navy-100/70">Specialisations</div></div>
              <div><div className="font-serif text-2xl font-bold text-gold">Expert-led</div><div className="text-navy-100/70">Practitioners</div></div>
            </div>
          </div>
          <div className="relative hidden lg:block">
            <div className="card overflow-hidden">
              <img src="https://images.unsplash.com/photo-1589829545856-d10d557cf95f?auto=format&fit=crop&w=900&q=70" alt="Law and study" className="h-[420px] w-full object-cover" />
            </div>
          </div>
        </div>
      </section>

      {/* Courses */}
      <section className="container-edvax py-16 lg:py-20">
        <div className="flex items-end justify-between">
          <SectionHeading eyebrow="Courses" title="Learn what the profession demands" subtitle="Curated programmes across tax, corporate, securities and labour law." />
          <Link to="/courses" className="hidden btn-outline sm:inline-flex">View all</Link>
        </div>
        {courses.length === 0 ? (
          <p className="mt-10 text-ink-muted">New courses are on the way. Check back soon.</p>
        ) : (
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {courses.slice(0, 6).map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
        )}
      </section>

      {/* Why EDVAX */}
      <section className="bg-white py-16 lg:py-20">
        <div className="container-edvax">
          <SectionHeading center eyebrow="Why EDVAX" title="Built for working professionals" />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-xl border border-ink/5 bg-paper p-7">
                <div className="grid h-11 w-11 place-items-center rounded-lg bg-navy-800 text-gold">★</div>
                <h3 className="mt-4 font-serif text-xl font-bold text-ink">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{f.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies preview */}
      {caseStudies.length > 0 && (
        <section className="container-edvax py-16 lg:py-20">
          <SectionHeading eyebrow="Case studies" title="Landmark judgments, explained" subtitle="Concise, practice-ready breakdowns of the cases that shape Indian tax and corporate law." />
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {caseStudies.slice(0, 6).map((cs) => (
              <Link key={cs.id} to={`/case-studies/${cs.slug}`} className="card p-6 transition hover:-translate-y-0.5">
                <span className="badge">{cs.category}</span>
                <h3 className="mt-3 font-serif text-lg font-bold text-ink">{cs.title}</h3>
                <p className="mt-1 text-xs font-medium text-ink-muted">{cs.court} · {cs.citation}</p>
                <p className="mt-3 line-clamp-3 text-sm text-ink-muted">{cs.summary}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Mentors */}
      <section className="bg-navy-900 py-16 text-white lg:py-20">
        <div className="container-edvax">
          <SectionHeading dark center eyebrow="Mentors" title="Learn from practitioners" />
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {mentors.map((m) => (
              <div key={m.id} className="rounded-xl bg-navy-800/60 p-7 text-center ring-1 ring-white/10">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-gold font-serif text-xl font-bold text-navy-900">{m.initials}</div>
                {m.role && (
                  <span className="mt-4 inline-block rounded-full bg-gold/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-gold-soft">{m.role}</span>
                )}
                <h3 className={`${m.role ? 'mt-2' : 'mt-4'} font-serif text-lg font-bold text-white`}>{m.name}</h3>
                {m.qualifications && (
                  <p className="mt-1 text-xs font-semibold uppercase tracking-wide text-gold-soft">{m.qualifications}</p>
                )}
                <p className="mt-2 text-sm text-navy-100/75">{m.title}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container-edvax py-16 lg:py-20">
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-navy-800 to-navy-900 px-8 py-14 text-center text-white">
          <h2 className="font-serif text-3xl font-bold sm:text-4xl">Ready to advance your practice?</h2>
          <p className="mx-auto mt-3 max-w-xl text-navy-100/85">Join thousands of professionals upskilling with EDVAX. Secure UPI checkout, lifetime access to recordings.</p>
          <Link to="/courses" className="btn-primary mt-7">Get started</Link>
        </div>
      </section>
    </>
  )
}
