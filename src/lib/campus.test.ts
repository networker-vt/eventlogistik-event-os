import { afterEach, describe, expect, it } from 'vitest'
import {
  __resetCampusForTests,
  CAMPUS_CATALOG,
  CAMPUS_LEVELS,
  campusCopy,
  detectCampusIntent,
  filterCourses,
  getCourse,
  getCampusProgress,
  resumeCampus,
} from './campus'

describe('Orbit Campus', () => {
  afterEach(() => {
    __resetCampusForTests()
  })

  it('has the six product levels and a seed catalog', () => {
    expect(CAMPUS_LEVELS).toEqual([
      'grundschule',
      'weiterfuehrend',
      'ausbildung',
      'studium',
      'sprachen',
      'skills',
    ])
    expect(CAMPUS_CATALOG.length).toBeGreaterThanOrEqual(8)
    expect(CAMPUS_CATALOG.every((c) => CAMPUS_LEVELS.includes(c.level))).toBe(true)
    expect(CAMPUS_CATALOG.some((c) => c.premium)).toBe(true)
    expect(filterCourses('grundschule').every((c) => c.safeForKids)).toBe(true)
  })

  it('filters by level and kids-safe flag', () => {
    const kids = filterCourses('all', true)
    expect(kids.every((c) => c.safeForKids)).toBe(true)
    expect(filterCourses('studium', true)).toHaveLength(0)
    expect(filterCourses('sprachen').length).toBeGreaterThan(0)
  })

  it('stores Weiterlernen progress', () => {
    expect(getCampusProgress()).toBeNull()
    const next = resumeCampus('gs-lesen', 2)
    expect(next?.courseId).toBe('gs-lesen')
    expect(getCampusProgress()?.step).toBe(2)
    expect(getCourse('gs-lesen')?.titleDe).toMatch(/Lesen/)
    expect(campusCopy(getCourse('gs-lesen')!, 'en').title).toMatch(/Reading/)
  })

  it('detects lernen intents for Assist / robot', () => {
    expect(detectCampusIntent('Ich will heute auf dem Campus lernen')).toBe(true)
    expect(detectCampusIntent('billigster Flug nach Berlin')).toBe(false)
  })
})
