import { Link } from 'react-router-dom'
import { formatINR } from '../data/mock'

export default function CourseCard({ course }) {
  const off = Math.round(((course.mrp - course.price) / course.mrp) * 100)
  return (
    <Link to={`/courses/${course.slug}`} className="card group flex flex-col overflow-hidden">
      <div className="relative aspect-[16/9] overflow-hidden">
        <img
          src={course.thumbnail}
          alt={course.title}
          loading="lazy"
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 badge bg-white/90">{course.category}</span>
        {off > 0 && (
          <span className="absolute right-3 top-3 rounded-full bg-gold px-2.5 py-1 text-xs font-bold text-navy-900">
            {off}% off
          </span>
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <h3 className="font-serif text-lg font-bold leading-snug text-ink group-hover:text-gold-dark">
          {course.title}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink-muted">{course.subtitle}</p>
        <p className="mt-3 text-sm font-medium text-ink-soft">by {course.instructor}</p>
        <div className="mt-2 flex items-center gap-3 text-xs text-ink-muted">
          <span>{course.lessons} lessons</span>
          <span>•</span>
          <span>{course.hours} hrs</span>
          {course.rating != null && (
            <>
              <span>•</span>
              <span className="text-gold-dark">★ {course.rating}</span>
            </>
          )}
        </div>
        <div className="mt-4 flex items-end gap-2 border-t border-ink/5 pt-4">
          <span className="text-xl font-bold text-ink">{formatINR(course.price)}</span>
          <span className="text-sm text-ink-muted line-through">{formatINR(course.mrp)}</span>
        </div>
      </div>
    </Link>
  )
}
