import { CITIES, CRAFTS } from '../../data/constants'
import type { ListingFilters, ListingKind, Vertical } from '../../types'
import { Input, Select } from '../ui/Input'

export function FilterBar({
  value,
  onChange,
  showVertical = true,
}: {
  value: ListingFilters
  onChange: (next: ListingFilters) => void
  showVertical?: boolean
}) {
  return (
    <div className="grid gap-3 rounded-2xl border border-border bg-surface-2 p-3 sm:grid-cols-2 lg:grid-cols-6">
      <div className="lg:col-span-2">
        <Input
          placeholder="Suche Titel, Tag, Anbieter…"
          value={value.q ?? ''}
          onChange={(e) => onChange({ ...value, q: e.target.value })}
        />
      </div>
      <Select
        value={value.city ?? ''}
        onChange={(e) => onChange({ ...value, city: e.target.value || undefined })}
      >
        <option value="">Alle Städte</option>
        {CITIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select
        value={value.craft ?? ''}
        onChange={(e) => onChange({ ...value, craft: e.target.value || undefined })}
      >
        <option value="">Alle Gewerke</option>
        {CRAFTS.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </Select>
      <Select
        value={value.kind ?? 'all'}
        onChange={(e) =>
          onChange({ ...value, kind: e.target.value as ListingKind | 'all' })
        }
      >
        <option value="all">Angebot + Gesuch</option>
        <option value="offer">Nur Angebote</option>
        <option value="request">Nur Gesuche</option>
      </Select>
      {showVertical ? (
        <Select
          value={value.vertical ?? 'all'}
          onChange={(e) =>
            onChange({ ...value, vertical: e.target.value as Vertical | 'all' })
          }
        >
          <option value="all">Alle Vertikalen</option>
          <option value="freelancer">Freelancer</option>
          <option value="company">Firmen</option>
          <option value="material">Material</option>
          <option value="transporter">Transporter</option>
          <option value="courier">Kuriere</option>
          <option value="hotel">Hotels</option>
          <option value="job">Jobs</option>
        </Select>
      ) : (
        <Input
          type="date"
          value={value.dateFrom ?? ''}
          onChange={(e) => onChange({ ...value, dateFrom: e.target.value || undefined })}
        />
      )}
    </div>
  )
}
