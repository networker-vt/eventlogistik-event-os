import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { FilterBar } from '../components/listings/FilterBar'
import { ListingCard } from '../components/listings/ListingCard'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { VERTICAL_META } from '../data/constants'
import { useListings } from '../hooks/useStore'
import type { ListingFilters, Vertical } from '../types'

export function VerticalPage({ vertical }: { vertical: Vertical }) {
  const meta = VERTICAL_META[vertical]
  const [filters, setFilters] = useState<ListingFilters>({
    vertical,
    kind: 'all',
  })
  const { listings } = useListings({ ...filters, vertical })
  const navigate = useNavigate()

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm text-cyan">{meta.emoji} {meta.labelPlural}</p>
          <h1 className="text-2xl font-bold">Angebote & Gesuche</h1>
          <p className="text-sm text-muted">
            Dual Marketplace für {meta.labelPlural} — inserieren, finden, anfragen.
          </p>
        </div>
        <Button onClick={() => navigate(`/listings/new?vertical=${vertical}`)}>
          {meta.label} inserieren
        </Button>
      </div>
      <FilterBar
        value={filters}
        onChange={(f) => setFilters({ ...f, vertical })}
        showVertical={false}
      />
      {listings.length === 0 ? (
        <Empty
          title={`Keine ${meta.labelPlural} in diesem Filter`}
          hint="Filter zurücksetzen oder neues Inserat erstellen."
          actionLabel={`${meta.label} hinzufügen`}
          onAction={() => navigate(`/listings/new?vertical=${vertical}`)}
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listings.map((l) => (
            <ListingCard key={l.id} listing={l} />
          ))}
        </div>
      )}
    </div>
  )
}
