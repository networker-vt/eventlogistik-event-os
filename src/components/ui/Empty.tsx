import { Sparkles } from 'lucide-react'
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
        'relative overflow-hidden rounded-2xl border border-dashed border-cyan/25 bg-gradient-to-b from-cyan/5 via-surface-2/60 to-surface-2/40 px-6 py-12 text-center',
        className,
      )}
    >
      <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-cyan/10 blur-2xl motion-orb" />
      <div className="pointer-events-none absolute -bottom-10 left-6 h-24 w-24 rounded-full bg-teal/10 blur-2xl motion-orb-delay" />
      <div className="relative mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan/30 bg-cyan/10 text-2xl shadow-[0_0_24px_rgba(0,240,255,0.12)]">
        {emoji}
      </div>
      <p className="relative text-lg font-semibold text-white">{title}</p>
      {hint && <p className="relative mx-auto mt-2 max-w-sm text-sm leading-relaxed text-muted">{hint}</p>}
      {actionLabel && onAction && (
        <Button className="relative mt-5" onClick={onAction}>
          <Sparkles size={16} />
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
