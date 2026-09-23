/** Living Orbi poses. German names match the Kind companion brief. */
export const ORBI_MOTIONS = ['idle', 'winken', 'tanzen', 'arbeiten', 'rennen'] as const

export type OrbiMotion = (typeof ORBI_MOTIONS)[number]

/** Kind ships now. Teen and Adult are named stubs until their drawings exist. */
export const ORBI_STAGES = ['kind', 'teen', 'adult'] as const

export type OrbiStage = (typeof ORBI_STAGES)[number]

/**
 * Provisional motion defaults (Technik C: CSS pose swap).
 * A later team vote may replace these timings.
 */
export const ORBI_IDLE_MS = 8000
export const ORBI_DANCE_MS = 2200
export const ORBI_WAVE_MS = 1800
export const ORBI_RUN_MS = 900

export function isOrbiStage(value: string | null | undefined): value is OrbiStage {
  return !!value && (ORBI_STAGES as readonly string[]).includes(value)
}

export function isOrbiMotion(value: string | null | undefined): value is OrbiMotion {
  return !!value && (ORBI_MOTIONS as readonly string[]).includes(value)
}

/** Tap plays a wave. */
export function poseForTap(): OrbiMotion {
  return 'winken'
}

/** After a quiet idle, Orbi dances once, then returns to idle. */
export function poseAfterIdle(): OrbiMotion {
  return 'tanzen'
}

/** Loading and busy use the work pose. */
export function poseForBusy(): OrbiMotion {
  return 'arbeiten'
}

/** A navigation change plays a short run. */
export function poseForNav(): OrbiMotion {
  return 'rennen'
}

let navRunUntil = 0

/** Mark a navigation so the next mounted Orbi can play a brief run. */
export function cueOrbiNavRun(now = Date.now(), ms = ORBI_RUN_MS) {
  navRunUntil = now + ms
}

export function orbiNavRunRemaining(now = Date.now()) {
  return Math.max(0, navRunUntil - now)
}

/** Which frame to show. Reduced motion is always the still idle PNG. */
export function resolveOrbiPose(opts: {
  reduced?: boolean
  pinned?: OrbiMotion | null
  motion?: OrbiMotion | null
  busy?: boolean
  live: OrbiMotion
}): OrbiMotion {
  if (opts.reduced) return 'idle'
  if (opts.pinned) return opts.pinned
  if (opts.motion) return opts.motion
  if (opts.busy) return poseForBusy()
  return opts.live
}
