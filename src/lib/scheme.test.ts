import { afterEach, describe, expect, it } from 'vitest'
import { LIGHT_CANVAS, getScheme, setScheme } from './scheme'

describe('color scheme', () => {
  afterEach(() => {
    localStorage.removeItem('orbit_scheme_v1')
    document.documentElement.removeAttribute('data-scheme')
  })

  it('defaults to light parchment so the app feels finished', () => {
    expect(getScheme()).toBe('light')
    expect(LIGHT_CANVAS).toBe('#faf8f5')
  })

  it('persists an optional dark toggle', () => {
    setScheme('dark')
    expect(getScheme()).toBe('dark')
    expect(document.documentElement.dataset.scheme).toBe('dark')
    setScheme('light')
    expect(getScheme()).toBe('light')
    expect(document.documentElement.dataset.scheme).toBe('light')
  })
})
