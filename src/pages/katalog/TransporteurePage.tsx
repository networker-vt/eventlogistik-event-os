import { useMemo, useState } from 'react'
import { ExternalLink, Mail, MapPin, Phone, Truck } from 'lucide-react'
import { FavoriteButton } from '../../components/favorites/FavoriteButton'
import { Badge } from '../../components/ui/Badge'
import { Input } from '../../components/ui/Input'
import { catalogTransporters, getVehicleSize } from '../../data/catalog'

export function TransporteurePage() {
  const [q, setQ] = useState('')
  const [city, setCity] = useState('all')
  const cities = useMemo(() => {
    const s = new Set(catalogTransporters.map((t) => t.city))
    return ['all', ...Array.from(s).sort((a, b) => a.localeCompare(b, 'de'))]
  }, [])
  const list = useMemo(() => {
    const qq = q.trim().toLowerCase()
    return catalogTransporters.filter((t) => {
      if (city !== 'all' && t.city !== city) return false
      if (!qq) return true
      return [t.name, t.city, t.coverage, t.street].filter(Boolean).join(' ').toLowerCase().includes(qq)
    })
  }, [q, city])

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-[1fr_12rem]">
        <Input label="Suche" placeholder="Transporteur, Region…" value={q} onChange={(e) => setQ(e.target.value)} />
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
      <p className="text-xs text-muted">{list.length} Transporteure · Impressum / öffentliche Listings</p>
      <div className="grid gap-3 sm:grid-cols-2">
        {list.map((t) => (
          <article key={t.id} className="card-elevated space-y-2 rounded-2xl border border-border p-4">
            <div className="flex justify-between gap-2">
              <h2 className="flex items-center gap-2 text-sm font-semibold">
                <Truck size={16} className="text-teal" /> {t.name}
              </h2>
              <div className="flex items-center gap-1">
                <FavoriteButton catalog={{ kind: 'transporter', id: t.id }} />
                <Badge tone="teal">Katalog</Badge>
              </div>
            </div>
            <p className="flex gap-1.5 text-xs text-neutral-300">
              <MapPin size={14} className="mt-0.5" />
              {[t.street, [t.plz, t.city].filter(Boolean).join(' ')].filter(Boolean).join(', ') || t.city}
            </p>
            {t.coverage && <p className="text-xs text-muted">Gebiet: {t.coverage}</p>}
            {t.phone && (
              <a href={`tel:${t.phone.replace(/\s+/g, '')}`} className="flex items-center gap-1.5 text-xs text-cyan">
                <Phone size={14} /> {t.phone}
              </a>
            )}
            {t.email && (
              <a href={`mailto:${t.email}`} className="flex items-center gap-1.5 text-xs text-cyan">
                <Mail size={14} /> {t.email}
              </a>
            )}
            {t.vehicleSizeIds && t.vehicleSizeIds.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {t.vehicleSizeIds.map((id) => {
                  const vs = getVehicleSize(id)
                  return (
                    <Badge key={id} tone="default">
                      {vs?.shortLabel ?? id}
                    </Badge>
                  )
                })}
              </div>
            )}
            {t.website && (
              <a href={t.website} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-teal hover:underline">
                Website <ExternalLink size={12} />
              </a>
            )}
            <p className="text-[10px] text-muted">Quelle: {t.source}</p>
          </article>
        ))}
      </div>
    </div>
  )
}
