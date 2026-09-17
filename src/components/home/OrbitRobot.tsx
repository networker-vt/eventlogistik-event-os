import { cn } from '../../lib/utils'

/** Tiny cute Orbit head — CSS/SVG blink + bob; tap bounce. Static under prefers-reduced-motion. */
export function OrbitRobot({
  className,
  tapped = false,
  onTap,
  label,
}: {
  className?: string
  tapped?: boolean
  onTap?: () => void
  label?: string
}) {
  const svg = (
    <svg
      className={cn('orbit-robot h-10 w-10 shrink-0', tapped && 'is-tapped', className)}
      viewBox="0 0 40 40"
      aria-hidden={onTap ? true : undefined}
      focusable="false"
    >
      <title>Orbit</title>
      <circle cx="20" cy="3.6" r="2.1" fill="var(--theme-accent, #0f766e)" />
      <path d="M20 5.7 v4.2" stroke="var(--theme-accent, #0f766e)" strokeWidth="1.6" strokeLinecap="round" />
      <rect
        x="6"
        y="10"
        width="28"
        height="26"
        rx="11"
        fill="#1c1917"
        stroke="color-mix(in oklab, var(--theme-accent, #0f766e) 55%, #44403c)"
        strokeWidth="1.4"
      />
      <rect x="10" y="16.2" width="20" height="11" rx="5.5" fill="#faf8f5" />
      <g className="orbit-robot-eyes">
        <circle className="orbit-robot-eye" cx="16.2" cy="21.6" r="2.15" fill="var(--theme-accent, #0f766e)" />
        <circle className="orbit-robot-eye" cx="23.8" cy="21.6" r="2.15" fill="var(--theme-accent, #0f766e)" />
      </g>
      <path
        d="M16 29.2 q4 3.2 8 0"
        fill="none"
        stroke="color-mix(in oklab, var(--theme-accent, #0f766e) 70%, #faf8f5)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )

  if (!onTap) return svg

  return (
    <button
      type="button"
      onClick={onTap}
      aria-label={label || 'Orbit'}
      aria-expanded={tapped}
      className="tap-target -m-1 shrink-0 rounded-2xl p-1"
    >
      {svg}
    </button>
  )
}
