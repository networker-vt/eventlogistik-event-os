/**
 * Orbit Credits rewards — fair, once-per-action, from the pre-allocated rewards pool.
 * Welcome / early-tester grants debit their own pools inside the 21M cap.
 */
import { earnCredits, getCredits, grantWelcomeAllocation } from './credits'
import { getPrefs } from './prefs'

const KEY = 'orbit_rewards_flags_v1'
const EVT = 'orbit-rewards-changed'

export interface RewardFlags {
  welcome: boolean
  signup: boolean
  prefs: boolean
  profileComplete: boolean
  successfulMatch: boolean
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
    successfulMatch: false,
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

function alreadyWelcomed(): boolean {
  return getCredits().txs.some((t) => t.type === 'welcome' || /early tester|willkommen/i.test(t.label))
}

/** Call once on app boot. Grants early-tester or later welcome from the 21M reserve. */
export async function initRewards() {
  const flags = structuredClone(get())
  if (flags.welcome || alreadyWelcomed()) {
    flags.welcome = true
    commit(flags)
    return flags
  }
  const granted = await grantWelcomeAllocation()
  if (granted) {
    flags.welcome = true
    commit(flags)
  }
  return flags
}

export async function grantWelcomeOnSignup() {
  const flags = structuredClone(get())
  if (flags.signup) return
  flags.signup = true
  if (!flags.welcome && !alreadyWelcomed()) {
    const granted = await grantWelcomeAllocation()
    if (granted) flags.welcome = true
  }
  commit(flags)
}

export async function maybeGrantPrefsComplete() {
  const flags = structuredClone(get())
  if (flags.prefs) return
  if (!getPrefs().completed) return
  if (!(await earnCredits(20, 'Prefs vollständig (Demo) — Rewards-Pool'))) return
  flags.prefs = true
  commit(flags)
}

export async function maybeGrantProfileComplete() {
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
    if (!(await earnCredits(30, 'Profil weitgehend vollständig (Demo) — Rewards-Pool'))) return
    flags.profileComplete = true
    commit(flags)
  } catch {
    /* ignore */
  }
}

export async function grantSuccessfulMatch() {
  const flags = structuredClone(get())
  if (flags.successfulMatch) return null
  const next = await earnCredits(15, 'Erfolgreiches Match (Demo) — Rewards-Pool')
  if (!next) return null
  flags.successfulMatch = true
  commit(flags)
  return next
}

export async function grantIdeaReward() {
  const flags = structuredClone(get())
  if (flags.ideas >= 3) return null
  const next = await earnCredits(8, `Feedback / Ideen-Box (${flags.ideas + 1}/3, Demo) — Rewards-Pool`)
  if (!next) return null
  flags.ideas += 1
  commit(flags)
  return next
}

export async function grantReviewReward() {
  const flags = structuredClone(get())
  if (flags.reviews >= 5) return null
  const next = await earnCredits(10, `Erfahrungs-Review (${flags.reviews + 1}/5, Demo) — Rewards-Pool`)
  if (!next) return null
  flags.reviews += 1
  commit(flags)
  return next
}

/** Small daily bonus for actually searching / swiping — capped, not spammy. */
export async function grantSearchActivity() {
  const flags = structuredClone(get())
  const day = todayKey()
  if (flags.searchDays.includes(day)) return null
  if (flags.searchDays.length >= 7) return null
  const next = await earnCredits(5, 'Aktive Suche / Match (Tagesbonus, Demo) — Rewards-Pool')
  if (!next) return null
  flags.searchDays = [...flags.searchDays, day].slice(-14)
  commit(flags)
  return next
}

export async function grantJobCompleted(bookingId: string) {
  const flags = structuredClone(get())
  if (flags.completedJobs.includes(bookingId)) return null
  if (flags.completedJobs.length >= 5) return null
  const next = await earnCredits(25, 'Job abgeschlossen (Demo) — Rewards-Pool')
  if (!next) return null
  flags.completedJobs.push(bookingId)
  commit(flags)
  return next
}

export const REWARD_RULES_DE = [
  'Early Testers (Signup 1–50): 2.000 Credits aus dem Early-Pool plus −20 % Boost für immer. Danach 200 Welcome (17.000 Plätze) — beides aus der 21M-Reserve, kein Extra-Mint.',
  'Prefs + Profil (Skills, Radius, mind. 1 Nachweis): einmalige Boni aus dem Rewards-Pool.',
  'Erstes erfolgreiches Match: 15 Credits, einmalig.',
  'Empfehlen: 40 Credits pro Demo-Signup aus dem Rewards-Pool — nicht fürs Leerspammen.',
  'Ideen-Box und Reviews: kleine Credits, gedeckelt (3 / 5).',
  'Suche/Match: 5 Credits pro Tag, max. 7 Tage.',
  'Job abschließen: 25 Credits, max. 5.',
  'Ist der Rewards-Pool leer, schlagen Grants fehl. Packs leer → nur noch P2P. Alles Demo-Ledger; echte 21M-Enforcement braucht später Server/Chain.',
]
