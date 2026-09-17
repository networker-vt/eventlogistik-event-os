import { Button } from './Button'
import { cn } from '../../lib/utils'

export function Empty({
  title,
  hint,
  actionLabel,
  onAction,
  emoji = '⚡',
  className,
}: {
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
  emoji?: string
  className?: string
}) {
  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl border border-dashed border-border bg-surface-2/50 px-6 py-10 text-center',
        className,
      )}
    >
      <div className="relative mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border border-border bg-surface-3 text-2xl">
        {emoji}
      </div>
      <p className="relative text-lg font-semibold text-ink">{title}</p>
      {hint && <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{hint}</p>}
      {actionLabel && onAction && (
          <Button className="relative mt-5" onClick={onAction}>
            {actionLabel}
          </Button>
      )}
    </div>
  )
}
