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
      'bg-cyan text-black hover:bg-cyan/90 font-semibold glow-cyan disabled:opacity-50',
    secondary:
      'bg-surface-3 border border-border text-white hover:border-cyan/40 disabled:opacity-50',
    ghost: 'bg-transparent text-neutral-300 hover:text-white hover:bg-white/5',
    danger: 'bg-rose-600/90 text-white hover:bg-rose-600',
  }
  const sizes = {
    sm: 'px-3 py-1.5 text-sm rounded-lg',
    md: 'px-4 py-2.5 text-sm rounded-xl',
    lg: 'px-5 py-3 text-base rounded-xl',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 transition active:scale-[0.98] disabled:pointer-events-none',
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
