// Shared layout for legal/policy pages (refund, privacy, terms).
export default function LegalPage({ title, updated, children }) {
  return (
    <article className="container-edvax max-w-3xl py-14">
      <h1 className="font-serif text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      {updated && <p className="mt-2 text-sm text-ink-muted">Last updated: {updated}</p>}
      <div className="legal mt-8 space-y-6 text-ink-soft leading-relaxed">{children}</div>
    </article>
  )
}

export function LegalSection({ heading, children }) {
  return (
    <section>
      <h2 className="font-serif text-xl font-bold text-ink">{heading}</h2>
      <div className="mt-2 space-y-3">{children}</div>
    </section>
  )
}
