import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container-edvax py-28 text-center">
      <p className="font-serif text-6xl font-bold text-gold">404</p>
      <h1 className="mt-4 font-serif text-2xl font-bold text-ink">Page not found</h1>
      <p className="mt-2 text-ink-muted">The page you're looking for doesn't exist.</p>
      <Link to="/" className="btn-primary mt-7">Back home</Link>
    </div>
  )
}
