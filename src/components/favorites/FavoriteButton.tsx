import { Heart } from 'lucide-react'
import type { CatalogKind } from '../../data/catalog/types'
import { useFavorites } from '../../hooks/useFavorites'
import { cn } from '../../lib/utils'

export function FavoriteButton({
  listingId,
  catalog,
  className,
  size = 16,
}: {
  listingId?: string
  catalog?: { kind: CatalogKind; id: string }
  className?: string
  size?: number
}) {
  const { isListingFav, isCatalogFav, toggleListing, toggleCatalog } = useFavorites()
  const active = listingId
    ? isListingFav(listingId)
    : catalog
      ? isCatalogFav(catalog.kind, catalog.id)
      : false

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Aus Favoriten entfernen' : 'Zu Favoriten hinzufügen'}
      title={active ? 'Favorit entfernen' : 'Merken'}
      onClick={(e) => {
        e.preventDefault()
        e.stopPropagation()
        if (listingId) toggleListing(listingId)
        else if (catalog) toggleCatalog(catalog.kind, catalog.id)
      }}
      className={cn(
        'tap-target flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition touch-manipulation',
        active
          ? 'border-rose-400/45 bg-rose-500/20 text-rose-300 shadow-[0_0_16px_rgba(251,113,133,0.18)]'
          : 'border-border bg-black/45 text-neutral-400 hover:border-rose-400/35 hover:text-rose-200',
        className,
      )}
    >
      <Heart size={size} fill={active ? 'currentColor' : 'none'} />
    </button>
  )
}
