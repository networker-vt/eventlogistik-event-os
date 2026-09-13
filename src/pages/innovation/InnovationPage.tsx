import { useMemo, useState } from 'react'
import { ExternalLink, Link as LinkIcon } from 'lucide-react'
import { Link, NavLink } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { innovationNews, type InnovationTag, INNOVATION_COUNT } from '../../data/innovation'
import { cn } from '../../lib/utils'

const ALL_TAGS: InnovationTag[] = ['KI', 'AR', 'VR', 'XR', 'LED', 'Audio', 'Licht', 'Rigging', 'Video', 'Showcontrol']

const subnav = [
  { to: '/innovation', label: 'News', end: true },
  { to: '/wissen/medien', label: 'Branchenmedien' },
  { to: '/wissen/fortbildung', label: 'Fortbildung' },
]

export function InnovationPage() {
  const [tag, setTag] = useState<InnovationTag | 'all'>('all')
  const list = useMemo(() => {
    const sorted = [...innovationNews].sort((a, b) => b.date.localeCompare(a.date))
    if (tag === 'all') return sorted
    return sorted.filter((n) => n.tags.includes(tag))
  }, [tag])

  return (
    <div className="space-y-5 pb-scroll-chrome">
      <div className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan/20 blur-3xl" />
        <p className="text-sm font-medium text-cyan">🚀 Innovation & Wissen</p>
        <h1 className="text-2xl font-bold tracking-tight">Hersteller · KI · XR · LED</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-300">
          Redaktionell kuratierte Karten aus öffentlichen Branchenquellen ({INNOVATION_COUNT} News).
          Keine Werbung — Quellenangabe Pflicht.
        </p>
      </div>

      <nav className="flex gap-2 overflow-x-auto pb-1">
        {subnav.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            end={t.end}
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

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setTag('all')}
          className={cn(
            'rounded-full border px-2.5 py-1 text-xs',
            tag === 'all' ? 'border-cyan/50 bg-cyan/15 text-cyan' : 'border-border text-neutral-400',
          )}
        >
          Alle
        </button>
        {ALL_TAGS.map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTag(t)}
            className={cn(
              'rounded-full border px-2.5 py-1 text-xs',
              tag === t ? 'border-cyan/50 bg-cyan/15 text-cyan' : 'border-border text-neutral-400',
            )}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((n) => (
          <article key={n.id} className="card-elevated flex flex-col gap-2 rounded-2xl border border-border p-4">
            <div className="flex items-start justify-between gap-2">
              <span className="text-2xl">{n.imageEmoji ?? '📰'}</span>
              <Badge tone="amber">Editorial</Badge>
            </div>
            <h2 className="text-sm font-semibold leading-snug">{n.title}</h2>
            <p className="text-xs leading-relaxed text-neutral-300">{n.summaryDe}</p>
            <div className="flex flex-wrap gap-1.5">
              {n.tags.map((t) => (
                <Badge key={t} tone="cyan">{t}</Badge>
              ))}
            </div>
            <p className="text-[11px] text-muted">
              {n.company} · {n.date}
            </p>
            <a
              href={n.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-auto inline-flex items-center gap-1 text-xs text-cyan hover:underline"
            >
              Quelle: {n.sourceName} <ExternalLink size={12} />
            </a>
          </article>
        ))}
      </div>

      <p className="text-xs text-muted">
        Weiter: <Link to="/wissen/medien" className="text-cyan hover:underline">Branchenmedien</Link>
        {' · '}
        <Link to="/wissen/fortbildung" className="text-cyan hover:underline">Lehrgänge & Fortbildungen</Link>
        {' · '}
        <LinkIcon size={12} className="inline text-muted" />{' '}
        <Link to="/katalog/firmen" className="text-teal hover:underline">Firmenkatalog</Link>
      </p>
    </div>
  )
}
