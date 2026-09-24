import { Link } from 'react-router-dom'
import { MapPin, ShieldCheck, Sparkles, Star } from 'lucide-react'
import { FavoriteButton } from '../favorites/FavoriteButton'
import type { Listing } from '../../types'
import { Badge } from '../ui/Badge'
import { VERTICAL_META } from '../../data/constants'
import { deriveMarketType } from '../../lib/market'
import { formatDate, formatPriceRange } from '../../lib/utils'
import { isFlagOn } from '../../lib/flags'
import { resolveSeller } from '../../lib/seller'
import { JobConditions } from './JobConditions'

function trustLabel(level: Listing['ownerVerified']) {
  if (level === 'business') return 'Business ✓'
  if (level === 'id') return 'ID ✓'
  if (level === 'email') return 'Mail ✓'
  return null
}

export function ListingCard({
  listing,
  highlightRate = false,
}: {
  listing: Listing
  highlightRate?: boolean
}) {
  const meta = VERTICAL_META[listing.vertical]
  const rate = formatPriceRange(listing.priceFrom, listing.priceTo, listing.priceUnit)
  const showRateTop = highlightRate || listing.vertical === 'job'
  const trust = trustLabel(listing.ownerVerified)

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="card-hover card-elevated group relative block rounded-2xl border border-border p-4"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-border/80 bg-gradient-to-br from-surface-3 to-black/40 text-2xl shadow-inner">
          {listing.imageEmoji}
        </div>
        <div className="flex flex-wrap items-start justify-end gap-1">
          <FavoriteButton listingId={listing.id} />
          <Badge tone={listing.kind === 'offer' ? 'cyan' : 'amber'}>
            {listing.kind === 'offer' ? 'Angebot' : 'Gesuch'}
          </Badge>
          {listing.industry ? (
            <Badge tone="teal">{listing.industry}</Badge>
          ) : (
            <Badge tone="teal">{meta?.label}</Badge>
          )}
          {listing.jobType && <Badge>{listing.jobType}</Badge>}
          {listing.marketType && listing.marketType !== 'job' && (
            <Badge tone="violet">{listing.marketType}</Badge>
          )}
          {!listing.marketType && deriveMarketType(listing) !== 'job' && (
            <Badge tone="violet">{deriveMarketType(listing)}</Badge>
          )}
          {isFlagOn('credits') && listing.featured && <Badge tone="cyan">Featured</Badge>}
          <Badge>{resolveSeller(listing).kind === 'commercial' ? 'Gewerblich' : 'Privat'}</Badge>
        </div>
      </div>

      {showRateTop && (
        <div className="mb-2 flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-cyan md:text-[1.35rem]">{rate}</span>
          {listing.dayHours ? (
            <span className="text-xs text-muted">{listing.dayHours}h-Tag</span>
          ) : null}
        </div>
      )}

      <h3 className="line-clamp-2 text-base font-semibold text-ink transition group-hover:text-cyan/95">
        {listing.title}
      </h3>
      <p className="mt-1 line-clamp-2 text-sm text-muted">{listing.description}</p>

      {(listing.venue || listing.callTime || listing.dateFrom) && (
        <p className="mt-2 line-clamp-1 text-xs text-neutral-400">
          {[listing.dateFrom && formatDate(listing.dateFrom), listing.venue, listing.callTime]
            .filter(Boolean)
            .join(' · ')}
        </p>
      )}
      <JobConditions listing={listing} compact />

      {listing.matchReason && (
        <p className="mt-2.5 inline-flex items-start gap-1.5 rounded-xl border border-cyan/20 bg-cyan/10 px-2.5 py-1.5 text-xs text-cyan">
          <Sparkles size={12} className="mt-0.5 shrink-0" />
          <span className="line-clamp-2">{listing.matchReason}</span>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center gap-1.5">
        <span className="chip">
          <MapPin size={11} /> {listing.city}
          {listing.country && listing.country !== 'Deutschland' ? ` · ${listing.country}` : ''}
        </span>
        {listing.rating != null && (
          <span className="chip" style={{ color: '#fcd34d', borderColor: 'rgba(251,191,36,0.35)' }}>
            <Star size={11} fill="currentColor" /> {listing.rating.toFixed(1)}
          </span>
        )}
        {trust && (
          <span className="chip chip-trust">
            <ShieldCheck size={11} /> {trust}
          </span>
        )}
        {listing.crafts?.slice(0, 2).map((c) => (
          <span key={c} className="chip chip-teal">
            {c}
          </span>
        ))}
      </div>

      <div className="mt-3 flex items-center justify-between border-t border-border/70 pt-3">
        {!showRateTop ? (
          <span className="text-sm font-semibold text-cyan">{rate}</span>
        ) : (
          <span className="text-xs font-medium text-cyan/90 group-hover:text-cyan">
            {listing.vertical === 'job' ? 'Interesse →' : 'Jetzt anfragen →'}
          </span>
        )}
        <span className="truncate text-xs text-muted">{listing.ownerName}</span>
      </div>
    </Link>
  )
}
