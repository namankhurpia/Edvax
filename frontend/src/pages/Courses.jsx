import { useEffect, useMemo, useState } from 'react'
import CourseCard from '../components/CourseCard.jsx'
import { SectionHeading } from '../components/Section.jsx'
import { content } from '../lib/api'
import { normalizeCourse } from '../lib/transform'

export default function Courses() {
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [cat, setCat] = useState('All')
  const [q, setQ] = useState('')

  useEffect(() => {
    content
      .courses()
      .then((d) => setCourses(d.courses.map(normalizeCourse)))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }, [])

  const categories = useMemo(
    () => ['All', ...new Set(courses.map((c) => c.category).filter(Boolean))],
    [courses],
  )

  const filtered = courses.filter(
    (c) =>
      (cat === 'All' || c.category === cat) &&
      (c.title.toLowerCase().includes(q.toLowerCase()) ||
        (c.subtitle || '').toLowerCase().includes(q.toLowerCase())),
  )

  return (
    <div className="container-edvax py-14">
      <SectionHeading eyebrow="All courses" title="Find your next course" subtitle="Expert-led, case-driven programmes in tax, law and finance." />

      <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
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
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search courses…"
          className="w-full rounded-md border border-ink/15 bg-white px-4 py-2 text-sm focus:border-gold focus:outline-none sm:w-64"
        />
      </div>

      {loading ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2].map((i) => <div key={i} className="h-80 animate-pulse rounded-xl bg-white/60 ring-1 ring-ink/5" />)}
        </div>
      ) : error ? (
        <p className="mt-16 text-center text-ink-muted">Couldn't load courses. {error}</p>
      ) : (
        <>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => <CourseCard key={c.id} course={c} />)}
          </div>
          {filtered.length === 0 && (
            <p className="mt-16 text-center text-ink-muted">
              {courses.length === 0 ? 'No courses published yet. Add one from the admin panel.' : 'No courses match your search.'}
            </p>
          )}
        </>
      )}
    </div>
  )
}
