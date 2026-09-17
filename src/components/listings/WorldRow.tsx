import { Link } from 'react-router-dom'
import type { Listing } from '../../types'
import { formatPriceRange } from '../../lib/utils'

export function WorldRow({ listing }: { listing: Listing }) {
  const rate = formatPriceRange(listing.priceFrom, listing.priceTo, listing.priceUnit)
  const meta = [listing.city, listing.jobType || listing.industry].filter(Boolean).join(' · ')
  return (
    <Link
      to={`/listings/${listing.id}`}
      className="flex min-h-14 items-center gap-3 rounded-2xl border border-border/70 bg-surface-2/40 px-3 py-3 transition hover:border-[var(--theme-accent)]/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg" aria-hidden>
        {listing.imageEmoji || '💼'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-ink">{listing.title}</span>
        <span className="block truncate text-xs text-muted">{meta}</span>
      </span>
      <span className="shrink-0 text-sm font-semibold tabular-nums text-[var(--theme-accent)]">{rate}</span>
    </Link>
  )
}
