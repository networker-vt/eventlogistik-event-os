import { Link } from 'react-router-dom'
import type { MatchSuggestion } from '../../lib/homeSuggestions'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

export function MatchSuggestionCard({ item }: { item: MatchSuggestion }) {
  const { t } = useI18n()
  return (
    <Link
      to={item.to}
      className="flex w-[13.5rem] shrink-0 snap-start flex-col rounded-2xl border border-border/80 bg-surface-2/50 px-3 py-3 hover:border-[var(--theme-accent)]/40"
    >
      <div className="flex items-start justify-between gap-2">
        <span className="text-lg" aria-hidden>
          {item.emoji}
        </span>
        <span
          className={cn(
            'rounded-full border px-2 py-0.5 text-[11px] font-semibold tabular-nums',
            item.percent >= 75
              ? 'border-cyan/40 text-cyan'
              : item.percent >= 55
                ? 'border-teal/40 text-teal'
                : 'border-amber-400/40 text-amber-200',
          )}
        >
          {item.percent}%
        </span>
      </div>
      <p className="mt-2 line-clamp-2 text-sm font-medium leading-snug text-white">{item.title}</p>
      <p className="mt-1 truncate text-[11px] text-muted">{t(`suggest.kind.${item.kind}`)}</p>
      <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-neutral-400">{item.reason}</p>
    </Link>
  )
}
