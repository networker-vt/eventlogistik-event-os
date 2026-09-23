import { useEffect, useRef, useState } from 'react'
import idlePose from '../../assets/orbi/orbi-kind-idle.png'
import wavePose from '../../assets/orbi/orbi-kind-wave.png'
import dancePose from '../../assets/orbi/orbi-kind-dance.png'
import workPose from '../../assets/orbi/orbi-kind-work.png'
import runPose from '../../assets/orbi/orbi-kind-run.png'
import {
  ORBI_DANCE_MS,
  ORBI_IDLE_MS,
  ORBI_WAVE_MS,
  isOrbiMotion,
  orbiNavRunRemaining,
  poseAfterIdle,
  poseForTap,
  resolveOrbiPose,
  type OrbiMotion,
  type OrbiStage,
} from '../../lib/orbiMotion'
import { cn } from '../../lib/utils'

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

function initialLive(): OrbiMotion {
  return orbiNavRunRemaining() > 0 ? 'rennen' : 'idle'
}

/**
 * Orbi Kind — CSS pose swap across the five transparent PNGs, plus a light idle bob.
 * Tap waves. After ~8s idle, one dance, then idle again.
 * Busy shows work. A nav cue shows a short run. Reduced motion stays on still idle.
 */
export function OrbitRobot({
  className,
  tapped = false,
  onTap,
  label,
  motion: motionProp,
  busy = false,
  size = 'hero',
  stage = 'kind',
}: {
  className?: string
  tapped?: boolean
  onTap?: () => void
  label?: string
  /** Controlled pose. Omit to let Orbi follow the provisional defaults. */
  motion?: OrbiMotion
  /** Loading or in-flight work. Shows the work pose. */
  busy?: boolean
  size?: 'hero' | 'compact'
  /** Only Kind is shipped. Other stage names stay on the Kind art. */
  stage?: OrbiStage
}) {
  const [live, setLive] = useState<OrbiMotion>(initialLive)
  const [pinned] = useState(pinnedPose)
  const [reduced, setReduced] = useState(false)
  const [seq, setSeq] = useState(0)
  const entry = useRef<OrbiMotion>(initialLive())
  const [prevBusy, setPrevBusy] = useState(busy)
  if (busy !== prevBusy) {
    setPrevBusy(busy)
    if (!busy) setLive('idle')
  }

  const driven = motionProp == null && pinned == null
  const shown = resolveOrbiPose({
    reduced,
    pinned,
    motion: motionProp,
    busy,
    live,
  })

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)')
    const apply = () => setReduced(media.matches)
    apply()
    media.addEventListener('change', apply)
    return () => media.removeEventListener('change', apply)
  }, [])

  const onPress = () => {
    if (driven && !reduced && !busy) {
      entry.current = poseForTap()
      setLive(poseForTap())
      setSeq((n) => n + 1)
    }
    onTap?.()
  }

  useEffect(() => {
    if (!driven || reduced || busy) {
      entry.current = 'idle'
      return
    }
    let stopped = false
    let timer = 0

    const arm = (delay: number, fn: () => void) => {
      timer = window.setTimeout(() => {
        if (!stopped) fn()
      }, delay)
    }

    const beginIdle = () => {
      setLive('idle')
      arm(ORBI_IDLE_MS, () => {
        setLive(poseAfterIdle())
        arm(ORBI_DANCE_MS, beginIdle)
      })
    }

    const start = entry.current
    entry.current = 'idle'
    if (start === 'winken') arm(ORBI_WAVE_MS, beginIdle)
    else if (start === 'rennen') arm(orbiNavRunRemaining(), beginIdle)
    else arm(ORBI_IDLE_MS, () => {
      setLive(poseAfterIdle())
      arm(ORBI_DANCE_MS, beginIdle)
    })

    return () => {
      stopped = true
      window.clearTimeout(timer)
      // Strict-mode remounts the effect immediately. Keep the entry pose
      // unless a newer tap already replaced it.
      if (entry.current === 'idle' && (start === 'winken' || start === 'rennen')) {
        entry.current = start
      }
    }
  }, [driven, reduced, busy, seq])

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
