import { describe, expect, it } from 'vitest'
import {
  ROBOT_ASK_POOL,
  isKabineAsk,
  pickAdaptiveRobotAsk,
  pickRobotAsk,
  robotAskCopy,
  robotAskPoolForSlot,
} from './robotAsk'

describe('Robot tap — one time-of-day question', () => {
  it('never exposes a five-equal-question menu; each adult slot has a small pool', () => {
    expect(robotAskPoolForSlot('morgen').length).toBe(1)
    expect(robotAskPoolForSlot('tag').length).toBe(2)
    expect(robotAskPoolForSlot('abend').length).toBe(2)
    expect(ROBOT_ASK_POOL.filter((q) => q.area === 'campus')).toHaveLength(0)
  })

  it('routes Kids robot questions into Treffer, not Campus / Kabine / Abflug', () => {
    const morning = pickRobotAsk(new Date('2026-09-17T07:30:00+02:00'), { kids: true })
    expect(morning.item.kind).toBe('job')
    expect(morning.item.to).toBe('/treffer')
    const day = pickRobotAsk(new Date('2026-09-17T13:00:00+02:00'), { kids: true })
    expect(day.item.area).toBe('treffer')
    expect(day.item.to).not.toBe('/campus')
    const evening = pickRobotAsk(new Date('2026-09-17T19:40:00+02:00'), { kids: true })
    expect(evening.item.to).not.toBe('/campus')
    expect(isKabineAsk(evening.item)).toBe(false)
  })

  it('picks exactly one question for a given instant', () => {
    const morning = pickRobotAsk(new Date('2026-09-17T07:30:00+02:00'))
    expect(morning.slot).toBe('morgen')
    expect(morning.item.kind).toBe('job')
    expect(morning.item.area).toBe('treffer')
    expect(morning.item.to).toBe('/treffer')
    const copy = robotAskCopy(morning.item, 'de')
    expect(copy.question).toMatch(/Job/)
    expect(copy.yes).toMatch(/Treffer/)
  })

  it('routes Tag questions to Abflug or Crew, not Kabine', () => {
    const day = pickRobotAsk(new Date('2026-09-17T13:00:00+02:00'))
    expect(day.slot).toBe('tag')
    expect(['abflug', 'crew']).toContain(day.item.area)
    expect(isKabineAsk(day.item)).toBe(false)
  })

  it('routes Abend questions into Kabine (Frisur or Schuhe) only', () => {
    const evening = pickRobotAsk(new Date('2026-09-17T19:40:00+02:00'))
    expect(evening.slot).toBe('abend')
    expect(isKabineAsk(evening.item)).toBe(true)
    expect(evening.item.to.startsWith('/kabine')).toBe(true)
    expect(['frisur', 'schuhe']).toContain(evening.item.kind)
  })

  it('keeps Kabine entry off Home product rails — only frisur/schuhe asks', () => {
    const kabine = ROBOT_ASK_POOL.filter(isKabineAsk)
    expect(kabine.every((q) => q.kind === 'frisur' || q.kind === 'schuhe')).toBe(true)
    expect(ROBOT_ASK_POOL.filter((q) => q.slot !== 'abend').every((q) => !isKabineAsk(q))).toBe(true)
  })

  it('is stable for the same Berlin day+slot', () => {
    const a = pickRobotAsk(new Date('2026-09-17T18:10:00+02:00'))
    const b = pickRobotAsk(new Date('2026-09-17T20:55:00+02:00'))
    expect(a.item.id).toBe(b.item.id)
  })
})

describe('Adaptive Orbi prompt', () => {
  it('asks exactly one question from prefs instead of a menu', () => {
    const travel = pickAdaptiveRobotAsk({
      interests: ['travel', 'jobs', 'kabine'],
      now: new Date('2026-09-17T07:30:00+02:00'),
    })
    expect(travel.via).toBe('interest')
    expect(travel.item.area).toBe('abflug')
    expect(travel.item.to).toBe('/abflug')
  })

  it('lets recent usage override a stale job interest', () => {
    const next = pickAdaptiveRobotAsk({
      interests: ['jobs'],
      recentText: 'Flug nach Rom am Freitag',
    })
    expect(next.via).toBe('usage')
    expect(next.item.kind).toBe('reise')
  })

  it('keeps kids on an age-safe Treffer prompt', () => {
    const kid = pickAdaptiveRobotAsk({
      kids: true,
      interests: ['travel', 'social', 'learning'],
      recentText: 'Freunde treffen und nach Paris fliegen',
      now: new Date('2026-09-17T13:00:00+02:00'),
    })
    expect(kid.via).toBe('time')
    expect(kid.item.to).toBe('/treffer')
    expect(kid.item.area).not.toBe('campus')
    expect(isKabineAsk(kid.item)).toBe(false)
  })

  it('falls back to the time-of-day question when nothing is known', () => {
    const morning = pickAdaptiveRobotAsk({ now: new Date('2026-09-17T07:30:00+02:00') })
    expect(morning.via).toBe('time')
    expect(morning.item.kind).toBe('job')
  })
})
