import { useEffect, useRef, useState } from 'react'
import idlePose from '../../assets/orbi/orbi-kind-idle.png'
import wavePose from '../../assets/orbi/orbi-kind-wave.png'
import dancePose from '../../assets/orbi/orbi-kind-dance.png'
import workPose from '../../assets/orbi/orbi-kind-work.png'
import runPose from '../../assets/orbi/orbi-kind-run.png'
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

const POSE_SRC: Record<OrbiMotion, string> = {
  idle: idlePose,
  winken: wavePose,
  tanzen: dancePose,
  arbeiten: workPose,
  rennen: runPose,
}

export type { OrbiMotion, OrbiStage }

/** Dev-only pin so a screenshot can hold one pose. Production builds drop this. */
function pinnedPose(): OrbiMotion | null {
  if (!import.meta.env.DEV || typeof window === 'undefined') return null
  const raw = new URLSearchParams(window.location.search).get('orbi')
  return isOrbiMotion(raw) ? raw : null
}

/**
 * Orbi Kind — committed transparent PNGs (idle, wave, dance, work, run).
 * No backdrop. Tap plays winken. Idle bobs. Reduced motion stays on the still idle frame.
 * Teen and Adult are not drawn.
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
  /** Only Kind is shipped. Other stage names stay on the Kind art. */
  stage?: OrbiStage
}) {
  const [live, setLive] = useState<OrbiMotion>('idle')
  const [pinned] = useState(pinnedPose)
  const [reduced, setReduced] = useState(false)
  const waveUntil = useRef(0)
  const motion = motionProp ?? pinned ?? live
  const driven = motionProp == null && pinned == null
  const shown: OrbiMotion = reduced ? 'idle' : motion

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  const onPress = () => {
    if (driven && !reduced) {
      waveUntil.current = Date.now() + WAVE_MS
      setLive('winken')
    }
    onTap?.()
  }

  useEffect(() => {
    if (!driven || reduced) return
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
  }, [driven, reduced])

  const slot = size === 'compact' ? 'h-28 w-36' : 'h-52 w-60'

  const frame = (
    <span
      className={cn('orbi-slot inline-flex shrink-0 items-end justify-center bg-transparent', slot, className)}
      data-orbi-motion={shown}
      data-orbi-kind="1"
      data-orbi-stage={stage}
      data-orbi-look="kind"
    >
      <img
        src={POSE_SRC[shown]}
        alt=""
        draggable={false}
        className="orbi-kind-img h-full w-full bg-transparent object-contain object-bottom"
      />
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

/** Same companion. Home and Prefs share these frames. */
export const OrbiPresence = OrbitRobot
