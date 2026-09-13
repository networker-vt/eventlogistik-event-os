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
    <div className="space-y-5 pb-scroll-chrome">
      <div className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan/15 blur-3xl motion-orb" />
        <div className="relative flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-cyan">{meta.emoji} {meta.labelPlural}</p>
          <h1 className="text-2xl font-bold tracking-tight">Angebote & Gesuche</h1>
          <p className="mt-1 text-sm text-neutral-300">
            Dual Marketplace für {meta.labelPlural} — inserieren, finden, anfragen.
          </p>
        </div>
        <Button onClick={() => navigate(`/listings/new?vertical=${vertical}`)}>
          {meta.label} inserieren
        </Button>
        </div>
      </div>
      <div className="sticky-filters -mx-4 bg-surface/95 px-4 py-2 backdrop-blur md:mx-0 md:bg-transparent md:px-0 md:py-0">
        <FilterBar
          value={filters}
          onChange={(f) => setFilters({ ...f, vertical })}
          showVertical={false}
          sticky
        />
      </div>
      {listings.length === 0 ? (
        <Empty
          emoji={meta.emoji}
          title={`Starte den Markt für ${meta.labelPlural}`}
          hint="Noch keine Treffer — Filter lockern oder als Erste:r ein Inserat live schalten."
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
