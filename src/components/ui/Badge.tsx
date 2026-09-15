import { cn } from '../../lib/utils'

export function Badge({
  children,
  tone = 'default',
  className,
}: {
  children: React.ReactNode
  tone?: 'default' | 'cyan' | 'teal' | 'amber' | 'rose' | 'green' | 'violet'
  className?: string
}) {
  const tones = {
    default: 'bg-white/5 text-neutral-300 border-white/10',
    cyan: 'bg-cyan/15 text-cyan border-cyan/30',
    teal: 'bg-teal/15 text-teal border-teal/30',
    amber: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
    rose: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
    green: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
    violet: 'bg-violet-500/15 text-violet-300 border-violet-500/30',
  }
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium',
        tones[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
