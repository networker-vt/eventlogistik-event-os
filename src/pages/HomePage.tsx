import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowRight, ShieldCheck, Sparkles, Zap } from 'lucide-react'
import { FilterBar } from '../components/listings/FilterBar'
import { ListingCard } from '../components/listings/ListingCard'
import { Button } from '../components/ui/Button'
import { VERTICAL_META } from '../data/constants'
import { useListings } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import type { ListingFilters } from '../types'

export function HomePage() {
  const [filters, setFilters] = useState<ListingFilters>({ kind: 'all', vertical: 'all' })
  const { listings } = useListings(filters)
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const stats = useMemo(() => store.stats(), [listings])

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-2 via-surface to-surface-3 p-6 md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">
          <Sparkles size={14} /> Category-defining Event-OS · DE
        </p>
        <h1 className="max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
          Jedes <span className="text-gradient">Gesuch</span> findet jedes{' '}
          <span className="text-gradient">Angebot</span> — Event-Logistik in einem OS.
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted md:text-base">
          Marketplace, Matching und Ops Lite für Agenturen, Technikfirmen, Freelancer, Hotels,
          Transporter, Kuriere und Materialanbieter.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button onClick={() => navigate('/listings/new')}>Inserat erstellen</Button>
          {!user ? (
            <Button variant="secondary" onClick={loginDemo}>
              Demo als Agentur starten
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Zum Dashboard
            </Button>
          )}
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: 'Angebote', value: stats.offers },
            { label: 'Gesuche', value: stats.requests },
            { label: 'Buchungen', value: stats.bookings },
            { label: 'Projekte', value: stats.projects },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-black/30 px-4 py-3">
              <div className="text-2xl font-bold text-cyan">{s.value}</div>
              <div className="text-xs text-muted">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Module</h2>
          <span className="text-xs text-muted">Dual Marketplace · Angebot + Gesuch</span>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {Object.entries(VERTICAL_META).map(([key, meta]) => (
            <Link
              key={key}
              to={meta.path}
              className="card-hover flex items-center gap-3 rounded-2xl border border-border bg-surface-2 p-4"
            >
              <span className="text-2xl">{meta.emoji}</span>
              <div>
                <div className="font-medium">{meta.labelPlural}</div>
                <div className="text-xs text-muted">Entdecken →</div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold">Unified Discovery</h2>
          <Button size="sm" variant="ghost" onClick={() => setFilters({ kind: 'all', vertical: 'all' })}>
            Filter reset
          </Button>
        </div>
        <FilterBar value={filters} onChange={setFilters} />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        {listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center text-muted">
            Keine Treffer — Filter lockern oder neues Inserat anlegen.
          </div>
        )}
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {[
          {
            icon: Zap,
            title: 'Matching Ready',
            text: 'Stadt, Gewerk, Datum und Preis — sofort filterbar über alle Vertikalen.',
          },
          {
            icon: ShieldCheck,
            title: 'Trust Layer',
            text: 'Verifizierungs-Badges, Ratings und nachvollziehbare Booking-Historie.',
          },
          {
            icon: ArrowRight,
            title: 'Ops Lite',
            text: 'Anfrage → Angebot → Buchung inkl. Messaging und Event-Projekten.',
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-surface-2 p-5">
            <f.icon className="mb-3 text-cyan" size={22} />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
