/**
 * Orbit Credits rewards — fair, once-per-action, demo ledger.
 * Welcome / referral / contributions / search / completed jobs.
 */
import { earnCredits, getCredits } from './credits'
import { getPrefs } from './prefs'

const KEY = 'orbit_rewards_flags_v1'
const EVT = 'orbit-rewards-changed'

export interface RewardFlags {
  welcome: boolean
  signup: boolean
  prefs: boolean
  profileComplete: boolean
  ideas: number
  reviews: number
  searchDays: string[]
  completedJobs: string[]
}

function defaultFlags(): RewardFlags {
  return {
    welcome: false,
    signup: false,
    prefs: false,
    profileComplete: false,
    ideas: 0,
    reviews: 0,
    searchDays: [],
    completedJobs: [],
  }
}

function load(): RewardFlags {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultFlags()
    return { ...defaultFlags(), ...(JSON.parse(raw) as RewardFlags) }
  } catch {
    return defaultFlags()
  }
}

let cache: RewardFlags | null = null
function get(): RewardFlags {
  if (!cache) cache = load()
  return cache
}
function commit(next: RewardFlags) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeRewards(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getRewardFlags(): RewardFlags {
  return structuredClone(get())
}

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

/** Call once on app boot. Grants welcome bonus on first open. */
export function initRewards() {
  const flags = structuredClone(get())
  if (flags.welcome) return flags
  const already = getCredits().txs.some((t) => /willkommen|welcome/i.test(t.label))
  if (!already) {
    earnCredits(50, 'Willkommensbonus — erster Besuch (Demo)')
  }
  flags.welcome = true
  commit(flags)
  return flags
}

export function grantWelcomeOnSignup() {
  const flags = structuredClone(get())
  if (flags.signup) return
  flags.signup = true
  if (!flags.welcome) {
    earnCredits(50, 'Willkommensbonus — Registrierung (Demo)')
    flags.welcome = true
  } else {
    earnCredits(15, 'Signup-Bonus (Demo)')
  }
  commit(flags)
}

export function maybeGrantPrefsComplete() {
  const flags = structuredClone(get())
  if (flags.prefs) return
  if (!getPrefs().completed) return
  earnCredits(20, 'Prefs vollständig (Demo)')
  flags.prefs = true
  commit(flags)
}

export function maybeGrantProfileComplete() {
  const flags = structuredClone(get())
  if (flags.profileComplete) return
  try {
    const raw = localStorage.getItem('orbit_profile_hub_v1')
    const hub = raw ? (JSON.parse(raw) as { skills?: unknown[]; docs?: unknown[] }) : {}
    const prefs = getPrefs()
    const ok =
      prefs.completed &&
      (hub.skills?.length ?? 0) >= 3 &&
      (hub.docs?.length ?? 0) >= 1 &&
      prefs.seeker.radiusKm > 0
    if (!ok) return
    earnCredits(30, 'Profil weitgehend vollständig (Demo)')
    flags.profileComplete = true
    commit(flags)
  } catch {
    /* ignore */
  }
}

export function grantIdeaReward() {
  const flags = structuredClone(get())
  if (flags.ideas >= 3) return null
  flags.ideas += 1
  commit(flags)
  return earnCredits(8, `Feedback / Ideen-Box (${flags.ideas}/3, Demo)`)
}

export function grantReviewReward() {
  const flags = structuredClone(get())
  if (flags.reviews >= 5) return null
  flags.reviews += 1
  commit(flags)
  return earnCredits(10, `Erfahrungs-Review (${flags.reviews}/5, Demo)`)
}

/** Small daily bonus for actually searching / swiping — capped, not spammy. */
export function grantSearchActivity() {
  const flags = structuredClone(get())
  const day = todayKey()
  if (flags.searchDays.includes(day)) return null
  if (flags.searchDays.length >= 7) return null
  flags.searchDays = [...flags.searchDays, day].slice(-14)
  commit(flags)
  return earnCredits(5, 'Aktive Suche / Match (Tagesbonus, Demo)')
}

export function grantJobCompleted(bookingId: string) {
  const flags = structuredClone(get())
  if (flags.completedJobs.includes(bookingId)) return null
  if (flags.completedJobs.length >= 5) return null
  flags.completedJobs.push(bookingId)
  commit(flags)
  return earnCredits(25, 'Job abgeschlossen (Demo)')
}

export const REWARD_RULES_DE = [
  'Willkommen: 50 Credits beim ersten Öffnen — einmalig, kein Opt-in-Spam.',
  'Prefs + Profil (Skills, Radius, mind. 1 Nachweis): einmalige Boni, keine Wiederholung.',
  'Empfehlen: der Teil-Link ist der eigentliche Bonus — Credits für echte Signups, nicht fürs Leerspammen.',
  'Ideen-Box und Reviews: kleine Credits, gedeckelt (3 / 5), nur für sinnvollen Beitrag.',
  'Suche/Match: 5 Credits pro Tag, max. 7 Tage — belohnt Nutzen, nicht Endlos-Swipe.',
  'Job abschließen: 25 Credits, max. 5 — fair gegenüber der Gegenseite.',
  'Alles Demo-Ledger in Orbit Credits. Kein Auszahlungsanspruch bis Payments + KYC live sind.',
]

export const REWARD_RULES_EN = [
  'Welcome: 50 credits on first open — once, no opt-in spam.',
  'Prefs + profile (skills, radius, at least one document): one-time bonuses.',
  'Referral: the share link is the reward — credits for real signups, not empty spam.',
  'Ideas box and reviews: small credits, capped (3 / 5), for useful contributions.',
  'Search/Match: 5 credits per day, max 7 days — rewards use, not infinite swiping.',
  'Finish a job: 25 credits, max 5 — fair to both sides.',
  'All of this is a demo ledger in Orbit Credits. No payout until payments + KYC are live.',
]
