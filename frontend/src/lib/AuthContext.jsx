import { createContext, useContext, useEffect, useState } from 'react'
import { auth } from './api'

const AuthCtx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auth
      .me()
      .then((d) => setUser(d.user))
      .catch(() => setUser(null))
      .finally(() => setLoading(false))
  }, [])

  const value = {
    user,
    loading,
    async login(email, password) {
      const d = await auth.login(email, password)
      setUser(d.user)
      return d.user
    },
    async register(name, email, password) {
      const d = await auth.register(name, email, password)
      setUser(d.user)
      return d.user
    },
    async logout() {
      await auth.logout()
      setUser(null)
    },
  }
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>
}

export const useAuth = () => useContext(AuthCtx)
