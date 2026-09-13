import { useMemo, useState } from 'react'
import { ExternalLink, MapPin } from 'lucide-react'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { catalogVenues } from '../../data/catalog'

export function LocationsPage() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('all')
  const cities = useMemo(() => {
    const s = new Set(catalogVenues.map((v) => v.city))
    return ['all', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'de'))]
  }, [])
  const list = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return catalogVenues.filter((v) => {
      if (city !== 'all' && v.city !== city) return false
      if (!qq) return true
      return [v.name, v.city, v.street, v.type].join(' ').toLowerCase().includes(qq)
    })
  }, [q, city])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <Input label="Suche" placeholder="Location, Stadt…" value={q} onChange={(e) => setQ(e.target.value)} />
        <label className="block space-y-1.5">
          <span className="text-sm text-muted">Stadt</span>
          <select
            className="w-full min-h-11 rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-sm"
            value={city}
            onChange={(e) => setCity(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>{c === 'all' ? 'Alle Städte' : c}</option>
            ))}
          </select>
        </label>
      </div>
      <p className="text-xs text-muted">{list.length} Locations · öffentlich bekannte Adressen</p>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((v) => (
          <article key={v.id} className="card-elevated rounded-2xl border border-border p-4 space-y-2">
            <div className="flex justify-between gap-2">
              <h2 className="text-sm font-semibold">{v.name}</h2>
              <Badge tone="cyan">{v.type}</Badge>
            </div>
            <p className="flex gap-1.5 text-xs text-neutral-300">
              <MapPin size={14} className="mt-0.5 text-cyan" />
              {[v.street, [v.plz, v.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')}
            </p>
            {v.website && (
              <a href={v.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal hover:underline">
                Website <ExternalLink size={12} />
              </a>
            )}
            <p className="text-[10px] text-muted">Quelle: {v.source}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
