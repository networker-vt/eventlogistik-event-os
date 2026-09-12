import { Link } from 'react-router-dom'
import { MapPin, Star } from 'lucide-react'
import type { Listing } from '../../types'
import { Badge } from '../ui/Badge'
import { VERTICAL_META } from '../../data/constants'
import { formatDate, formatPrice } from '../../lib/utils'

export function ListingCard({ listing }: { listing: Listing }) {
  const meta = VERTICAL_META[listing.vertical]
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card-hover block rounded-2xl border border-border bg-surface-2 p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-surface-3 text-2xl">
          {listing.imageEmoji}
        </div>
        <div className="flex flex-wrap justify-end gap-1">
          <Badge tone={listing.kind === 'offer' ? 'cyan' : 'amber'}>
            {listing.kind === 'offer' ? 'Angebot' : 'Gesuch'}
          </Badge>
          <Badge tone="teal">{meta?.label}</Badge>
        </div>
      </div>
      <h3 className="line-clamp-2 text-base font-semibold text-white">{listing.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{listing.description}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-neutral-400">
        <span className="inline-flex items-center gap-1">
          <MapPin size={12} /> {listing.city}
        </span>
        {listing.rating != null && (
          <span className="inline-flex items-center gap-1 text-amber-300">
            <Star size={12} fill="currentColor" /> {listing.rating.toFixed(1)}
          </span>
        )}
        {listing.dateFrom && <span>{formatDate(listing.dateFrom)}</span>}
      </div>
      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        <span className="text-sm font-medium text-cyan">
          {formatPrice(listing.priceFrom ?? listing.priceTo, listing.priceUnit)}
        </span>
        <span className="text-xs text-muted">{listing.ownerName}</span>
      </div>
    </Link>
  )
}
