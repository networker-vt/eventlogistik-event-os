/**
 * Last meaningful place — Home „Weitermachen“, no account required.
 */
const KEY = 'orbit_resume_v1'
const EVT = 'orbit-resume-changed'

const KEEP = [/^\/listings/, /^\/look/, /^\/kabine/, /^\/reise/, /^\/abflug/, /^\/match/, /^\/treffer/, /^\/crew/, /^\/social/, /^\/firma/, /^\/wallet#gift/, /^\/campus/]

export interface ResumePoint {
  path: string
  title: string
  at: string
}

function load(): ResumePoint | null {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as ResumePoint
    return p?.path ? p : null
  } catch {
    return null
  }
}

let cache: ResumePoint | null | undefined
function get(): ResumePoint | null {
  if (cache === undefined) cache = load()
  return cache
}

export function getResume(): ResumePoint | null {
  return get()
}

export function touchResume(path: string, title: string) {
  const ok = KEEP.some((re) => re.test(path))
  if (!ok) return
  const next: ResumePoint = { path, title: title.slice(0, 80), at: new Date().toISOString() }
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeResume(cb: () => void) {
  const h = () => {
    cache = undefined
    cb()
  }
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}
