import { kidsCreditsFrozen } from './kids'
import { grantIdeaReward, grantReviewReward, grantSearchActivity } from './rewards'

const KEY = 'orbit_heute_v1'
const EVT = 'orbit-heute-changed'

/** Quiet Mein card. Three actions, one visible daily cap. Kids stay at 0. */
export const HEUTE_DAILY_CAP = 20

export const HEUTE_ACTIONS = [
  { id: 'search', amount: 5, labelKey: 'mein.heuteSearch' },
  { id: 'idea', amount: 8, labelKey: 'mein.heuteIdea' },
  { id: 'review', amount: 10, labelKey: 'mein.heuteReview' },
] as const

export type HeuteActionId = (typeof HEUTE_ACTIONS)[number]['id']

type HeuteState = { day: string; earned: number; done: HeuteActionId[] }

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

function empty(): HeuteState {
  return { day: todayKey(), earned: 0, done: [] }
}

function load(): HeuteState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return empty()
    const parsed = JSON.parse(raw) as Partial<HeuteState>
    if (parsed.day !== todayKey()) return empty()
    return {
      day: todayKey(),
      earned: typeof parsed.earned === 'number' ? parsed.earned : 0,
      done: Array.isArray(parsed.done) ? (parsed.done.filter((id) => HEUTE_ACTIONS.some((a) => a.id === id)) as HeuteActionId[]) : [],
    }
  } catch {
    return empty()
  }
}

function commit(next: HeuteState) {
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeHeute(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function heuteStatus() {
  if (kidsCreditsFrozen()) return { earned: 0, cap: 0, done: [] as HeuteActionId[] }
  const state = load()
  return { earned: state.earned, cap: HEUTE_DAILY_CAP, done: state.done }
}

export async function claimHeute(id: HeuteActionId) {
  if (kidsCreditsFrozen()) return null
  const action = HEUTE_ACTIONS.find((item) => item.id === id)
  if (!action) return null
  const state = load()
  if (state.done.includes(id)) return null
  if (state.earned + action.amount > HEUTE_DAILY_CAP) return null
  const granted =
    id === 'search' ? await grantSearchActivity() : id === 'idea' ? await grantIdeaReward() : await grantReviewReward()
  if (!granted) return null
  commit({ day: todayKey(), earned: state.earned + action.amount, done: [...state.done, id] })
  return granted
}

export function __resetHeuteForTests() {
  localStorage.removeItem(KEY)
}
