import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Select, Textarea } from '../components/ui/Input'
import { CITIES, CRAFTS, ROLE_LABELS } from '../data/constants'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { resetStore } from '../lib/store'
import { verificationLabel } from '../lib/utils'
import type { Role } from '../types'

export function ProfilePage() {
  const { profile, user, updateProfile, logout, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [bio, setBio] = useState(profile?.bio ?? '')
  const [city, setCity] = useState(profile?.city ?? 'Berlin')
  const [craft, setCraft] = useState<string>(profile?.crafts[0] ?? CRAFTS[0])
  const [saved, setSaved] = useState(false)

  if (!user || !profile) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-border bg-surface-2 p-8 text-center">
        <h1 className="text-xl font-bold">Profil</h1>
        <p className="mt-2 text-sm text-muted">Melde dich an, um dein Profil zu verwalten.</p>
        <div className="mt-4 flex justify-center gap-2">
          <Button onClick={loginDemo}>Demo</Button>
          <Button variant="secondary" onClick={() => navigate('/auth')}>
            Auth
          </Button>
        </div>
      </div>
    )
  }

  const save = (e: React.FormEvent) => {
    e.preventDefault()
    const next = {
      ...profile,
      bio,
      city,
      crafts: [craft],
    }
    updateProfile(next)
    store.upsertProfile(next)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{profile.name}</h1>
            <p className="text-sm text-muted">{profile.email}</p>
          </div>
          <Badge tone="cyan">{ROLE_LABELS[profile.role]}</Badge>
        </div>
        <div className="mt-3 flex flex-wrap gap-2">
          <Badge tone="teal">{verificationLabel(profile.verified)}</Badge>
          <Badge>
            ⭐ {profile.rating.toFixed(1)} · {profile.reviewCount} Reviews
          </Badge>
        </div>
      </div>

      <form onSubmit={save} className="space-y-3 rounded-2xl border border-border bg-surface-2 p-5">
        <h2 className="font-semibold">Profil bearbeiten</h2>
        <Textarea label="Bio" value={bio} onChange={(e) => setBio(e.target.value)} />
        <Select label="Stadt" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select label="Haupt-Gewerk" value={craft} onChange={(e) => setCraft(e.target.value)}>
          {CRAFTS.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <Select
          label="Rolle"
          value={profile.role}
          onChange={(e) => updateProfile({ role: e.target.value as Role })}
        >
          {Object.entries(ROLE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </Select>
        <Button type="submit">Profil speichern</Button>
        {saved && <span className="ml-2 text-sm text-teal">Gespeichert ✓</span>}
      </form>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            logout()
            navigate('/auth')
          }}
        >
          Abmelden
        </Button>
        <Button
          variant="ghost"
          onClick={() => {
            resetStore()
            alert('Seed-Daten zurückgesetzt.')
          }}
        >
          Demo-Daten reset
        </Button>
      </div>
    </div>
  )
}

export function PublicProfilePage() {
  const { id } = useParams()
  const profile = store.getProfile(id!)
  const navigate = useNavigate()

  if (!profile) {
    return (
      <div className="p-8 text-center">
        Profil nicht gefunden.
        <Button className="mt-3" onClick={() => navigate('/')}>
          Home
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-border bg-surface-2 p-6">
      <Badge tone="cyan">{ROLE_LABELS[profile.role]}</Badge>
      <h1 className="mt-3 text-2xl font-bold">{profile.name}</h1>
      <p className="text-sm text-muted">
        {profile.city} · {verificationLabel(profile.verified)}
      </p>
      <p className="mt-4 text-neutral-300">{profile.bio}</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {profile.crafts.map((c) => (
          <Badge key={c}>{c}</Badge>
        ))}
      </div>
      <p className="mt-4 text-amber-300">
        ⭐ {profile.rating.toFixed(1)} ({profile.reviewCount} Bewertungen)
      </p>
    </div>
  )
}
