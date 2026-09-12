import { cn } from '../../lib/utils'

export function Input({
  className,
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <input
        className={cn(
          'w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-white placeholder:text-neutral-600 outline-none focus:border-cyan/50',
          className,
        )}
        {...props}
      />
    </label>
  )
}

export function Select({
  className,
  label,
  children,
  ...props
}: React.SelectHTMLAttributes<HTMLSelectElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <select
        className={cn(
          'w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-white outline-none focus:border-cyan/50',
          className,
        )}
        {...props}
      >
        {children}
      </select>
    </label>
  )
}

export function Textarea({
  className,
  label,
  ...props
}: React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label?: string }) {
  return (
    <label className="block space-y-1.5">
      {label && <span className="text-sm text-muted">{label}</span>}
      <textarea
        className={cn(
          'w-full rounded-xl border border-border bg-surface-2 px-3 py-2.5 text-white placeholder:text-neutral-600 outline-none focus:border-cyan/50 min-h-24',
          className,
        )}
        {...props}
      />
    </label>
  )
}
