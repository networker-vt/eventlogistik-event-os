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
  const items: { icon: typeof Car; label: string }[] = []
  if (listing.travel) {
    items.push({ icon: Car, label: TRAVEL_OPTIONS[listing.travel] })
  }
  if (listing.overnight) {
    items.push({ icon: Hotel, label: OVERNIGHT_OPTIONS[listing.overnight] })
  }
  if (listing.expenses) {
    items.push({
      icon: Receipt,
      label: listing.expensesNote
        ? `${EXPENSES_OPTIONS[listing.expenses]} — ${listing.expensesNote}`
        : EXPENSES_OPTIONS[listing.expenses],
    })
  }
  if (listing.dayHours) {
    items.push({ icon: Timer, label: `${listing.dayHours}h-Tag` })
  }
  if (items.length === 0) return null

  if (compact) {
    return (
      <p className="mt-2 line-clamp-1 text-xs text-neutral-400">
        {items.map((i) => i.label).join(' · ')}
      </p>
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
