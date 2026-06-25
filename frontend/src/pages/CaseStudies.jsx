import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { content } from '../lib/api'
import { normalizeCaseStudy } from '../lib/transform'
import { SectionHeading } from '../components/Section.jsx'

export default function CaseStudies() {
  const [cat, setCat] = useState('All')
  const [caseStudies, setCaseStudies] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    content
      .caseStudies()
      .then((d) => setCaseStudies(d.caseStudies.map(normalizeCaseStudy)))
      .catch(() => setCaseStudies([]))
      .finally(() => setLoading(false))
  }, [])

  const cats = useMemo(
    () => ['All', ...new Set(caseStudies.map((c) => c.category).filter(Boolean))],
    [caseStudies],
  )
  const list = caseStudies.filter((c) => cat === 'All' || c.category === cat)

  return (
    <div className="container-edvax py-14">
      <SectionHeading eyebrow="Case studies" title="Landmark judgments, distilled" subtitle="Practice-ready breakdowns of the cases that shape Indian tax, corporate and securities law." />

      <div className="mt-8 flex flex-wrap gap-2">
        {cats.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
              cat === c ? 'bg-navy-800 text-white' : 'bg-white text-ink-muted ring-1 ring-ink/10 hover:ring-gold'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {[0, 1].map((i) => <div key={i} className="h-44 animate-pulse rounded-xl bg-white/60 ring-1 ring-ink/5" />)}
        </div>
      ) : list.length === 0 ? (
        <p className="mt-16 text-center text-ink-muted">No case studies published yet. Add one from the admin panel.</p>
      ) : (
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {list.map((cs) => (
            <Link key={cs.id} to={`/case-studies/${cs.slug}`} className="card group p-7 transition hover:-translate-y-0.5">
              <div className="flex items-center justify-between">
                <span className="badge">{cs.category}</span>
                <span className="text-xs font-medium text-ink-muted">{cs.citation}</span>
              </div>
              <h3 className="mt-4 font-serif text-xl font-bold text-ink group-hover:text-gold-dark">{cs.title}</h3>
              <p className="mt-1 text-sm font-medium text-gold-dark">{cs.court}</p>
              <p className="mt-3 line-clamp-3 leading-relaxed text-ink-muted">{cs.summary}</p>
              <span className="mt-4 inline-block text-sm font-semibold text-gold-dark">Read full case →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
