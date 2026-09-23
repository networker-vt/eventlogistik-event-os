import { beforeEach, describe, expect, it } from 'vitest'
import { tStatic } from './i18n'
import { splitAdaptiveHome } from './hubTiles'
import { recordWidgetTap, recordWidgetVisit, resetWidgetTaps, widgetIdForPath } from './widgetUsage'

const adult = { kids: false, hideTravel: false, hideWallet: false }
const kids = { kids: true, hideTravel: true, hideWallet: true }
const t = (key: string) => tStatic(key, 'de')

describe('Home widget usage', () => {
  beforeEach(() => {
    localStorage.clear()
    sessionStorage.clear()
    resetWidgetTaps()
  })

  it('maps marketplace routes and treats Treffer as jobs', () => {
    expect(widgetIdForPath('/abflug')).toBe('abflug')
    expect(widgetIdForPath('/kabine')).toBe('kabine')
    expect(widgetIdForPath('/match')).toBe('match')
    expect(widgetIdForPath('/jobs/compare/1')).toBe('jobs')
    expect(widgetIdForPath('/treffer')).toBe('jobs')
    expect(widgetIdForPath('/')).toBeNull()
  })

  it('starts with a marketplace-wide set and folds unused jobs', () => {
    const { primary, folded } = splitAdaptiveHome(adult, {}, t)
    expect(primary.map((tile) => tile.id)).toEqual(['abflug', 'kabine', 'match'])
    expect(folded.map((tile) => tile.id)).toEqual([
      'campus',
      'entdecker',
      'firma',
      'crew',
      'marktplatz',
      'jobs',
    ])
    expect(primary).toHaveLength(3)
  })

  it('raises a tapped area and keeps untouched jobs folded', () => {
    recordWidgetVisit('/kabine')
    recordWidgetVisit('/abflug')
    recordWidgetVisit('/kabine')
    const { primary, folded } = splitAdaptiveHome(adult, undefined, t)
    expect(primary.map((tile) => tile.id)).toEqual(['kabine', 'abflug', 'match'])
    expect(folded.map((tile) => tile.id)).toContain('jobs')
    expect(primary.some((tile) => tile.id === 'jobs')).toBe(false)
  })

  it('promotes jobs only after they are opened', () => {
    for (let i = 0; i < 6; i += 1) recordWidgetTap('jobs')
    const { primary } = splitAdaptiveHome(adult, undefined, t)
    expect(primary[0]?.id).toBe('jobs')
  })

  it('hides travel, firma, and crew for kids and still folds jobs', () => {
    const { primary, folded } = splitAdaptiveHome(kids, {}, t)
    const ids = [...primary, ...folded].map((tile) => tile.id)
    expect(ids).not.toContain('abflug')
    expect(ids).not.toContain('firma')
    expect(ids).not.toContain('crew')
    expect(ids).not.toContain('jobs')
    expect(primary.map((tile) => tile.id)).toEqual(['kabine', 'match', 'campus'])
    expect(folded.map((tile) => tile.id)).toEqual(['entdecker', 'marktplatz'])
  })
})
