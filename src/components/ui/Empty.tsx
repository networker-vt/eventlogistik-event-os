import { Button } from './Button'

export function Empty({
  title,
  hint,
  actionLabel,
  onAction,
}: {
  title: string
  hint?: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="rounded-2xl border border-dashed border-border bg-surface-2/50 px-6 py-12 text-center">
      <p className="text-lg font-medium text-white">{title}</p>
      {hint && <p className="mt-2 text-sm text-muted">{hint}</p>}
      {actionLabel && onAction && (
        <Button className="mt-5" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  )
}
