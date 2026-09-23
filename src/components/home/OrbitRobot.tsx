import { useEffect, useId, useRef, useState } from 'react'
import {
  isOrbiMotion,
  nextOrbiTour,
  type OrbiMotion,
  type OrbiStage,
} from '../../lib/orbiMotion'
import { cn } from '../../lib/utils'

/** How long a tour pose plays before Orbi settles back into idle. */
const TOUR_MS = 2400
/** Quiet idle between tour poses — Calm Home, not a loop of constant tricks. */
const IDLE_DWELL_MS = 6800
/** Wave held after a tap, even if a tour pose was in progress. */
const WAVE_MS = 1800

export type { OrbiMotion }

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  )
}

/** Dev-only pin so a screenshot can hold one pose. Production builds drop this. */
function pinnedPose(): OrbiMotion | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('orbi')
  return isOrbiMotion(raw) ? raw : null
}

/**
 * Orbi Kind — original jointed chibi. Not a stock bitmap.
 * White head and torso, gray ears and limb joints, black visor, cyan ring eyes, short antennae.
 * Inline SVG only, no backdrop. Teen and Adult accept the stage name but still draw Kind.
 */
export function OrbitRobot({
  className,
  tapped = false,
  onTap,
  label,
  motion: motionProp,
  size = 'hero',
  stage = 'kind',
}: {
  className?: string
  tapped?: boolean
  onTap?: () => void
  label?: string
  /** Controlled pose. Omit to let Orbi idle and tour on its own. */
  motion?: OrbiMotion
  size?: 'hero' | 'compact'
  /** Kind is the only drawing. `teen` and `adult` are stubs for later proportions. */
  stage?: OrbiStage
}) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '')
  const uid = `orbi${rawId}`
  const [live, setLive] = useState<OrbiMotion>('idle')
  const [pinned] = useState(pinnedPose)
  const waveUntil = useRef(0)
  const motion = motionProp ?? pinned ?? live
  const driven = motionProp == null && pinned == null

  const onPress = () => {
    if (driven && !prefersReducedMotion()) {
      waveUntil.current = Date.now() + WAVE_MS
      setLive('winken')
    }
    onTap?.()
  }

  useEffect(() => {
    if (!driven) return
    if (prefersReducedMotion()) return
    let stopped = false
    let timer = 0
    let pose: OrbiMotion = 'idle'

    const arm = (delay: number, fn: () => void) => {
      timer = window.setTimeout(() => {
        if (!stopped) fn()
      }, delay)
    }

    const settle = () => {
      const hold = waveUntil.current - Date.now()
      if (hold > 0) {
        arm(hold, settle)
        return
      }
      pose = 'idle'
      setLive('idle')
      arm(IDLE_DWELL_MS, play)
    }

    const play = () => {
      const hold = waveUntil.current - Date.now()
      if (hold > 0) {
        arm(hold, play)
        return
      }
      pose = nextOrbiTour(pose)
      setLive(pose)
      arm(TOUR_MS, settle)
    }

    arm(IDLE_DWELL_MS, play)
    return () => {
      stopped = true
      window.clearTimeout(timer)
    }
  }, [driven])

  const slot = size === 'compact' ? 'h-28 w-[5rem]' : 'h-48 w-[8.5rem]'

  const svg = (
    <svg
      className={cn('orbi-kind h-full w-full overflow-visible', className)}
      viewBox="0 -18 240 336"
      data-orbi-motion={motion}
      data-orbi-kind="1"
      data-orbi-stage={stage}
      data-orbi-look="kind"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-shell`} cx="32%" cy="28%" r="75%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#f4f7fb" />
          <stop offset="100%" stopColor="#d5dee8" />
        </radialGradient>
        <linearGradient id={`${uid}-joint`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#d5dde6" />
          <stop offset="100%" stopColor="#8d99a8" />
        </linearGradient>
        <radialGradient id={`${uid}-ear`} cx="35%" cy="30%" r="70%">
          <stop offset="0%" stopColor="#e7edf3" />
          <stop offset="100%" stopColor="#aeb8c4" />
        </radialGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2740" />
          <stop offset="45%" stopColor="#070b12" />
          <stop offset="100%" stopColor="#05070c" />
        </linearGradient>
        <filter id={`${uid}-glow`} x="-60%" y="-60%" width="220%" height="220%">
          <feGaussianBlur stdDeviation="2.4" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
        <filter id={`${uid}-ground`} x="-50%" y="-80%" width="200%" height="260%">
          <feGaussianBlur stdDeviation="2.1" />
        </filter>
      </defs>

      <ellipse
        className="orbi-shadow"
        cx="120"
        cy="302"
        rx="50"
        ry="7"
        fill="rgba(28, 25, 23, 0.16)"
        filter={`url(#${uid}-ground)`}
      />

      <g className="orbi-float">
        <g className="orbi-rig">
          <g className="orbi-leg orbi-leg-l">
            <circle cx="96" cy="214" r="9" fill={`url(#${uid}-joint)`} />
            <rect x="89" y="218" width="15" height="28" rx="7.5" fill={`url(#${uid}-joint)`} />
            <circle cx="96" cy="248" r="8" fill={`url(#${uid}-joint)`} />
            <rect x="90" y="252" width="13" height="20" rx="6.5" fill={`url(#${uid}-joint)`} />
            <rect x="76" y="266" width="34" height="18" rx="9" fill={`url(#${uid}-shell)`} />
          </g>
          <g className="orbi-leg orbi-leg-r">
            <circle cx="144" cy="214" r="9" fill={`url(#${uid}-joint)`} />
            <rect x="136" y="218" width="15" height="28" rx="7.5" fill={`url(#${uid}-joint)`} />
            <circle cx="144" cy="248" r="8" fill={`url(#${uid}-joint)`} />
            <rect x="137" y="252" width="13" height="20" rx="6.5" fill={`url(#${uid}-joint)`} />
            <rect x="130" y="266" width="34" height="18" rx="9" fill={`url(#${uid}-shell)`} />
          </g>

          <ellipse cx="120" cy="186" rx="40" ry="34" fill={`url(#${uid}-shell)`} />
          <ellipse cx="104" cy="170" rx="16" ry="10" fill="#ffffff" opacity="0.7" />

          <circle cx="120" cy="102" r="52" fill={`url(#${uid}-shell)`} />
          <ellipse cx="100" cy="78" rx="22" ry="12" fill="#ffffff" opacity="0.8" transform="rotate(-18 100 78)" />
          <circle cx="66" cy="108" r="16" fill={`url(#${uid}-ear)`} />
          <circle cx="174" cy="108" r="16" fill={`url(#${uid}-ear)`} />

          <g className="orbi-face">
            <rect x="86" y="90" width="68" height="40" rx="20" fill={`url(#${uid}-visor)`} />
            <ellipse cx="108" cy="102" rx="18" ry="8" fill="#ffffff" opacity="0.14" />
            <g className="orbi-eyes" filter={`url(#${uid}-glow)`}>
              <g className="orbi-eye">
                <circle cx="106" cy="110" r="12" fill="#39f0ff" opacity="0.35" />
                <circle cx="106" cy="110" r="8" fill="none" stroke="#5ef6ff" strokeWidth="3.5" />
                <circle cx="106" cy="110" r="8" fill="none" stroke="#f4feff" strokeWidth="1.1" />
              </g>
              <g className="orbi-eye">
                <circle cx="134" cy="110" r="12" fill="#39f0ff" opacity="0.35" />
                <circle cx="134" cy="110" r="8" fill="none" stroke="#5ef6ff" strokeWidth="3.5" />
                <circle cx="134" cy="110" r="8" fill="none" stroke="#f4feff" strokeWidth="1.1" />
              </g>
            </g>
          </g>

          <g className="orbi-arm orbi-arm-l">
            <circle cx="82" cy="168" r="10" fill={`url(#${uid}-joint)`} />
            <rect x="75" y="176" width="14" height="30" rx="7" fill={`url(#${uid}-joint)`} />
            <circle cx="82" cy="208" r="8" fill={`url(#${uid}-joint)`} />
            <rect x="70" y="212" width="22" height="28" rx="11" fill={`url(#${uid}-shell)`} />
          </g>
          <g className="orbi-arm orbi-arm-r">
            <circle cx="158" cy="168" r="10" fill={`url(#${uid}-joint)`} />
            <rect x="151" y="176" width="14" height="30" rx="7" fill={`url(#${uid}-joint)`} />
            <circle cx="158" cy="208" r="8" fill={`url(#${uid}-joint)`} />
            <rect x="148" y="212" width="22" height="28" rx="11" fill={`url(#${uid}-shell)`} />
          </g>

          <g className="orbi-antenna orbi-antenna-l">
            <path d="M104 58 C98 44 90 34 82 26" fill="none" stroke="#c5ced8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="78" cy="22" r="6" fill={`url(#${uid}-ear)`} />
            <path d="M74 16 C68 8 62 2 56 -2" fill="none" stroke="#c5ced8" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="52" cy="-6" r="7" fill={`url(#${uid}-ear)`} />
          </g>
          <g className="orbi-antenna orbi-antenna-r">
            <path d="M136 58 C142 44 150 34 158 26" fill="none" stroke="#c5ced8" strokeWidth="4" strokeLinecap="round" />
            <circle cx="162" cy="22" r="6" fill={`url(#${uid}-ear)`} />
            <path d="M166 16 C172 8 178 2 184 -2" fill="none" stroke="#c5ced8" strokeWidth="3.4" strokeLinecap="round" />
            <circle cx="188" cy="-6" r="7" fill={`url(#${uid}-ear)`} />
          </g>
        </g>
      </g>
    </svg>
  )

  const frame = (
    <span className={cn('orbi-slot inline-flex shrink-0', slot)} data-orbi-motion={motion}>
      {svg}
    </span>
  )

  if (!onTap) return frame

  return (
    <button
      type="button"
      onClick={onPress}
      aria-label={label || 'Orbi'}
      aria-expanded={tapped}
      className="tap-target inline-flex shrink-0 items-center justify-center rounded-2xl border-0 bg-transparent p-0"
    >
      {frame}
    </button>
  )
}

/** Same companion. Home and Prefs share this drawing. */
export const OrbiPresence = OrbitRobot
