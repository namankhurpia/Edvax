// `dark` makes the heading readable on dark (navy) backgrounds.
export function SectionHeading({ eyebrow, title, subtitle, center, dark }) {
  return (
    <div className={center ? 'mx-auto max-w-2xl text-center' : 'max-w-2xl'}>
      {eyebrow && (
        <span className={`text-sm font-semibold uppercase tracking-widest ${dark ? 'text-gold-soft' : 'text-gold-dark'}`}>
          {eyebrow}
        </span>
      )}
      <h2 className={`mt-2 font-serif text-3xl font-bold sm:text-4xl ${dark ? 'text-white' : 'text-ink'}`}>{title}</h2>
      {subtitle && <p className={`mt-3 text-base ${dark ? 'text-navy-100/80' : 'text-ink-muted'}`}>{subtitle}</p>}
    </div>
  )
}
