import { Link, NavLink, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'

const nav = [
  { to: '/', label: 'Home' },
  { to: '/courses', label: 'Courses' },
  { to: '/case-studies', label: 'Case Studies' },
  { to: '/blog', label: 'Blog & News' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
]

function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-md bg-navy-800 font-serif text-lg font-bold text-gold">
        E
      </span>
      <span className="font-serif text-xl font-bold tracking-tight text-ink">
        EDVAX
      </span>
    </Link>
  )
}

export default function Layout({ children }) {
  const [open, setOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => setOpen(false), [pathname])

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 border-b border-ink/10 bg-paper/90 backdrop-blur">
        <div className="container-edvax flex h-16 items-center justify-between">
          <Logo />
          <nav className="hidden items-center gap-1 md:flex">
            {nav.map((n) => (
              <NavLink
                key={n.to}
                to={n.to}
                end={n.to === '/'}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm font-medium transition ${
                    isActive ? 'text-gold-dark' : 'text-ink-muted hover:text-ink'
                  }`
                }
              >
                {n.label}
              </NavLink>
            ))}
          </nav>
          <div className="hidden items-center gap-3 md:flex">
            <Link to="/courses" className="btn-primary">
              Explore Courses
            </Link>
          </div>
          <button
            className="md:hidden"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
          >
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
        {open && (
          <div className="border-t border-ink/10 bg-paper md:hidden">
            <div className="container-edvax flex flex-col py-3">
              {nav.map((n) => (
                <NavLink
                  key={n.to}
                  to={n.to}
                  end={n.to === '/'}
                  className="rounded-md px-3 py-2 text-sm font-medium text-ink-muted hover:bg-navy-50"
                >
                  {n.label}
                </NavLink>
              ))}
              <Link to="/courses" className="btn-primary mt-2">Explore Courses</Link>
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="mt-20 bg-navy-900 text-navy-100">
        <div className="container-edvax grid gap-10 py-14 md:grid-cols-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="grid h-9 w-9 place-items-center rounded-md bg-navy-800 font-serif text-lg font-bold text-gold">E</span>
              <span className="font-serif text-xl font-bold text-white">EDVAX</span>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-navy-100/80">
              Outskill. Outshine. Outperform. Expert-led training in Tax, Law &amp; Finance for India's professionals.
            </p>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-soft">Learn</h4>
            <ul className="space-y-2 text-sm text-navy-100/80">
              <li><Link to="/courses" className="hover:text-white">All Courses</Link></li>
              <li><Link to="/case-studies" className="hover:text-white">Case Studies</Link></li>
              <li><Link to="/blog" className="hover:text-white">Blog &amp; News</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-soft">Company</h4>
            <ul className="space-y-2 text-sm text-navy-100/80">
              <li><Link to="/about" className="hover:text-white">About</Link></li>
              <li><Link to="/contact" className="hover:text-white">Contact</Link></li>
              <li><Link to="/refund-policy" className="hover:text-white">Refund Policy</Link></li>
              <li><Link to="/privacy" className="hover:text-white">Privacy Policy</Link></li>
              <li><Link to="/terms" className="hover:text-white">Terms &amp; Conditions</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gold-soft">Get in touch</h4>
            <p className="text-sm text-navy-100/80"><a href="mailto:edvax.info@gmail.com" className="hover:text-white">edvax.info@gmail.com</a></p>
            <p className="mt-1 text-sm text-navy-100/80"><a href="tel:+919826804435" className="hover:text-white">+91 98268 04435</a></p>
            <p className="mt-1 text-sm text-navy-100/80">Mon–Sat, 10am – 6pm IST</p>
          </div>
        </div>
        <div className="border-t border-white/10">
          <div className="container-edvax flex flex-col items-center justify-between gap-2 py-5 text-xs text-navy-100/60 sm:flex-row">
            <span>© {new Date().getFullYear()} EDVAX Edutech. All rights reserved.</span>
            <span>Payments secured via Razorpay (UPI · India)</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
