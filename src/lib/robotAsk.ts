/**
 * Robot tap — exactly ONE time-of-day question (not a menu of five).
 * Answering routes into Treffer / Abflug / Crew / Kabine.
 * Kabine only from Frisur or Schuhe questions (or Tageskarte), never a second Home product.
 * Discovery questions are free — no Assist credit consume.
 */
import { berlinOrLocalClock, slotFromHour, type DaySlot } from './tageskarte'

export type RobotAskKind = 'reise' | 'job' | 'frisur' | 'mitarbeiter' | 'schuhe' | 'lernen'

export type RobotAskArea = 'treffer' | 'abflug' | 'crew' | 'kabine' | 'campus'

export interface RobotAsk {
  id: string
  slot: DaySlot
  kind: RobotAskKind
  area: RobotAskArea
  questionDe: string
  questionEn: string
  yesDe: string
  yesEn: string
  to: string
}

export const ROBOT_ASK_POOL: RobotAsk[] = [
  {
    id: 'mo-job',
    slot: 'morgen',
    kind: 'job',
    area: 'treffer',
    questionDe: 'Job für den Vormittag?',
    questionEn: 'A job for this morning?',
    yesDe: 'Zu Treffer',
    yesEn: 'Open Treffer',
    to: '/treffer',
  },
  {
    id: 'tg-reise',
    slot: 'tag',
    kind: 'reise',
    area: 'abflug',
    questionDe: 'Reise im Kopf — wohin?',
    questionEn: 'Travel on your mind — where to?',
    yesDe: 'Zu Abflug',
    yesEn: 'Open Abflug',
    to: '/abflug',
  },
  {
    id: 'tg-crew',
    slot: 'tag',
    kind: 'mitarbeiter',
    area: 'crew',
    questionDe: 'Mitarbeiter oder Partner suchen?',
    questionEn: 'Looking for crew or partners?',
    yesDe: 'Zu Crew',
    yesEn: 'Open Crew',
    to: '/crew',
  },
  {
    id: 'ab-frisur',
    slot: 'abend',
    kind: 'frisur',
    area: 'kabine',
    questionDe: 'Neue Frisur heute Abend?',
    questionEn: 'New haircut tonight?',
    yesDe: 'Zur Kabine',
    yesEn: 'Open Kabine',
    to: '/kabine?intent=frisur',
  },
  {
    id: 'ab-schuhe',
    slot: 'abend',
    kind: 'schuhe',
    area: 'kabine',
    questionDe: 'Neue Schuhe anprobieren?',
    questionEn: 'Try on new shoes?',
    yesDe: 'Zur Kabine',
    yesEn: 'Open Kabine',
    to: '/kabine?intent=schuhe',
  },
  {
    id: 'tg-job-kids',
    slot: 'tag',
    kind: 'job',
    area: 'treffer',
    questionDe: 'Ein altersgerechter Mini-Job für heute?',
    questionEn: 'An age-safe mini-job for today?',
    yesDe: 'Zu Treffer',
    yesEn: 'Open Treffer',
    to: '/treffer',
  },
  {
    id: 'ab-job-kids',
    slot: 'abend',
    kind: 'job',
    area: 'treffer',
    questionDe: 'Noch ein Mini-Job am Abend?',
    questionEn: 'A mini-job this evening?',
    yesDe: 'Zu Treffer',
    yesEn: 'Open Treffer',
    to: '/treffer',
  },
]

const SLOT_KINDS: Record<DaySlot, RobotAskKind[]> = {
  morgen: ['job'],
  tag: ['reise', 'mitarbeiter'],
  abend: ['frisur', 'schuhe'],
}

const KIDS_SLOT_KINDS: Record<DaySlot, RobotAskKind[]> = {
  morgen: ['job'],
  tag: ['job'],
  abend: ['job'],
}

export function robotAskSeed(dateKey: string, slot: DaySlot): number {
  const s = `orbit-robot-ask-v1:${dateKey}:${slot}`
  let h = 2166136261
  for (let i = 0; i < s.length; i += 1) {
    h ^= s.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

export function robotAskPoolForSlot(slot: DaySlot, kids = false): RobotAsk[] {
  const allowed = new Set(kids ? KIDS_SLOT_KINDS[slot] : SLOT_KINDS[slot])
  return ROBOT_ASK_POOL.filter((item) => item.slot === slot && allowed.has(item.kind))
}

export function pickRobotAsk(
  now = new Date(),
  opts?: { kids?: boolean },
): {
  item: RobotAsk
  slot: DaySlot
  dateKey: string
  hour: number
} {
  const clock = berlinOrLocalClock(now)
  const slot = slotFromHour(clock.hour)
  const pool = robotAskPoolForSlot(slot, opts?.kids)
  const seed = robotAskSeed(clock.dateKey, slot)
  const item = pool.length ? pool[seed % pool.length] : ROBOT_ASK_POOL[0]
  return { item, slot, dateKey: clock.dateKey, hour: clock.hour }
}

export function robotAskCopy(item: RobotAsk, locale: 'de' | 'en') {
  return locale === 'de'
    ? { question: item.questionDe, yes: item.yesDe }
    : { question: item.questionEn, yes: item.yesEn }
}

export function isKabineAsk(item: RobotAsk) {
  return item.area === 'kabine'
}
