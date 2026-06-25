import { SectionHeading } from '../components/Section.jsx'

export default function About() {
  return (
    <>
      <section className="bg-navy-900 text-white">
        <div className="container-edvax py-16">
          <span className="badge bg-white/10 text-gold-soft">About EDVAX</span>
          <h1 className="mt-4 max-w-3xl font-serif text-4xl font-bold">
            We turn complex law and tax into practical, career-ready skill.
          </h1>
        </div>
      </section>

      <section className="container-edvax py-14">
        <div className="grid gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Our mission" title="Education built by practitioners" />
            <p className="mt-4 leading-relaxed text-ink-muted">
              EDVAX exists to bridge the gap between what is taught and what the profession actually requires.
              Our programmes are designed and delivered by chartered accountants, advocates and domain experts
              who work on the very matters they teach — from GST litigation to corporate governance.
            </p>
            <p className="mt-4 leading-relaxed text-ink-muted">
              Every course is case-led, recorded for flexible access, and backed by resources you can apply at work
              the next day. We focus on Indian tax, corporate, securities and labour law, with a growing library of
              landmark case studies.
            </p>
          </div>
          {/* TODO (pre-launch): replace with real figures once available. Placeholder labels for now. */}
          <div className="grid grid-cols-2 gap-4">
            {[
              ['Tax', 'GST, income tax & customs'],
              ['Law', 'Corporate & securities'],
              ['Live', 'Recorded expert sessions'],
              ['Practical', 'Case-led learning'],
            ].map(([n, l]) => (
              <div key={l} className="rounded-xl bg-white p-7 text-center shadow-card ring-1 ring-ink/5">
                <div className="font-serif text-3xl font-bold text-gold-dark">{n}</div>
                <div className="mt-1 text-sm text-ink-muted">{l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
