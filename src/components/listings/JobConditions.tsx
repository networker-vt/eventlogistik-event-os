import { Car, Hotel, Receipt, Timer } from 'lucide-react'
import {
  EXPENSES_OPTIONS,
  OVERNIGHT_OPTIONS,
  TRAVEL_OPTIONS,
} from '../../data/constants'
import type { Listing } from '../../types'
import { cn } from '../../lib/utils'

export function JobConditions({
  listing,
  compact = false,
}: {
  listing: Listing
  compact?: boolean
}) {
  const items: { icon: typeof Car; label: string; short: string }[] = []
  if (listing.travel) {
    items.push({
      icon: Car,
      label: TRAVEL_OPTIONS[listing.travel],
      short: listing.travel === 'included' ? 'Anfahrt inkl.' : listing.travel === 'per_km' ? 'km-Pauschale' : listing.travel === 'self' ? 'Anfahrt selbst' : 'Anfahrt TBD',
    })
  }
  if (listing.overnight) {
    items.push({
      icon: Hotel,
      label: OVERNIGHT_OPTIONS[listing.overnight],
      short: listing.overnight === 'provided' || listing.overnight === 'hotel' ? 'ÜN gestellt' : listing.overnight === 'none' ? 'ohne ÜN' : 'ÜN TBD',
    })
  }
  if (listing.expenses) {
    items.push({
      icon: Receipt,
      label: listing.expensesNote
        ? `${EXPENSES_OPTIONS[listing.expenses]} — ${listing.expensesNote}`
        : EXPENSES_OPTIONS[listing.expenses],
      short:
        listing.expenses === 'included'
          ? 'Spesen inkl.'
          : listing.expenses === 'receipts'
            ? 'Spesen Beleg'
            : listing.expenses === 'flat'
              ? 'Spesen Pauschale'
              : listing.expenses === 'none'
                ? 'keine Spesen'
                : 'Spesen TBD',
    })
  }
  if (listing.dayHours) {
    items.push({ icon: Timer, label: `${listing.dayHours}h-Tag`, short: `${listing.dayHours}h-Tag` })
  }
  if (items.length === 0) return null

  if (compact) {
    return (
      <div className="mt-2.5 flex flex-wrap gap-1.5">
        {items.slice(0, 4).map((i) => (
          <span key={i.short} className="chip" title={i.label}>
            <i.icon size={11} className="shrink-0 text-teal" />
            {i.short}
          </span>
        ))}
      </div>
    )
  }

  return (
    <div className="mt-4 grid gap-2 sm:grid-cols-2">
      {items.map((i) => (
        <div
          key={i.label}
          className={cn(
            'flex items-start gap-2 rounded-xl border border-border bg-surface-3/50 px-3 py-2 text-sm',
          )}
        >
          <i.icon size={14} className="mt-0.5 shrink-0 text-teal" />
          <div>
            <div className="text-[11px] text-muted">Kondition</div>
            {i.label}
          </div>
        </div>
      ))}
    </div>
  )
}
