/** Living Orbi poses. German names match the Kind companion brief. */
export const ORBI_MOTIONS = ['idle', 'winken', 'tanzen', 'arbeiten', 'rennen'] as const

export type OrbiMotion = (typeof ORBI_MOTIONS)[number]

/** Discrete tour after idle — wave, dance, work, run. */
export const ORBI_TOUR: readonly OrbiMotion[] = ['winken', 'tanzen', 'arbeiten', 'rennen']

export function isOrbiMotion(value: string | null | undefined): value is OrbiMotion {
  return !!value && (ORBI_MOTIONS as readonly string[]).includes(value)
}

export function nextOrbiTour(current: OrbiMotion): OrbiMotion {
  const at = ORBI_TOUR.indexOf(current as (typeof ORBI_TOUR)[number])
  const next = at < 0 ? 0 : (at + 1) % ORBI_TOUR.length
  return ORBI_TOUR[next]
}
