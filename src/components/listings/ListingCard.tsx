import { Link } from 'react-router-dom'
import { MapPin, Sparkles, Star } from 'lucide-react'
import type { Listing } from '../../types'
import { Badge } from '../ui/Badge'
import { VERTICAL_META } from '../../data/constants'
import { formatDate, formatPrice } from '../../lib/utils'

export function ListingCard({
  listing,
  highlightRate = false,
}: {
  listing: Listing
  highlightRate?: boolean
}) {
  const meta = VERTICAL_META[listing.vertical]
  const rate = formatPrice(listing.priceFrom ?? listing.priceTo, listing.priceUnit)

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

      {(highlightRate || listing.vertical === 'job') && (
        <div className="mb-2 text-lg font-bold text-cyan">{rate}</div>
      )}

      <h3 className="line-clamp-2 text-base font-semibold text-white">{listing.title}</h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{listing.description}</p>

      {(listing.venue || listing.callTime) && (
        <p className="mt-2 line-clamp-1 text-xs text-neutral-400">
          {listing.venue}
          {listing.venue && listing.callTime ? ' · ' : ''}
          {listing.callTime}
        </p>
      )}

      {listing.matchReason && (
        <p className="mt-2 inline-flex items-start gap-1 rounded-lg bg-cyan/10 px-2 py-1 text-[11px] text-cyan">
          <Sparkles size={12} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{listing.matchReason}</span>
        </p>
      )}

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
        {listing.ownerVerified !== 'none' && (
          <Badge tone="green" className="!py-0">
            ✓ {listing.ownerVerified === 'business' ? 'Business' : listing.ownerVerified === 'id' ? 'ID' : 'Mail'}
          </Badge>
        )}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        {!(highlightRate || listing.vertical === 'job') ? (
          <span className="text-sm font-medium text-cyan">{rate}</span>
        ) : (
          <span className="text-xs text-muted">Jetzt anfragen →</span>
        )}
        <span className="truncate text-xs text-muted">{listing.ownerName}</span>
      </div>
    </Link>
  )
}
