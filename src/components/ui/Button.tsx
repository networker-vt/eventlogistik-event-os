import { cn } from '../../lib/utils'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant
  size?: 'sm' | 'md' | 'lg'
}) {
  const variants: Record<Variant, string> = {
    primary:
      'bg-[var(--theme-accent,#0f766e)] text-[var(--theme-on-accent,#faf8f5)] hover:opacity-90 font-semibold shadow-[0_0_20px_color-mix(in_oklab,var(--theme-accent)_22%,transparent)] disabled:opacity-50',
    secondary:
      'bg-surface-3 border border-border text-ink hover:border-cyan/45 hover:bg-surface-3/80 disabled:opacity-50',
    ghost: 'bg-transparent text-ink-soft hover:text-ink hover:bg-ink/5',
    danger: 'bg-rose-600/90 text-white hover:bg-rose-600',
  }
  const sizes = {
    sm: 'min-h-10 px-3 py-2 text-sm rounded-lg',
    md: 'min-h-11 px-4 py-2.5 text-sm rounded-xl',
    lg: 'min-h-12 px-5 py-3 text-base rounded-xl',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:pointer-events-none touch-manipulation',
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  )
}
