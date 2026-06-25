import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext'

// Gate admin routes. Redirects to admin login if not an admin.
export default function RequireAdmin({ children }) {
  const { user, loading } = useAuth()
  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-muted">Loading…</div>
  }
  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin/login" replace />
  }
  return children
}
