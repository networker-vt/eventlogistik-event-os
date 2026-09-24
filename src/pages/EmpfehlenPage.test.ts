import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { __setFlagForTests } from '../lib/flags'
import { I18nProvider } from '../lib/i18n'
import { EmpfehlenPage } from './EmpfehlenPage'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

afterEach(() => {
  __setFlagForTests(null)
  vi.unstubAllGlobals()
})

describe('EmpfehlenPage', () => {
  it('recommends Orbit without a reward and shares when navigator.share is missing', async () => {
    __setFlagForTests('credits', false)
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const host = document.createElement('div')
    document.body.replaceChildren(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(createElement(I18nProvider, null, createElement(EmpfehlenPage)))
    })
    expect(host.querySelector('h1')?.textContent).toContain('Orbit weiterempfehlen')
    expect(host.textContent).toContain('keine Belohnung')
    expect(host.textContent).not.toContain('Rewards-Pool')
    const button = [...host.querySelectorAll('button')].find((el) => el.textContent?.includes('Teilen'))
    expect(button).toBeTruthy()
    await act(async () => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(writeText).toHaveBeenCalled()
    expect(host.textContent).toContain('Link kopiert')
    expect(host.querySelector('a')?.getAttribute('href')).toContain('https://wa.me/?text=')
    await act(async () => root.unmount())
  })
})
