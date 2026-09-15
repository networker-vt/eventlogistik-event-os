import { Link } from 'react-router-dom'
import { Badge } from '../ui/Badge'
import { useI18n } from '../../lib/i18n'
import { TRAVEL_KIND_META, type TravelOffer } from '../../lib/travel'
import { formatPrice } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function TravelCard({
  offer,
  cheapest,
  compact,
}: {
  offer: TravelOffer
  cheapest?: boolean
  compact?: boolean
}) {
  const { resolved } = useI18n()
  const meta = TRAVEL_KIND_META[offer.kind]
  const kindLabel = resolved === 'de' ? meta.de : meta.en

  return (
    <Link
      to={`/reise/${offer.id}`}
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-border bg-surface-2/70 px-3 py-3 hover:border-[var(--theme-accent)]/40',
        compact && 'py-2.5',
      )}
    >
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-xl">
        {offer.imageEmoji}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-1.5">
          <p className="truncate text-sm font-semibold text-white">{offer.title}</p>
          {cheapest && (
            <Badge className="border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/15 text-[10px]">
              {resolved === 'de' ? 'günstigste Option' : 'cheapest'}
            </Badge>
          )}
        </div>
        <p className="mt-0.5 truncate text-xs text-muted">
          {kindLabel} · {offer.provider}
          {offer.duration ? ` · ${offer.duration}` : ''}
        </p>
        {offer.tags.length > 0 && !compact && (
          <p className="mt-1 truncate text-[11px] text-neutral-500">{offer.tags.join(' · ')}</p>
        )}
      </div>
      <div className="shrink-0 text-right">
        <p className="text-sm font-semibold tabular-nums text-white">{formatPrice(offer.priceEur)}</p>
        {offer.rating != null && <p className="text-[11px] text-muted">★ {offer.rating.toFixed(1)}</p>}
      </div>
    </Link>
  )
}
