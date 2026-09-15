import { cn } from '../../lib/utils'

export function StarRating({
  value,
  onChange,
  readOnly = false,
  size = 22,
  label,
}: {
  value: number
  onChange?: (n: number) => void
  readOnly?: boolean
  size?: number
  label?: string
}) {
  return (
    <div className="inline-flex items-center gap-0.5" role={readOnly ? 'img' : 'radiogroup'} aria-label={label ?? `${value} von 5 Sternen`}>
      {[1, 2, 3, 4, 5].map((n) => {
        const on = n <= value
        if (readOnly) {
          return (
            <span key={n} className={cn('leading-none', on ? 'text-amber-400' : 'text-neutral-600')} aria-hidden>
              ★
            </span>
          )
        }
        return (
          <button
            key={n}
            type="button"
            role="radio"
            aria-checked={value === n}
            aria-label={`${n} Sterne`}
            className="tap-target flex items-center justify-center p-1"
            onClick={() => onChange?.(n)}
          >
            <span className={cn('text-xl leading-none', on ? 'text-amber-400' : 'text-neutral-600')} style={{ fontSize: size }}>
              ★
            </span>
          </button>
        )
      })}
    </div>
  )
}
