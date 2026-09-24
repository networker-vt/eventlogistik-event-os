import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it } from 'vitest'
import { AuthPage } from './AuthPage'
import { AuthProvider } from '../lib/auth'
import { I18nProvider } from '../lib/i18n'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

describe('registration age gate', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('keeps submit disabled until the 18+ box is checked and links the terms', async () => {
    const host = document.createElement('div')
    document.body.replaceChildren(host)
    const root = createRoot(host)
    await act(async () => {
      root.render(
        createElement(
          MemoryRouter,
          null,
          createElement(I18nProvider, null, createElement(AuthProvider, null, createElement(AuthPage))),
        ),
      )
    })
    expect(host.textContent).toContain('AGB')
    expect(host.textContent).toContain('Datenschutzerklärung')
    expect(host.querySelector('a[href="/agb"]')).toBeTruthy()
    expect(host.querySelector('a[href="/privacy"]')).toBeTruthy()
    const demo = () =>
      [...host.querySelectorAll('button')].find((button) => button.textContent?.includes('Demo als Agentur'))
    expect(demo()?.disabled).toBe(true)
    const box = host.querySelector('input[type="checkbox"]') as HTMLInputElement
    expect(box).toBeTruthy()
    await act(async () => {
      box.click()
    })
    expect(demo()?.disabled).toBe(false)
    await act(async () => {
      root.unmount()
    })
  })
})
