import { ExternalLink } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { fortbildungen, FORTBILDUNG_COUNT } from '../../data/wissen'
import { cn } from '../../lib/utils'

const subnav = [
  { to: '/innovation', label: 'News' },
  { to: '/wissen/medien', label: 'Branchenmedien' },
  { to: '/wissen/fortbildung', label: 'Fortbildung', end: true },
]

const formatLabel = { online: 'Online', hybrid: 'Hybrid', praesenz: 'Präsenz' } as const

export function FortbildungPage() {
  return (
    <div className="space-y-5 pb-scroll-chrome">
      <div className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5">
        <p className="text-sm font-medium text-cyan">🎓 Lehrgänge & Fortbildungen</p>
        <h1 className="text-2xl font-bold tracking-tight">Meister · SQQ · AEVO</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-300">
          {FORTBILDUNG_COUNT} öffentliche Kurs-Hinweise mit Outbound-Links. Orbit vermittelt nicht und
          nimmt keine Anmeldungen entgegen — Termine immer beim Anbieter prüfen.
        </p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {subnav.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={'end' in t ? Boolean(t.end) : false}
            className={({ isActive }) =>
              cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium',
                isActive ? 'border-cyan/50 bg-cyan/15 text-cyan' : 'border-border text-neutral-300',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <div className="grid gap-3 sm:grid-cols-2">
        {fortbildungen.map((c) => (
          <article key={c.id} className="card-elevated space-y-2 rounded-2xl border border-border p-4">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-sm font-semibold leading-snug">{c.title}</h2>
              <Badge tone="amber">{formatLabel[c.format]}</Badge>
            </div>
            <p className="text-xs text-teal">{c.provider}</p>
            {c.datesHint && <p className="text-xs text-neutral-400">📅 {c.datesHint}</p>}
            <p className="text-xs leading-relaxed text-neutral-300">{c.blurbDe}</p>
            <div className="flex flex-wrap gap-1.5">
              {c.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
            <a
              href={c.url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 text-xs text-cyan hover:underline"
            >
              Zur Anbieterseite <ExternalLink size={12} />
            </a>
            <p className="text-[10px] text-muted">Quelle: {c.source} · Angaben ohne Gewähr</p>
          </article>
        ))}
      </div>
    </div>
  )
}
