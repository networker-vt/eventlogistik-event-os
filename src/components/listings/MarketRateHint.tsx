import { MARKET_RATE } from '../../data/constants'
import { cn } from '../../lib/utils'

export function MarketRateHint({
  compact = false,
  className,
}: {
  compact?: boolean
  className?: string
}) {
  return (
    <p className={cn('text-xs leading-relaxed text-muted', className)}>
      {compact ? (
        <>
          Marktwert: <span className="text-neutral-300">{MARKET_RATE.short}</span> — Fachkraft
          400–500 € · Spezialist 600–800 € · keine Garantie
        </>
      ) : (
        MARKET_RATE.full
      )}
    </p>
  )
}
