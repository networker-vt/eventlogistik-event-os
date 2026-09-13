import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { DEMO_USER_ID, seedProfiles } from '../data/seed'
import { store } from './store'
import type { AuthUser, Profile, Role } from '../types'
import { uid } from './utils'

const AUTH_KEY = 'el_auth_user'

interface AuthContextValue {
  user: AuthUser | null
  profile: Profile | null
  loading: boolean
  loginDemo: () => void
  login: (email: string, name: string, role: Role) => void
  register: (email: string, name: string, role: Role, city: string) => Profile
  logout: () => void
  updateProfile: (patch: Partial<Profile>) => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

function loadStored(): AuthUser | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY)
    return raw ? (JSON.parse(raw) as AuthUser) : null
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = loadStored()
    if (stored) {
      setUser(stored)
      const p =
        store.getProfile(stored.id) ??
        seedProfiles.find((x) => x.id === stored.id) ??
        ({
          id: stored.id,
          name: stored.name,
          email: stored.email,
          role: stored.role,
          city: 'Berlin',
          bio: '',
          crafts: [],
          verified: 'email',
          rating: 5,
          reviewCount: 0,
          createdAt: new Date().toISOString(),
        } satisfies Profile)
      setProfile(p)
    }
    setLoading(false)
  }, [])

  const persist = useCallback((u: AuthUser | null, p: Profile | null) => {
    setUser(u)
    setProfile(p)
    if (u) localStorage.setItem(AUTH_KEY, JSON.stringify(u))
    else localStorage.removeItem(AUTH_KEY)
  }, [])

  const loginDemo = useCallback(() => {
    const p = seedProfiles.find((x) => x.id === DEMO_USER_ID)!
    persist(
      { id: p.id, email: p.email, name: p.name, role: p.role },
      p,
    )
  }, [persist])

  const login = useCallback(
    (email: string, name: string, role: Role) => {
      const existing = seedProfiles.find((x) => x.email === email)
      if (existing) {
        persist(
          {
            id: existing.id,
            email: existing.email,
            name: existing.name,
            role: existing.role,
          },
          existing,
        )
        return
      }
      const id = uid('user')
      const p: Profile = {
        id,
        name,
        email,
        role,
        city: 'Berlin',
        bio: '',
        crafts: [],
        verified: 'email',
        rating: 5,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      }
      persist({ id, email, name, role }, p)
    },
    [persist],
  )

  const register = useCallback(
    (email: string, name: string, role: Role, city: string) => {
      const id = uid('user')
      const p: Profile = {
        id,
        name,
        email,
        role,
        city,
        bio: '',
        crafts: [],
        verified: 'email',
        rating: 5,
        reviewCount: 0,
        createdAt: new Date().toISOString(),
      }
      store.upsertProfile(p)
      persist({ id, email, name, role }, p)
      return p
    },
    [persist],
  )

  const logout = useCallback(() => persist(null, null), [persist])

  const updateProfile = useCallback(
    (patch: Partial<Profile>) => {
      if (!profile || !user) return
      const next = { ...profile, ...patch }
      setProfile(next)
      persist(
        { ...user, name: next.name, email: next.email, role: next.role },
        next,
      )
    },
    [persist, profile, user],
  )

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      loginDemo,
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, profile, loading, loginDemo, login, register, logout, updateProfile],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
