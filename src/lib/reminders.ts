/**
 * Opt-in reminders: max 1–2 / week, each with a 1-tap action.
 */
const KEY = 'orbit_reminders_v1'
const EVT = 'orbit-reminders-changed'

export const REMINDERS_PER_WEEK = 2

export interface ReminderItem {
  id: string
  title: string
  actionTo: string
  actionLabel: string
  createdAt: string
  consumedAt?: string
}

interface ReminderState {
  optIn: boolean
  weekKey: string
  sent: number
  items: ReminderItem[]
}

function weekKey(d = new Date()) {
  const utc = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()))
  const day = utc.getUTCDay() || 7
  utc.setUTCDate(utc.getUTCDate() + 4 - day)
  const yearStart = new Date(Date.UTC(utc.getUTCFullYear(), 0, 1))
  const week = Math.ceil(((utc.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${utc.getUTCFullYear()}-W${String(week).padStart(2, '0')}`
}

function defaultState(): ReminderState {
  return { optIn: false, weekKey: weekKey(), sent: 0, items: [] }
}

function load(): ReminderState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = { ...defaultState(), ...(JSON.parse(raw) as Partial<ReminderState>) }
    const wk = weekKey()
    if (parsed.weekKey !== wk) {
      parsed.weekKey = wk
      parsed.sent = 0
    }
    parsed.items = Array.isArray(parsed.items) ? parsed.items.slice(0, 20) : []
    return parsed
  } catch {
    return defaultState()
  }
}

let cache: ReminderState | null = null
function get(): ReminderState {
  if (!cache) cache = load()
  const wk = weekKey()
  if (cache.weekKey !== wk) {
    cache = { ...cache, weekKey: wk, sent: 0 }
    localStorage.setItem(KEY, JSON.stringify(cache))
  }
  return cache
}
function commit(next: ReminderState) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeReminders(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getReminders(): ReminderState {
  return structuredClone(get())
}

export function setReminderOptIn(on: boolean) {
  const next = structuredClone(get())
  next.optIn = on
  commit(next)
  return next
}

export function remainingReminderSlots(): number {
  const s = get()
  if (!s.optIn) return 0
  return Math.max(0, REMINDERS_PER_WEEK - s.sent)
}

/** Queue a reminder. Returns null when opted out or weekly cap reached. */
export function enqueueReminder(input: {
  id?: string
  title: string
  actionTo: string
  actionLabel: string
}): ReminderItem | null {
  const next = structuredClone(get())
  if (!next.optIn) return null
  if (next.sent >= REMINDERS_PER_WEEK) return null
  const id = input.id || `rm-${Date.now().toString(36)}`
  if (next.items.some((i) => i.id === id && !i.consumedAt)) return next.items.find((i) => i.id === id) || null
  const item: ReminderItem = {
    id,
    title: input.title.slice(0, 120),
    actionTo: input.actionTo,
    actionLabel: input.actionLabel.slice(0, 40),
    createdAt: new Date().toISOString(),
  }
  next.items.unshift(item)
  next.sent += 1
  commit(next)
  return item
}

export function dueReminders(): ReminderItem[] {
  return get().items.filter((i) => !i.consumedAt).slice(0, REMINDERS_PER_WEEK)
}

export function tapReminder(id: string): ReminderItem | null {
  const next = structuredClone(get())
  const item = next.items.find((i) => i.id === id)
  if (!item || item.consumedAt) return null
  item.consumedAt = new Date().toISOString()
  commit(next)
  return item
}

export function __resetRemindersForTests() {
  cache = null
  localStorage.removeItem(KEY)
}
