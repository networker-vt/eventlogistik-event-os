import { useEffect, useId, useRef, useState } from 'react'
import {
  isOrbiMotion,
  nextOrbiTour,
  type OrbiMotion,
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
 * Orbi Kind — original chibi companion.
 * White body, black visor, glowing cyan ring eyes, short antennae.
 * Inline SVG layers only (no bitmap, no backdrop). Idle breathe, plus
 * winken / tanzen / arbeiten / rennen from a gentle tour or a Home tap.
 */
export function OrbitRobot({
  className,
  tapped = false,
  onTap,
  label,
  motion: motionProp,
  size = 'hero',
}: {
  className?: string
  tapped?: boolean
  onTap?: () => void
  label?: string
  /** Controlled pose. Omit to let Orbi idle and tour on its own. */
  motion?: OrbiMotion
  size?: 'hero' | 'compact'
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

  const slot = size === 'compact' ? 'h-24 w-[5.45rem]' : 'h-32 w-[7.25rem]'

  const svg = (
    <svg
      className={cn('orbi-kind h-full w-full overflow-visible', className)}
      viewBox="0 0 200 220"
      data-orbi-motion={motion}
      data-orbi-kind="1"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <radialGradient id={`${uid}-body`} cx="34%" cy="28%" r="76%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="40%" stopColor="#f6f8fb" />
          <stop offset="76%" stopColor="#d3dce8" />
          <stop offset="100%" stopColor="#a9b8c9" />
        </radialGradient>
        <radialGradient id={`${uid}-limb`} cx="30%" cy="22%" r="80%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="52%" stopColor="#e6edf5" />
          <stop offset="100%" stopColor="#9eafc2" />
        </radialGradient>
        <radialGradient id={`${uid}-ball`} cx="34%" cy="30%" r="72%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#b7c4d4" />
        </radialGradient>
        <linearGradient id={`${uid}-stem`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="100%" stopColor="#b4c2d2" />
        </linearGradient>
        <linearGradient id={`${uid}-visor`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1a2740" />
          <stop offset="42%" stopColor="#070b12" />
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
        cx="100"
        cy="206"
        rx="36"
        ry="6"
        fill="rgba(28, 25, 23, 0.16)"
        filter={`url(#${uid}-ground)`}
      />

      <g className="orbi-float">
        <g className="orbi-rig">
          <g className="orbi-leg orbi-leg-l">
            <rect x="73" y="158" width="22" height="40" rx="11" fill={`url(#${uid}-limb)`} stroke="#c5d0de" strokeWidth="1.1" />
          </g>
          <g className="orbi-leg orbi-leg-r">
            <rect x="105" y="158" width="22" height="40" rx="11" fill={`url(#${uid}-limb)`} stroke="#c5d0de" strokeWidth="1.1" />
          </g>

          <g className="orbi-body">
            <circle cx="100" cy="108" r="60" fill={`url(#${uid}-body)`} stroke="#c5d0de" strokeWidth="1.25" />
            <ellipse
              cx="76"
              cy="78"
              rx="28"
              ry="16"
              fill="#ffffff"
              opacity="0.82"
              transform="rotate(-22 76 78)"
            />
            <ellipse cx="124" cy="136" rx="26" ry="16" fill="#8ea0b8" opacity="0.18" />
          </g>

          <g className="orbi-face">
            <rect x="50" y="78" width="100" height="54" rx="27" fill={`url(#${uid}-visor)`} />
            <ellipse cx="78" cy="94" rx="30" ry="11" fill="#ffffff" opacity="0.16" />
            <path
              d="M66 90 Q100 82 138 92"
              fill="none"
              stroke="#ffffff"
              strokeWidth="2.4"
              strokeLinecap="round"
              opacity="0.22"
            />
            <g className="orbi-eyes" filter={`url(#${uid}-glow)`}>
              <g className="orbi-eye">
                <circle cx="78" cy="104" r="14" fill="#39f0ff" opacity="0.35" />
                <circle cx="78" cy="104" r="9.4" fill="none" stroke="#5ef6ff" strokeWidth="3.6" />
                <circle cx="78" cy="104" r="9.4" fill="none" stroke="#f4feff" strokeWidth="1.15" />
              </g>
              <g className="orbi-eye">
                <circle cx="122" cy="104" r="14" fill="#39f0ff" opacity="0.35" />
                <circle cx="122" cy="104" r="9.4" fill="none" stroke="#5ef6ff" strokeWidth="3.6" />
                <circle cx="122" cy="104" r="9.4" fill="none" stroke="#f4feff" strokeWidth="1.15" />
              </g>
            </g>
            <path
              className="orbi-smile"
              d="M90 120 Q100 128 110 120"
              fill="none"
              stroke="#7af6ff"
              strokeWidth="2.1"
              strokeLinecap="round"
            />
          </g>

          <g className="orbi-arm orbi-arm-l">
            <rect x="14" y="98" width="32" height="52" rx="16" fill={`url(#${uid}-limb)`} stroke="#c5d0de" strokeWidth="1.1" />
            <ellipse cx="26" cy="110" rx="9" ry="6" fill="#ffffff" opacity="0.7" />
          </g>
          <g className="orbi-arm orbi-arm-r">
            <rect x="154" y="98" width="32" height="52" rx="16" fill={`url(#${uid}-limb)`} stroke="#c5d0de" strokeWidth="1.1" />
            <ellipse cx="174" cy="110" rx="9" ry="6" fill="#ffffff" opacity="0.55" />
          </g>

          <g className="orbi-antenna orbi-antenna-l">
            <path
              d="M84 54 C78 40 72 32 66 24"
              fill="none"
              stroke={`url(#${uid}-stem)`}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <circle cx="64" cy="20" r="8.2" fill={`url(#${uid}-ball)`} stroke="#c5d0de" strokeWidth="0.8" />
            <circle cx="61" cy="17" r="2.4" fill="#ffffff" opacity="0.9" />
          </g>
          <g className="orbi-antenna orbi-antenna-r">
            <path
              d="M116 54 C122 40 128 32 134 24"
              fill="none"
              stroke={`url(#${uid}-stem)`}
              strokeWidth="4.2"
              strokeLinecap="round"
            />
            <circle cx="136" cy="20" r="8.2" fill={`url(#${uid}-ball)`} stroke="#c5d0de" strokeWidth="0.8" />
            <circle cx="133" cy="17" r="2.4" fill="#ffffff" opacity="0.9" />
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
