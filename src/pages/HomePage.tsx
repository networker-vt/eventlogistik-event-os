import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Briefcase,
  Building2,
  Search,
  ShieldCheck,
  Sparkles,
  Users,
  Zap,
} from 'lucide-react'
import { FilterBar } from '../components/listings/FilterBar'
import { ListingCard } from '../components/listings/ListingCard'
import { Button } from '../components/ui/Button'
import { VERTICAL_META } from '../data/constants'
import { useListings } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import type { ListingFilters, Role } from '../types'

function isSeekerRole(role?: Role) {
  return role === 'freelancer' || role === 'courier' || role === 'transporter'
}

export function HomePage() {
  const { user, loginDemo, profile } = useAuth()
  const navigate = useNavigate()
  const seekerBias = user ? isSeekerRole(user.role) : null

  const [filters, setFilters] = useState<ListingFilters>({
    kind: 'all',
    vertical: seekerBias ? 'job' : 'all',
  })
  const { listings } = useListings(filters)
  const stats = useMemo(() => store.stats(), [listings])
  const featuredJobs = useMemo(
    () => store.listListings({ vertical: 'job', kind: 'offer' }).slice(0, 3),
    [listings],
  )

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-3xl border border-border bg-gradient-to-br from-surface-2 via-surface to-surface-3 p-5 md:p-10">
        <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-cyan/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-16 left-10 h-40 w-40 rounded-full bg-teal/10 blur-3xl" />
        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/30 bg-cyan/10 px-3 py-1 text-xs text-cyan">
          <Sparkles size={14} /> EventLogistik · Das Event-OS für DE
        </p>
        <h1 className="max-w-2xl text-[1.65rem] font-bold leading-tight tracking-tight md:text-4xl">
          {seekerBias === true ? (
            <>
              Deine nächsten <span className="text-gradient">Gigs</span> — Rate klar, in Minuten beworben.
            </>
          ) : seekerBias === false ? (
            <>
              Finde <span className="text-gradient">Crew & Jobs</span> schneller als per WhatsApp-Liste.
            </>
          ) : (
            <>
              Jedes <span className="text-gradient">Gesuch</span> findet jedes{' '}
              <span className="text-gradient">Angebot</span>.
            </>
          )}
        </h1>
        <p className="mt-3 max-w-xl text-sm text-muted md:text-base">
          Marketplace, Jobs & Matching für Agenturen, Technikfirmen, Freelancer, Hotels, Transport und
          Material — mit transparenten Tagessätzen und verifizierten Profilen.
        </p>

        {/* Hero fork — Jobs finden vs Jobs/Crew finden */}
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate('/jobs?side=seek')}
            className="group rounded-2xl border border-cyan/40 bg-cyan/10 p-4 text-left transition hover:border-cyan hover:bg-cyan/15"
          >
            <div className="mb-2 flex items-center gap-2 text-cyan">
              <Search size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">Jobsuche</span>
            </div>
            <div className="text-lg font-bold text-white">Ich suche Jobs / Gigs</div>
            <p className="mt-1 text-sm text-neutral-300">
              Tagessatz sofort sichtbar · Gewerk, Stadt, Datum · 1-Tap bewerben
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-cyan">
              Jobs öffnen <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/jobs?side=hire')}
            className="group rounded-2xl border border-teal/40 bg-teal/10 p-4 text-left transition hover:border-teal hover:bg-teal/15"
          >
            <div className="mb-2 flex items-center gap-2 text-teal">
              <Users size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">Besetzung</span>
            </div>
            <div className="text-lg font-bold text-white">Ich biete Jobs / suche Crew</div>
            <p className="mt-1 text-sm text-neutral-300">
              Structured Post &lt; 2 Min · Bewerber-Pipeline · In-App Chat
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-teal">
              Crew finden <ArrowRight size={14} className="transition group-hover:translate-x-0.5" />
            </span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {!user ? (
            <Button
              onClick={() => {
                loginDemo()
                navigate('/dashboard')
              }}
            >
              Demo als Agentur starten
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Zum Dashboard
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/listings/new')}>
            Inserat erstellen
          </Button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Angebote', value: stats.offers },
            { label: 'Gesuche', value: stats.requests },
            { label: 'Buchungen', value: stats.bookings },
            { label: 'Projekte', value: stats.projects },
          ].map((s) => (
            <div key={s.label} className="rounded-2xl border border-border bg-black/30 px-3 py-3">
              <div className="text-xl font-bold text-cyan md:text-2xl">{s.value}</div>
              <div className="text-[11px] text-muted md:text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {featuredJobs.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Briefcase size={18} className="text-cyan" /> Top Jobs mit klarer Rate
            </h2>
            <Link to="/jobs?side=seek" className="text-sm text-cyan">
              Alle Jobs →
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {featuredJobs.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        </section>
      )}

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Module</h2>
          <span className="text-xs text-muted">Angebot + Gesuch</span>
        </div>
        <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 scrollbar-none sm:grid sm:grid-cols-3 sm:overflow-visible lg:grid-cols-4">
          {Object.entries(VERTICAL_META).map(([key, meta]) => (
            <Link
              key={key}
              to={meta.path}
              className="card-hover flex min-w-[9.5rem] shrink-0 items-center gap-3 rounded-2xl border border-border bg-surface-2 p-4 sm:min-w-0"
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
          <h2 className="text-lg font-semibold">Entdecken</h2>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setFilters({ kind: 'all', vertical: 'all' })}
          >
            Filter zurücksetzen
          </Button>
        </div>
        <div className="sticky-filters -mx-4 bg-surface/95 px-4 py-2 backdrop-blur md:mx-0 md:bg-transparent md:px-0 md:py-0">
          <FilterBar value={filters} onChange={setFilters} sticky />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
        {listings.length === 0 && (
          <div className="rounded-2xl border border-dashed border-border p-8 text-center">
            <p className="text-muted">Keine Treffer — Filter lockern oder neues Inserat anlegen.</p>
            <Button className="mt-4" onClick={() => navigate('/listings/new')}>
              Inserat erstellen
            </Button>
          </div>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          {
            icon: Zap,
            title: 'Matching statt Chaos',
            text: 'Stadt, Gewerk, Datum und Tagessatz — sofort filterbar. Klar, warum ein Match gezeigt wird.',
          },
          {
            icon: ShieldCheck,
            title: 'Trust Layer',
            text: 'Verifizierungs-Badges, Ratings und nachvollziehbare Booking-Historie — keine Bait-Rates.',
          },
          {
            icon: Building2,
            title: 'Ops Lite',
            text: 'Anfrage → Angebot → Buchung inkl. Messaging und Event-Projekten in einem Flow.',
          },
        ].map((f) => (
          <div key={f.title} className="rounded-2xl border border-border bg-surface-2 p-5">
            <f.icon className="mb-3 text-cyan" size={22} />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </section>

      {profile && (
        <p className="text-center text-xs text-muted">
          Angemeldet als {profile.name} ({profile.role === 'agency' ? 'Agentur' : profile.role}) — Home
          ist rollenbewusst ausgerichtet.
        </p>
      )}
    </div>
  )
}
