import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { BOOKING_STATUS_LABELS, CITIES, PROJECT_STATUS_LABELS, VERTICAL_META } from '../data/constants'
import { useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { formatDate } from '../lib/utils'

export function ProjectCreatePage() {
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const [title, setTitle] = useState('')
  const [city, setCity] = useState('Berlin')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [description, setDescription] = useState('')

  if (!user) {
    return (
      <div className="p-8 text-center">
        <Button onClick={loginDemo}>Demo Login</Button>
      </div>
    )
  }

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const p = store.createProject({
      title,
      city,
      dateFrom,
      dateTo,
      ownerId: user.id,
      description,
    })
    navigate(`/projects/${p.id}`)
  }

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <h1 className="text-2xl font-bold">Neues Event / Projekt</h1>
      <form onSubmit={submit} className="space-y-3 rounded-2xl border border-border bg-surface-2 p-5">
        <Input label="Titel" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="z.B. Messe Köln" />
        <Select label="Stadt" value={city} onChange={(e) => setCity(e.target.value)}>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-3">
          <Input label="Von" type="date" required value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          <Input label="Bis" type="date" required value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
        <Textarea label="Beschreibung" value={description} onChange={(e) => setDescription(e.target.value)} />
        <Button type="submit">Projekt anlegen</Button>
      </form>
      <p className="text-xs text-muted">
        Danach kannst du Crew, Material, Transport und Hotel über Bookings anhängen.
      </p>
    </div>
  )
}

export function ProjectDetailPage() {
  const { id } = useParams()
  useStoreVersion()
  const project = store.getProject(id!)
  const navigate = useNavigate()

  if (!project) {
    return (
      <div className="p-8 text-center">
        Projekt nicht gefunden.
        <Button className="mt-3" onClick={() => navigate('/dashboard')}>
          Dashboard
        </Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone={project.status === 'active' ? 'cyan' : 'default'}>{PROJECT_STATUS_LABELS[project.status] ?? project.status}</Badge>
          <Badge>{project.city}</Badge>
        </div>
        <h1 className="mt-3 text-2xl font-bold">{project.title}</h1>
        <p className="text-sm text-muted">
          {formatDate(project.dateFrom)} – {formatDate(project.dateTo)}
        </p>
        <p className="mt-3 text-neutral-300">{project.description}</p>
      </div>

      <div className="rounded-2xl border border-border bg-surface-2 p-5">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-semibold">Ressourcen (Crew / Material / Transport / Hotel)</h2>
          <Button size="sm" onClick={() => navigate('/')}>
            Marketplace öffnen
          </Button>
        </div>
        {project.resources.length === 0 ? (
          <p className="text-sm text-muted">
            Noch leer. Stelle eine Anfrage auf einem Inserat und wähle dieses Projekt — oder hänge ein
            bestehendes Booking an.
          </p>
        ) : (
          <div className="space-y-2">
            {project.resources.map((r) => (
              <Link
                key={r.bookingId}
                to={`/bookings/${r.bookingId}`}
                className="flex items-center justify-between rounded-xl border border-border px-3 py-3 hover:border-cyan/30"
              >
                <div>
                  <div className="text-sm font-medium">{r.label}</div>
                  <div className="text-xs text-muted">{VERTICAL_META[r.vertical]?.label}</div>
                </div>
                <Badge>{BOOKING_STATUS_LABELS[r.status]}</Badge>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
