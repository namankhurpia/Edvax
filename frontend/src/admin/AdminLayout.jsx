import { NavLink, Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

const links = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/purchases', label: 'Purchases' },
  { to: '/admin/courses', label: 'Courses' },
  { to: '/admin/posts', label: 'Blog & News' },
  { to: '/admin/case-studies', label: 'Case Studies' },
]

export default function AdminLayout({ children }) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex min-h-screen bg-paper">
      <aside className="hidden w-60 shrink-0 flex-col bg-navy-900 p-5 text-navy-100 md:flex">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-navy-800 font-serif text-lg font-bold text-gold">E</span>
          <span className="font-serif text-lg font-bold text-white">EDVAX Admin</span>
        </Link>
        <nav className="mt-8 flex flex-col gap-1">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive ? 'bg-navy-800 text-gold-soft' : 'text-navy-100/80 hover:bg-navy-800/60'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto pt-6 text-sm">
          <p className="text-navy-100/60">{user?.email}</p>
          <button
            onClick={async () => { await logout(); navigate('/admin/login') }}
            className="mt-2 text-gold-soft hover:underline"
          >
            Log out
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-ink/10 bg-white px-6 py-3 md:hidden">
          <span className="font-serif font-bold text-ink">EDVAX Admin</span>
          <button onClick={async () => { await logout(); navigate('/admin/login') }} className="text-sm text-gold-dark">Log out</button>
        </header>
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  )
}
