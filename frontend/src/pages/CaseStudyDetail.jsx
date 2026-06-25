import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { content } from '../lib/api'
import { normalizeCaseStudy } from '../lib/transform'

export default function CaseStudyDetail() {
  const { slug } = useParams()
  const [cs, setCs] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setLoading(true)
    content
      .caseStudy(slug)
      .then((d) => setCs(normalizeCaseStudy(d.caseStudy)))
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false))
  }, [slug])

  if (loading) {
    return (
      <div className="container-edvax max-w-3xl py-14">
        <div className="h-6 w-40 animate-pulse rounded bg-white/70" />
        <div className="mt-4 h-10 w-full animate-pulse rounded bg-white/60" />
        <div className="mt-6 h-40 w-full animate-pulse rounded-xl bg-white/60" />
      </div>
    )
  }

  if (notFound || !cs) {
    return (
      <div className="container-edvax py-24 text-center">
        <h1 className="font-serif text-2xl font-bold">Case study not found</h1>
        <Link to="/case-studies" className="btn-primary mt-6">Back to case studies</Link>
      </div>
    )
  }

  return (
    <article>
      {/* Hero */}
      <header className="border-b border-ink/10 bg-white">
        <div className="container-edvax max-w-4xl py-12">
          <Link to="/case-studies" className="text-sm font-medium text-gold-dark hover:underline">← Back to case studies</Link>
          <div className="mt-5 flex flex-wrap items-center gap-2">
            <span className="badge">{cs.category}</span>
            {cs.citation && (
              <span className="rounded-full bg-ink/5 px-3 py-1 text-xs font-medium text-ink-muted">{cs.citation}</span>
            )}
          </div>
          <h1 className="mt-4 font-serif text-3xl font-bold leading-tight text-ink sm:text-4xl">{cs.title}</h1>
          {cs.court && (
            <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-gold-dark">
              <span className="inline-block h-px w-6 bg-gold" />
              {cs.court}
            </p>
          )}
        </div>
      </header>

      <div className="container-edvax max-w-4xl py-12">
        {cs.cover && (
          <img src={cs.cover} alt={cs.title} className="mb-10 aspect-[21/9] w-full rounded-2xl object-cover shadow-card" />
        )}

        {cs.summary && (
          <section className="mb-10">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Summary</h2>
            <p className="mt-3 border-l-2 border-gold/60 pl-5 font-serif text-xl leading-relaxed text-ink">
              {cs.summary}
            </p>
          </section>
        )}

        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gold-dark">Full analysis</h2>
          <div className="prose-edvax mt-3 whitespace-pre-line text-[1.05rem] leading-relaxed text-ink-soft">
            {cs.body || 'The detailed analysis for this case study will be published soon.'}
          </div>
        </section>
      </div>
    </article>
  )
}
