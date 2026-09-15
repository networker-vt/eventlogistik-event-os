import { Link } from 'react-router-dom'
import type { RankedDeal } from '../../lib/behavior'
import { deriveMarketType } from '../../lib/market'
import { TRAVEL_KIND_META } from '../../lib/travel'
import { useI18n } from '../../lib/i18n'
import { formatPrice, formatPriceRange } from '../../lib/utils'
import { LaneBadge } from '../credits/LaneBadge'

export function TopDealCard({ deal }: { deal: RankedDeal }) {
  const { resolved } = useI18n()
  if (deal.kind === 'travel' && deal.offer) {
    const o = deal.offer
    const meta = TRAVEL_KIND_META[o.kind]
    const kindLabel = resolved === 'de' ? meta.de : meta.en
    return (
      <Link
        to={`/reise/${o.id}`}
        className="flex min-h-14 items-start gap-3 rounded-2xl border border-border/70 bg-surface-2/40 px-3 py-3 transition hover:border-[var(--theme-accent)]/40"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg" aria-hidden>
          {o.imageEmoji}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-medium text-white">{o.title}</span>
          <span className="mt-0.5 block truncate text-[11px] text-muted">{deal.reason}</span>
          <span className="mt-0.5 block truncate text-[11px] text-neutral-500">
            {kindLabel} · {o.provider} · Demo
          </span>
        </span>
        <span className="shrink-0 text-right">
          <span className="block text-sm font-semibold tabular-nums text-[var(--theme-accent)]">
            {formatPrice(o.priceEur)}
          </span>
        </span>
      </Link>
    )
  }

  const listing = deal.listing
  if (!listing) return null
  const rate = formatPriceRange(listing.priceFrom, listing.priceTo, listing.priceUnit)
  const lane = deriveMarketType(listing)
  const meta = [listing.city, listing.jobType || listing.industry || lane].filter(Boolean).join(' · ')

  return (
    <Link
      to={`/listings/${listing.id}`}
      className="flex min-h-14 items-start gap-3 rounded-2xl border border-border/70 bg-surface-2/40 px-3 py-3 transition hover:border-[var(--theme-accent)]/40"
    >
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-black/30 text-lg" aria-hidden>
        {listing.imageEmoji || '💼'}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-white">{listing.title}</span>
        <span className="mt-0.5 block truncate text-[11px] text-muted">{deal.reason}</span>
        <span className="mt-0.5 block truncate text-[11px] text-neutral-500">{meta}</span>
      </span>
      <span className="shrink-0 text-right">
        <span className="block text-sm font-semibold tabular-nums text-[var(--theme-accent)]">{rate}</span>
        {listing.featured ? <LaneBadge lane="credits" /> : null}
      </span>
    </Link>
  )
}
