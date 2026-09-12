import { Link, useNavigate } from 'react-router-dom'
import { Calendar, FolderKanban, MessageSquare, Plus } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { BOOKING_STATUS_LABELS, VERTICAL_META } from '../data/constants'
import { useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { formatDate } from '../lib/utils'

export function DashboardPage() {
  const { user, loginDemo } = useAuth()
  useStoreVersion()
  const navigate = useNavigate()

  if (!user) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-border bg-surface-2 p-8 text-center">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="mt-2 text-sm text-muted">Melde dich an, um Bookings, Chats und Projekte zu sehen.</p>
        <div className="mt-5 flex justify-center gap-2">
          <Button onClick={loginDemo}>Demo starten</Button>
          <Button variant="secondary" onClick={() => navigate('/auth')}>
            Anmelden
          </Button>
        </div>
      </div>
    )
  }

  const bookings = store.listBookingsForUser(user.id)
  const projects = store.listProjects(user.id)
  const threads = store.listThreads(user.id)

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Dashboard</h1>
          <p className="text-sm text-muted">Hallo {user.name.split(' ')[0]} — Ops Lite Übersicht</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={() => navigate('/projects/new')}>
            <Plus size={16} /> Projekt
          </Button>
          <Button size="sm" variant="secondary" onClick={() => navigate('/listings/new')}>
            Inserat
          </Button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { label: 'Aktive Bookings', value: bookings.filter((b) => !['cancelled', 'completed'].includes(b.status)).length, icon: Calendar },
          { label: 'Projekte', value: projects.length, icon: FolderKanban },
          { label: 'Chats', value: threads.length, icon: MessageSquare },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-border bg-surface-2 p-4">
            <s.icon className="mb-2 text-cyan" size={18} />
            <div className="text-2xl font-bold">{s.value}</div>
            <div className="text-xs text-muted">{s.label}</div>
          </div>
        ))}
      </div>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Events / Projekte</h2>
          <Link to="/projects/new" className="text-sm text-cyan">
            Neu anlegen
          </Link>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {projects.map((p) => (
            <Link
              key={p.id}
              to={`/projects/${p.id}`}
              className="card-hover rounded-2xl border border-border bg-surface-2 p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium">{p.title}</h3>
                <Badge tone={p.status === 'active' ? 'cyan' : 'default'}>{p.status}</Badge>
              </div>
              <p className="mt-1 text-sm text-muted">
                {p.city} · {formatDate(p.dateFrom)} – {formatDate(p.dateTo)}
              </p>
              <p className="mt-2 text-xs text-neutral-400">
                {p.resources.length} Ressourcen angehängt
              </p>
            </Link>
          ))}
          {projects.length === 0 && (
            <p className="text-sm text-muted">Noch keine Projekte — lege dein erstes Event an.</p>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="font-semibold">Buchungs-Pipeline</h2>
        <div className="space-y-2">
          {bookings.map((b) => (
            <Link
              key={b.id}
              to={`/bookings/${b.id}`}
              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 hover:border-cyan/30"
            >
              <div>
                <div className="font-medium">{b.listingTitle}</div>
                <div className="text-xs text-muted">
                  {VERTICAL_META[b.vertical]?.label} · {b.providerName} ↔ {b.requesterName}
                </div>
              </div>
              <Badge
                tone={
                  b.status === 'booked' || b.status === 'accepted'
                    ? 'green'
                    : b.status === 'offer'
                      ? 'cyan'
                      : b.status === 'cancelled'
                        ? 'rose'
                        : 'amber'
                }
              >
                {BOOKING_STATUS_LABELS[b.status]}
              </Badge>
            </Link>
          ))}
          {bookings.length === 0 && (
            <p className="text-sm text-muted">Keine Bookings — stelle eine Anfrage über ein Inserat.</p>
          )}
        </div>
      </section>
    </div>
  )
}
