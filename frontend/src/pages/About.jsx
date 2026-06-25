import { SectionHeading } from '../components/Section.jsx'

export default function About() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="container-edvax py-16">
          <span className="badge bg-white/10 text-gold-soft">About EDVAX</span>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold">
            Practical training in tax and law, led by practitioners.
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-navy-100/85">
            EDVAX turns complex tax and legal subjects into clear, career-ready skills you can
            apply in practice the next day.
          </p>
        </div>
      </section>

      <section className="container-edvax py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our mission" title="Education built by practitioners" />
            <p className="mt-4 leading-relaxed text-ink-muted">
              EDVAX exists to bridge the gap between what is taught and what the profession actually
              requires. Our courses are designed and delivered by practising taxation lawyers and
              domain experts who work on the very matters they teach — from GST laws and litigation
              to wider questions of taxation and compliance.
            </p>
            <p className="mt-4 leading-relaxed text-ink-muted">
              Every course is delivered as a recorded online session, so you can learn at your own
              pace and revisit the material whenever you need. We focus on Indian taxation and law,
              with practical, case-led explanations rather than dry theory.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Tax', 'GST, income tax & more'],
              ['Law', 'Litigation & compliance'],
              ['Recorded', 'Learn at your own pace'],
              ['Practical', 'Case-led teaching'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white p-7 text-center shadow-card ring-1 ring-ink/5">
                <div className="font-serif text-3xl font-bold text-gold-dark">{n}</div>
                <div className="mt-1 text-sm text-ink-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Founder */}
      <section className="bg-white py-14">
        <div className="container-edvax">
          <SectionHeading eyebrow="Founder" title="Meet the founder" />
          <div className="mt-8 flex flex-col items-start gap-6 rounded-2xl bg-paper p-7 ring-1 ring-ink/5 sm:flex-row sm:items-center">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-full bg-navy-800 font-serif text-2xl font-bold text-gold">
              PK
            </div>
            <div>
              <h3 className="font-serif text-xl font-bold text-ink">Palash Khurpia</h3>
              <p className="mt-1 text-sm font-semibold uppercase tracking-wide text-gold-dark">
                M.Com, LLB, LLM · Founder
              </p>
              <p className="mt-3 leading-relaxed text-ink-muted">
                Palash Khurpia is a taxation lawyer, a speaker on GST laws and a litigation
                enthusiast. He founded EDVAX to share practical, real-world tax and legal knowledge
                with students and professionals across India through accessible, expert-led courses.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
