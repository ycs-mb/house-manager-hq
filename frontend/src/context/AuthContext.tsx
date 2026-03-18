import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { UserMe } from '@/api/auth'
import { getMe } from '@/api/auth'

interface AuthContextValue {
  token: string | null
  user: UserMe | null
  setToken: (token: string) => void
  logout: () => void
  isLoading: boolean
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(
    () => localStorage.getItem('access_token')
  )
  const [user, setUser] = useState<UserMe | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setUser(null)
      setIsLoading(false)
      return
    }
    getMe(token)
      .then(setUser)
      .catch(() => {
        localStorage.removeItem('access_token')
        setTokenState(null)
        setUser(null)
      })
      .finally(() => setIsLoading(false))
  }, [token])

  const setToken = (t: string) => {
    localStorage.setItem('access_token', t)
    setTokenState(t)
  }

  const logout = () => {
    localStorage.removeItem('access_token')
    setTokenState(null)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ token, user, setToken, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
