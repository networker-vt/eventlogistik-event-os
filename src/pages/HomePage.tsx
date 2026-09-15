import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  ArrowRight,
  Heart,
  SlidersHorizontal,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react'
import { ListingCard } from '../components/listings/ListingCard'
import { Button } from '../components/ui/Button'
import { useListings } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { getPrefs } from '../lib/prefs'
import { filterListingsByPrefs } from '../lib/prefs'
import { ORBIT_TAGLINE_DE } from '../data/industries'

export function HomePage() {
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const prefs = getPrefs()
  const { listings: raw } = useListings({ vertical: 'job', kind: 'offer' })
  const filtered = useMemo(() => filterListingsByPrefs(raw, prefs).slice(0, 6), [raw, prefs])
  const stats = useMemo(() => store.stats(), [raw])

  return (
    <div className="space-y-8 pb-scroll-chrome">
      <section className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5 md:p-10 motion-fade-up">
        <div className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-cyan/25 blur-3xl motion-orb" />
        <div className="pointer-events-none absolute -bottom-16 left-6 h-44 w-44 rounded-full bg-teal/15 blur-3xl motion-orb-delay" />

        <p className="mb-3 inline-flex items-center gap-2 rounded-full border border-cyan/35 bg-cyan/10 px-3 py-1 text-xs font-medium text-cyan glow-cyan-soft">
          <Sparkles size={14} /> Orbit · Job Matching OS
        </p>
        <h1 className="max-w-2xl text-[1.75rem] font-bold leading-[1.15] tracking-tight md:text-4xl">
          {ORBIT_TAGLINE_DE.split('—')[0].trim()} —{' '}
          <span className="text-shimmer">Matching statt Spam</span>
        </h1>
        <p className="mt-3 max-w-xl text-sm leading-relaxed text-neutral-300 md:text-base">
          Global, branchenübergreifend: IT, Pflege, Retail, Logistik, Gastronomie, Admin, Minijobs —
          und Event/VT als ein Sektor unter vielen. Prefs zuerst, dann swipen.
        </p>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => navigate(prefs.completed ? '/match' : '/prefs')}
            className="group relative overflow-hidden rounded-2xl border border-cyan/45 bg-cyan/10 p-4 text-left transition hover:border-cyan hover:bg-cyan/15"
          >
            <div className="mb-2 flex items-center gap-2 text-cyan">
              <Heart size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">Match</span>
            </div>
            <div className="text-lg font-bold text-white">Match Finder öffnen</div>
            <p className="mt-1 text-sm text-neutral-300">
              Tinder-Style Karten mit erklärbarem Match-Rating %.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-cyan">
              Los swipen <ArrowRight size={14} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/prefs')}
            className="group relative overflow-hidden rounded-2xl border border-teal/45 bg-teal/10 p-4 text-left transition hover:border-teal hover:bg-teal/15"
          >
            <div className="mb-2 flex items-center gap-2 text-teal">
              <SlidersHorizontal size={20} />
              <span className="text-xs font-semibold uppercase tracking-wider">Prefs</span>
            </div>
            <div className="text-lg font-bold text-white">
              {prefs.completed ? 'Prefs anpassen' : 'Prefs einrichten'}
            </div>
            <p className="mt-1 text-sm text-neutral-300">
              Länder, Sprachen, Branchen, Typ, Remote, Gehalt, Skills — Hard-Filter vor dem Feed.
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-teal">
              Wizard starten <ArrowRight size={14} />
            </span>
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {!user ? (
            <Button
              onClick={() => {
                loginDemo()
                navigate('/match')
              }}
            >
              Demo starten
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/dashboard')}>
              Dashboard
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/quellen')}>
            Quellen
          </Button>
          <Button variant="ghost" onClick={() => navigate('/listings/new?vertical=job')}>
            Job posten
          </Button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: 'Jobs live', value: stats.offers },
            { label: 'Gesuche', value: stats.requests },
            { label: 'Buchungen', value: stats.bookings },
            { label: 'Prefs', value: prefs.completed ? '✓' : '—' },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl border border-border/80 bg-black/35 px-3 py-3 backdrop-blur-sm"
            >
              <div className="text-xl font-bold tabular-nums text-cyan md:text-2xl">{s.value}</div>
              <div className="text-[11px] text-muted md:text-xs">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-semibold">Ruhige Entdeckung</h2>
          <Link to="/match" className="text-sm font-medium text-cyan hover:underline">
            Zum Match →
          </Link>
        </div>
        <p className="text-xs text-muted">
          {prefs.completed
            ? 'Bereits nach deinen Prefs gefiltert.'
            : 'Ohne Prefs: unfilterter Preview — richte Prefs ein für Hard-Filter.'}
        </p>
        <div className="stagger-in grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((l) => (
            <ListingCard key={l.id} listing={l} highlightRate />
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="rounded-2xl border border-border bg-surface-2 p-6 text-center text-sm text-muted">
            Keine Treffer für aktuelle Prefs.{' '}
            <button type="button" className="text-cyan" onClick={() => navigate('/prefs')}>
              Prefs lockern
            </button>
          </p>
        )}
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {[
          {
            icon: Zap,
            title: 'Preference-first',
            text: 'Hard-Filter vor jeder Karte — Land, Sprache, Branche, Typ, Gehalt, Skills.',
          },
          {
            icon: Heart,
            title: 'Explainable Match %',
            text: 'Skills / Land / Sprache / Gehalt / Typ — transparent, kein Black-Box-Spam.',
          },
          {
            icon: ShieldCheck,
            title: 'Ehrliche Quellen',
            text: 'Keine inoffiziellen Scrapes. Aggregatoren nur als API/Partner-Stubs.',
          },
        ].map((f) => (
          <div key={f.title} className="card-elevated rounded-2xl border border-border p-5">
            <f.icon className="mb-3 text-cyan" size={22} />
            <h3 className="font-semibold">{f.title}</h3>
            <p className="mt-1 text-sm text-muted">{f.text}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
