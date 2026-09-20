import type { ComponentType } from 'react'
import { Link } from 'react-router-dom'
import { cn } from '../../lib/utils'

export type TileTone = 'teal' | 'amber' | 'violet' | 'sky' | 'rose' | 'lime' | 'indigo' | 'slate' | 'orange'

export interface HubTile {
  to: string
  label: string
  icon: ComponentType<{ size?: number; className?: string }>
  tone: TileTone
  demo?: boolean
}

const TONE: Record<TileTone, string> = {
  teal: 'border-teal/35 bg-teal/12 text-teal',
  amber: 'border-amber-300/40 bg-amber-200/15 text-amber-200',
  violet: 'border-violet-300/40 bg-violet-200/12 text-violet-300',
  sky: 'border-cyan/35 bg-cyan/12 text-cyan',
  rose: 'border-rose-300/40 bg-rose-300/12 text-rose-300',
  lime: 'border-emerald-300/40 bg-emerald-300/12 text-emerald-300',
  indigo: 'border-[var(--theme-accent)]/30 bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]',
  slate: 'border-border bg-surface-3 text-ink-soft',
  orange: 'border-amber-300/50 bg-amber-200/20 text-amber-200',
}

export function TileGrid({
  tiles,
  columns = 2,
  label,
}: {
  tiles: HubTile[]
  columns?: 2 | 3
  label?: string
}) {
  return (
    <ul
      data-tile-grid={tiles.length}
      aria-label={label}
      className={cn('grid gap-3', columns === 3 ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3')}
    >
      {tiles.map((tile) => (
        <li key={`${tile.to}:${tile.label}`}>
          <Link
            to={tile.to}
            className={cn(
              'btn-press flex min-h-[6.25rem] flex-col items-start justify-between rounded-2xl border-2 px-3 py-3',
              TONE[tile.tone],
            )}
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface/80 text-current shadow-sm">
              <tile.icon size={20} aria-hidden />
            </span>
            <span className="mt-3 flex w-full items-end justify-between gap-2">
              <span className="text-sm font-semibold leading-tight text-ink">{tile.label}</span>
              {tile.demo && (
                <span className="shrink-0 rounded-full border border-current/30 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide">
                  Demo
                </span>
              )}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}
