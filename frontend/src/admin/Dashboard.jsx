import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import AdminLayout from './AdminLayout'
import { admin } from '../lib/api'

export default function Dashboard() {
  const [stats, setStats] = useState({ courses: 0, posts: 0, caseStudies: 0, purchases: 0 })

  useEffect(() => {
    Promise.all([admin.courses(), admin.posts(), admin.caseStudies(), admin.purchases(true)])
      .then(([c, p, cs, pu]) =>
        setStats({
          courses: c.courses.length,
          posts: p.posts.length,
          caseStudies: cs.caseStudies.length,
          purchases: pu.purchases.length,
        }),
      )
      .catch(() => {})
  }, [])

  const cards = [
    { label: 'Paid purchases', value: stats.purchases, to: '/admin/purchases' },
    { label: 'Courses', value: stats.courses, to: '/admin/courses' },
    { label: 'Blog & News', value: stats.posts, to: '/admin/posts' },
    { label: 'Case Studies', value: stats.caseStudies, to: '/admin/case-studies' },
  ]

  return (
    <AdminLayout>
      <h1 className="font-serif text-2xl font-bold text-ink">Dashboard</h1>
      <p className="mt-1 text-sm text-ink-muted">Manage all EDVAX content from one place.</p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link key={c.label} to={c.to} className="card p-6 transition hover:-translate-y-0.5">
            <div className="font-serif text-3xl font-bold text-gold-dark">{c.value}</div>
            <div className="mt-1 text-sm font-medium text-ink-muted">{c.label}</div>
          </Link>
        ))}
      </div>
    </AdminLayout>
  )
}
