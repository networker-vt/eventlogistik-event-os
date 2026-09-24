const KEY = 'orbit_adult_v1'

/** Stores the 18+ confirmation on this device. No server profile field. */
export function confirmAdult() {
  try {
    localStorage.setItem(KEY, new Date().toISOString())
  } catch {
    /* ignore */
  }
}

export function hasConfirmedAdult() {
  try {
    return Boolean(localStorage.getItem(KEY))
  } catch {
    return false
  }
}
