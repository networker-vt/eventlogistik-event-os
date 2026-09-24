import { afterEach, describe, expect, it, vi } from 'vitest'
import { absoluteUrl, shareOrCopy, whatsappShareHref } from './share'

afterEach(() => {
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('shareOrCopy', () => {
  it('uses navigator.share when it exists', async () => {
    const share = vi.fn().mockResolvedValue(undefined)
    const writeText = vi.fn()
    vi.stubGlobal('navigator', { share, clipboard: { writeText } })
    const result = await shareOrCopy({
      title: 'Orbit',
      text: 'Hallo',
      url: 'https://orbit.invalid/r',
    })
    expect(result).toEqual({ status: 'shared' })
    expect(share).toHaveBeenCalledWith({
      title: 'Orbit',
      text: 'Hallo',
      url: 'https://orbit.invalid/r',
    })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('does not copy when the person dismisses the share sheet', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('cancel'), { name: 'AbortError' }))
    const writeText = vi.fn()
    vi.stubGlobal('navigator', { share, clipboard: { writeText } })
    const result = await shareOrCopy({ title: 'Orbit', url: 'https://orbit.invalid/r' })
    expect(result).toEqual({ status: 'aborted' })
    expect(writeText).not.toHaveBeenCalled()
  })

  it('copies the link and reports that when share is missing', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const result = await shareOrCopy({ title: 'Orbit', text: 'Hallo', url: 'https://orbit.invalid/r' })
    expect(result).toEqual({ status: 'copied' })
    expect(writeText).toHaveBeenCalledWith('https://orbit.invalid/r')
  })

  it('falls back to copying when share fails for another reason', async () => {
    const share = vi.fn().mockRejectedValue(Object.assign(new Error('nope'), { name: 'NotAllowedError' }))
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { share, clipboard: { writeText } })
    const result = await shareOrCopy({ title: 'Orbit', url: 'https://orbit.invalid/r' })
    expect(result).toEqual({ status: 'copied' })
  })

  it('returns the URL for a manual field when copying fails', async () => {
    const writeText = vi.fn().mockRejectedValue(new Error('denied'))
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const result = await shareOrCopy({ title: 'Orbit', url: 'https://orbit.invalid/r' })
    expect(result).toEqual({ status: 'manual', url: 'https://orbit.invalid/r' })
  })

  it('returns a manual field when there is no clipboard', async () => {
    vi.stubGlobal('navigator', {})
    const result = await shareOrCopy({ title: 'Orbit', url: 'https://orbit.invalid/r' })
    expect(result).toEqual({ status: 'manual', url: 'https://orbit.invalid/r' })
  })
})

describe('whatsappShareHref', () => {
  it('builds a wa.me text link from the message and the URL', () => {
    expect(whatsappShareHref({ text: 'Orbit', url: 'https://orbit.invalid/r' })).toBe(
      'https://wa.me/?text=Orbit%20https%3A%2F%2Forbit.invalid%2Fr',
    )
  })
})

describe('absoluteUrl', () => {
  it('prefixes in-app paths with origin and the configured base', () => {
    const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
    expect(absoluteUrl('/listings/1')).toBe(`${window.location.origin}${base}/listings/1`)
    expect(absoluteUrl('https://orbit.invalid/already')).toBe('https://orbit.invalid/already')
  })
})
