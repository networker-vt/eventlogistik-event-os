const INTRO_KEY = 'orbit_orbi_intro_v1'
const TOUR_KEY = 'orbit_orbi_tour_off_v1'

function readFlag(key: string): boolean {
  try {
    return localStorage.getItem(key) === '1'
  } catch {
    return false
  }
}

function writeFlag(key: string) {
  try {
    localStorage.setItem(key, '1')
  } catch {
    /* private mode */
  }
}

export function orbiIntroSeen(): boolean {
  return readFlag(INTRO_KEY)
}

export function markOrbiIntroSeen() {
  writeFlag(INTRO_KEY)
}

export function orbiTourOff(): boolean {
  return readFlag(TOUR_KEY)
}

export function dismissOrbiTour() {
  writeFlag(TOUR_KEY)
}
