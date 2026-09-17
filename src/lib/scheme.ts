/**
 * Color scheme — light parchment is the product default (finished, not WIP).
 * Dark remains an optional toggle.
 */

export type ColorScheme = 'light' | 'dark'

const KEY = 'orbit_scheme_v1'
export const SCHEME_EVENT = 'orbit-scheme-changed'

export const LIGHT_CANVAS = '#faf8f5'
export const DARK_CANVAS = '#0a0a0a'

export function getScheme(): ColorScheme {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw === 'dark' || raw === 'light') return raw
  } catch {
    /* ignore */
  }
  return 'light'
}

export function applyScheme(scheme: ColorScheme) {
  if (typeof document === 'undefined') return
  document.documentElement.dataset.scheme = scheme
  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) meta.setAttribute('content', scheme === 'dark' ? DARK_CANVAS : LIGHT_CANVAS)
}

export function setScheme(scheme: ColorScheme) {
  try {
    localStorage.setItem(KEY, scheme)
  } catch {
    /* ignore */
  }
  applyScheme(scheme)
  window.dispatchEvent(new CustomEvent(SCHEME_EVENT))
}

export function toggleScheme() {
  setScheme(getScheme() === 'dark' ? 'light' : 'dark')
}

export function subscribeScheme(cb: () => void) {
  const h = () => cb()
  window.addEventListener(SCHEME_EVENT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(SCHEME_EVENT, h)
    window.removeEventListener('storage', h)
  }
}
