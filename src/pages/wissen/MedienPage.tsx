import { ExternalLink } from 'lucide-react'
import { NavLink } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { branchenMedien, MEDIEN_COUNT } from '../../data/wissen'
import { cn } from '../../lib/utils'

const subnav = [
  { to: '/innovation', label: 'News' },
  { to: '/wissen/medien', label: 'Branchenmedien', end: true },
  { to: '/wissen/fortbildung', label: 'Fortbildung' },
]

export function MedienPage() {
  return (
    <div className="space-y-5 pb-scroll-chrome">
      <div className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5">
        <p className="text-sm font-medium text-cyan">📰 Branchenmedien</p>
        <h1 className="text-2xl font-bold tracking-tight">Fachpresse & Portale</h1>
        <p className="mt-1 text-sm text-neutral-300">
          {MEDIEN_COUNT} kuratierte Outbound-Links — keine Inhaltsübernahme, nur Discovery.
        </p>
      </div>
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {subnav.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={'end' in t ? t.end : false}
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
        {branchenMedien.map((m) => (
          <a
            key={m.id}
            href={m.url}
            target="_blank"
            rel="noopener noreferrer"
            className="card-elevated block space-y-2 rounded-2xl border border-border p-4 hover:border-cyan/40"
          >
            <div className="flex justify-between gap-2">
              <h2 className="text-sm font-semibold">{m.name}</h2>
              <ExternalLink size={14} className="text-cyan" />
            </div>
            <p className="text-xs text-teal">{m.focus}</p>
            <p className="text-xs leading-relaxed text-neutral-300">{m.blurbDe}</p>
            <div className="flex flex-wrap gap-1.5">
              {m.tags.map((t) => (
                <Badge key={t}>{t}</Badge>
              ))}
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}
