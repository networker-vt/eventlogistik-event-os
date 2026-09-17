import { Link, type LinkProps } from 'react-router-dom'
import { cn } from '../../lib/utils'

export type ButtonVariant = 'primary' | 'secondary' | 'tonal' | 'ghost' | 'danger'
export type ButtonSize = 'sm' | 'md' | 'lg'

const variants: Record<ButtonVariant, string> = {
  primary:
    'btn-press bg-[var(--theme-accent,#0f766e)] text-[var(--theme-on-accent,#faf8f5)] font-semibold shadow-[0_0_20px_color-mix(in_oklab,var(--theme-accent)_22%,transparent)] hover:brightness-110 disabled:opacity-50',
  secondary:
    'btn-press border-2 border-[var(--theme-accent,#0f766e)] bg-transparent text-[var(--theme-accent,#0f766e)] font-semibold hover:bg-[var(--theme-accent)]/12 disabled:opacity-50',
  tonal:
    'btn-press border border-[var(--theme-accent,#0f766e)]/45 bg-surface-3 text-ink font-medium hover:border-[var(--theme-accent)] hover:bg-[var(--theme-accent)]/10 disabled:opacity-50',
  ghost:
    'btn-press border border-transparent bg-transparent text-ink-soft hover:border-border hover:bg-surface-3 hover:text-ink disabled:opacity-50',
  danger: 'btn-press bg-rose-600/90 text-white font-semibold hover:bg-rose-600',
}

const sizes: Record<ButtonSize, string> = {
  sm: 'min-h-10 px-3 py-2 text-sm rounded-lg',
  md: 'min-h-11 px-4 py-2.5 text-sm rounded-xl',
  lg: 'min-h-12 px-5 py-3 text-base rounded-xl',
}

export function buttonClassName({
  variant = 'primary',
  size = 'md',
  className,
}: {
  variant?: ButtonVariant
  size?: ButtonSize
  className?: string
} = {}) {
  return cn(
    'inline-flex items-center justify-center gap-2 disabled:pointer-events-none touch-manipulation',
    variants[variant],
    sizes[size],
    className,
  )
}

export function Button({
  children,
  className,
  variant = 'primary',
  size = 'md',
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <button className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </button>
  )
}

/** Same visual system as Button, for in-app routes. */
export function ButtonLink({
  children,
  className,
  variant = 'secondary',
  size = 'md',
  ...props
}: LinkProps & {
  variant?: ButtonVariant
  size?: ButtonSize
}) {
  return (
    <Link className={buttonClassName({ variant, size, className })} {...props}>
      {children}
    </Link>
  )
}
