import { cn } from '../../lib/utils'

/** Tiny cute Orbit head — CSS/SVG blink + bob, static under prefers-reduced-motion. */
export function OrbitRobot({ className }: { className?: string }) {
  return (
    <svg
      className={cn('orbit-robot h-10 w-10 shrink-0', className)}
      viewBox="0 0 40 40"
      aria-hidden="true"
      focusable="false"
    >
      <title>Orbit</title>
      <circle cx="20" cy="3.6" r="2.1" fill="var(--theme-accent, #00e0ea)" />
      <path d="M20 5.7 v4.2" stroke="var(--theme-accent, #00e0ea)" strokeWidth="1.6" strokeLinecap="round" />
      <rect
        x="6"
        y="10"
        width="28"
        height="26"
        rx="11"
        fill="#111111"
        stroke="color-mix(in oklab, var(--theme-accent, #00e0ea) 55%, #262626)"
        strokeWidth="1.4"
      />
      <rect x="10" y="16.2" width="20" height="11" rx="5.5" fill="#071416" />
      <g className="orbit-robot-eyes">
        <circle className="orbit-robot-eye" cx="16.2" cy="21.6" r="2.15" fill="var(--theme-accent, #00e0ea)" />
        <circle className="orbit-robot-eye" cx="23.8" cy="21.6" r="2.15" fill="var(--theme-accent, #00e0ea)" />
      </g>
      <path
        d="M16 29.2 q4 3.2 8 0"
        fill="none"
        stroke="color-mix(in oklab, var(--theme-accent, #00e0ea) 70%, white)"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
