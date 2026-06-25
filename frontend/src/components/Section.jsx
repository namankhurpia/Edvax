export function SectionHeading({ eyebrow, title, subtitle, center }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className="text-sm font-semibold uppercase tracking-widest text-gold-dark">
          {eyebrow}
        </span>
      )}
      <h2 className="mt-2 font-serif text-3xl font-bold text-ink sm:text-4xl">{title}</h2>
      {subtitle && <p className="mt-3 text-base text-ink-muted">{subtitle}</p>}
    </div>
  )
}
