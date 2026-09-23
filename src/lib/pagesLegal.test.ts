import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { DatenschutzPage } from '../pages/legal/DatenschutzPage'
import { ImpressumPage } from '../pages/legal/ImpressumPage'
import { SupportPage } from '../pages/legal/SupportPage'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function legalRoutes(initialPath: string) {
  return createElement(
    MemoryRouter,
    { initialEntries: [initialPath] },
    createElement(
      Routes,
      null,
      createElement(Route, { path: 'impressum', element: createElement(ImpressumPage) }),
      createElement(Route, { path: 'datenschutz', element: createElement(DatenschutzPage) }),
      createElement(Route, { path: 'privacy', element: createElement(DatenschutzPage) }),
      createElement(Route, { path: 'support', element: createElement(SupportPage) }),
      createElement(Route, { path: '*', element: createElement('p', null, 'missing-legal-route') }),
    ),
  )
}

async function renderAt(path: string) {
  const host = document.createElement('div')
  document.body.replaceChildren(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(legalRoutes(path))
  })
  return {
    host,
    async unmount() {
      await act(async () => {
        root.unmount()
      })
    },
  }
}

async function clickLink(host: HTMLElement, href: string) {
  const link = host.querySelector<HTMLAnchorElement>(`a[href="${href}"]`)
  expect(link, `link ${href}`).toBeTruthy()
  await act(async () => {
    link!.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true, button: 0 }))
  })
}

describe('legal routes', () => {
  it('renders privacy, support, and impressum, including a trailing slash', async () => {
    const privacy = await renderAt('/privacy')
    expect(privacy.host.querySelector('h1')?.textContent).toBe('Datenschutz / Privacy')
    expect(privacy.host.textContent).toContain('Verantwortlicher')
    expect(privacy.host.textContent).not.toContain('missing-legal-route')
    await privacy.unmount()

    const privacySlash = await renderAt('/privacy/')
    expect(privacySlash.host.querySelector('h1')?.textContent).toBe('Datenschutz / Privacy')
    await privacySlash.unmount()

    const alias = await renderAt('/datenschutz/')
    expect(alias.host.querySelector('h1')?.textContent).toBe('Datenschutz / Privacy')
    await alias.unmount()

    const support = await renderAt('/support/')
    expect(support.host.querySelector('h1')?.textContent).toBe('Support')
    expect(support.host.textContent).toContain('mirco.kuessner@gmail.com')
    await support.unmount()

    const impressum = await renderAt('/impressum/')
    expect(impressum.host.querySelector('h1')?.textContent).toBe('Impressum')
    expect(impressum.host.textContent).toContain('Mirco Küßner')
    await impressum.unmount()
  })

  it('navigates in-app between impressum, privacy, and support', async () => {
    const view = await renderAt('/impressum')
    expect(view.host.querySelector('h1')?.textContent).toBe('Impressum')

    await clickLink(view.host, '/privacy')
    expect(view.host.querySelector('h1')?.textContent).toBe('Datenschutz / Privacy')

    await clickLink(view.host, '/support')
    expect(view.host.querySelector('h1')?.textContent).toBe('Support')

    await clickLink(view.host, '/impressum')
    expect(view.host.querySelector('h1')?.textContent).toBe('Impressum')
    await view.unmount()
  })
})
