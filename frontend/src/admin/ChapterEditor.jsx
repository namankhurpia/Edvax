// Chapter editor: choose how many chapters, then name each one.
// value is an array of { title }. Empty array = no chapters.
export default function ChapterEditor({ value = [], onChange }) {
  const chapters = Array.isArray(value) ? value : []

  function setCount(n) {
    const count = Math.max(0, Math.min(100, n || 0))
    const next = Array.from({ length: count }, (_, i) => chapters[i] || { title: '' })
    onChange(next)
  }

  function setTitle(i, title) {
    const next = chapters.map((c, idx) => (idx === i ? { ...c, title } : c))
    onChange(next)
  }

  function move(i, dir) {
    const j = i + dir
    if (j < 0 || j >= chapters.length) return
    const next = [...chapters]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange(next)
  }

  return (
    <div className="rounded-lg border border-ink/10 bg-paper/60 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="text-sm font-medium text-ink">Number of chapters</label>
        <input
          type="number"
          min={0}
          max={100}
          value={chapters.length}
          onChange={(e) => setCount(parseInt(e.target.value, 10))}
          className="w-24 rounded-md border border-ink/15 px-3 py-1.5 text-sm focus:border-gold focus:outline-none"
        />
        <div className="flex gap-1">
          <button type="button" onClick={() => setCount(chapters.length + 1)} className="rounded-md border border-ink/15 px-2.5 py-1 text-sm hover:border-gold">+ Add</button>
          {chapters.length > 0 && (
            <button type="button" onClick={() => setCount(chapters.length - 1)} className="rounded-md border border-ink/15 px-2.5 py-1 text-sm hover:border-gold">− Remove last</button>
          )}
        </div>
      </div>

      {chapters.length === 0 ? (
        <p className="mt-3 text-xs text-ink-muted">
          No chapters. The course page will show only the description.
        </p>
      ) : (
        <ul className="mt-4 space-y-2">
          {chapters.map((c, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-navy-50 text-xs font-semibold text-navy-700">{i + 1}</span>
              <input
                value={c.title}
                onChange={(e) => setTitle(i, e.target.value)}
                placeholder={`Chapter ${i + 1} title`}
                className="flex-1 rounded-md border border-ink/15 px-3 py-1.5 text-sm focus:border-gold focus:outline-none"
              />
              <div className="flex">
                <button type="button" aria-label="Move up" onClick={() => move(i, -1)} disabled={i === 0} className="px-1.5 text-ink-muted disabled:opacity-30 hover:text-ink">↑</button>
                <button type="button" aria-label="Move down" onClick={() => move(i, 1)} disabled={i === chapters.length - 1} className="px-1.5 text-ink-muted disabled:opacity-30 hover:text-ink">↓</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
