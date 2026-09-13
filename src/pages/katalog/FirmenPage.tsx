import { useMemo, useState } from 'react'
import { ExternalLink, Mail, MapPin, Phone } from 'lucide-react'
import { FavoriteButton } from '../../components/favorites/FavoriteButton'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { catalogCompanies } from '../../data/catalog'

export function FirmenPage() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('all')

  const cities = useMemo(() => {
    const s = new Set(catalogCompanies.map((c) => c.city).filter(Boolean))
    return ['all', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'de'))]
  }, [])

  const list = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return catalogCompanies.filter((c) => {
      if (city !== 'all' && c.city !== city) return false
      if (!qq) return true
      const hay = [c.name, c.city, c.street, c.plz, c.email, c.phone].filter(Boolean).join(' ').toLowerCase()
      return hay.includes(qq)
    })
  }, [q, city])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <Input
          label="Suche"
          placeholder="Firma, Stadt, PLZ…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Stadt</span>
          <select
            className="w-full min-h-11 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm text-white outline-none focus:border-cyan/50"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'Alle Städte' : c}
              </option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-muted">{list.length} Einträge · Quelle dry-hire.com / Impressum</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((c) => (
          <article
            key={c.id}
            className="card-elevated flex flex-col gap-2 rounded-2xl border border-border p-4"
          >
            <div className="flex flex-wrap items-start justify-between gap-2">
              <h2 className="text-sm font-semibold leading-snug text-white">{c.name}</h2>
              <div className="flex items-center gap-1">
                <FavoriteButton catalog={{ kind: 'company', id: c.id }} />
                <Badge tone="teal">Katalog</Badge>
              </div>
            </div>
            <p className="flex items-start gap-1.5 text-xs text-neutral-300">
              <MapPin size={14} className="mt-0.5 shrink-0 text-teal" />
              {[c.street, [c.plz, c.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
            </p>
            {c.phone && (
              <a href={`tel:${c.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 text-xs text-cyan hover:underline">
                <Phone size={14} /> {c.phone}
              </a>
            )}
            {c.email && (
              <a href={`mailto:${c.email}`} className="flex items-center gap-1.5 text-xs text-cyan hover:underline">
                <Mail size={14} /> {c.email}
              </a>
            )}
            <div className="mt-auto flex flex-wrap gap-2 pt-1 text-[11px]">
              {c.website && (
                <a href={c.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-teal hover:underline">
                  Website <ExternalLink size={12} />
                </a>
              )}
              {c.dryHireUrl && (
                <a href={c.dryHireUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-neutral-400 hover:text-cyan">
                  dry-hire <ExternalLink size={12} />
                </a>
              )}
            </div>
            <p className="text-[10px] text-muted">Quelle: {c.source} · {c.dataClass}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
