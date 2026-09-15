import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { CITIES, ROLE_LABELS } from '../data/constants'
import { useAuth } from '../lib/auth'
import type { Role } from '../types'

const ROLES = Object.keys(ROLE_LABELS).filter((r) => r !== 'admin') as Role[]

export function AuthPage() {
  const { login, register, loginDemo, user } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>('register')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<Role>('agency')
  const [city, setCity] = useState('Berlin')

  if (user) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-2 p-6 text-center">
        <p className="text-lg font-semibold">Angemeldet als {user.name}</p>
        <Button className="mt-4" onClick={() => navigate('/dashboard')}>
          Zum Dashboard
        </Button>
      </div>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (mode === 'login') {
      login(email || 'alex@demo.eventlogistik.de', name || 'Alex Müller', role)
    } else {
      register(email, name, role, city)
    }
    navigate('/dashboard')
  }

  return (
    <div className="mx-auto max-w-md space-y-5">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Willkommen bei Orbit</h1>
        <p className="mt-1 text-sm text-muted">Dein Orbit für Arbeit — Matching statt Spam.</p>
        <p className="mt-1 text-sm text-muted">
          Rollenbasierte Registrierung — Mock-Auth lokal, Supabase-ready.
        </p>
      </div>

      <div className="flex rounded-xl border border-border bg-surface-2 p-1">
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm ${mode === 'register' ? 'bg-cyan text-black font-semibold' : 'text-muted'}`}
          onClick={() => setMode('register')}
        >
          Registrieren
        </button>
        <button
          type="button"
          className={`flex-1 rounded-lg py-2 text-sm ${mode === 'login' ? 'bg-cyan text-black font-semibold' : 'text-muted'}`}
          onClick={() => setMode('login')}
        >
          Anmelden
        </button>
      </div>

      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-surface-2 p-5">
        <Input
          label="Name / Firma"
          required={mode === 'register'}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nordlicht Events GmbH"
        />
        <Input
          label="E-Mail"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="du@firma.de"
        />
        <Select label="Rolle" value={role} onChange={(e) => setRole(e.target.value as Role)}>
          {ROLES.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
        {mode === 'register' && (
          <Select label="Stadt" value={city} onChange={(e) => setCity(e.target.value)}>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        )}
        <Button type="submit" className="w-full">
          {mode === 'register' ? 'Konto erstellen' : 'Anmelden'}
        </Button>
      </form>

      <Button
        variant="secondary"
        className="w-full"
        onClick={() => {
          loginDemo()
          navigate('/dashboard')
        }}
      >
        Demo als Agentur starten
      </Button>
      <Button
        variant="ghost"
        className="w-full"
        onClick={() => {
          loginDemo('user-b2b-1')
          navigate('/firma')
        }}
      >
        Demo als Firma starten
      </Button>
      <p className="text-center text-xs text-muted">
        Ohne Supabase-Keys läuft Auth lokal (localStorage). Siehe README & `.env.example`.
      </p>
    </div>
  )
}
