import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { I18nProvider } from '../../lib/i18n'
import { ShareActions } from './ShareActions'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

afterEach(() => {
  vi.unstubAllGlobals()
})

async function render() {
  const host = document.createElement('div')
  document.body.replaceChildren(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(
      createElement(
        I18nProvider,
        null,
        createElement(ShareActions, {
          title: 'Orbit',
          text: 'Orbit weiterempfehlen',
          url: 'https://orbit.invalid/r',
        }),
      ),
    )
  })
  return {
    host,
    async unmount() {
      await act(async () => root.unmount())
    },
  }
}

describe('ShareActions', () => {
  it('copies the link without navigator.share and shows the toast plus WhatsApp', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    const view = await render()
    const button = [...view.host.querySelectorAll('button')].find((el) => el.textContent?.includes('Teilen'))
    expect(button).toBeTruthy()
    expect(button!.className).toContain('min-h-11')
    const wa = view.host.querySelector('a')
    expect(wa?.getAttribute('href')).toBe(
      'https://wa.me/?text=Orbit%20weiterempfehlen%20https%3A%2F%2Forbit.invalid%2Fr',
    )
    expect(wa?.getAttribute('target')).toBe('_blank')
    expect(wa?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(wa?.textContent).toContain('Per WhatsApp teilen')
    await act(async () => {
      button!.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(writeText).toHaveBeenCalledWith('https://orbit.invalid/r')
    expect(view.host.textContent).toContain('Link kopiert')
    await view.unmount()
  })

  it('shows a manual copy field when the clipboard fails', async () => {
    vi.stubGlobal('navigator', {
      clipboard: { writeText: vi.fn().mockRejectedValue(new Error('denied')) },
    })
    const view = await render()
    const button = view.host.querySelector('button')!
    await act(async () => {
      button.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    const field = view.host.querySelector('input')
    expect(field?.value).toBe('https://orbit.invalid/r')
    expect(view.host.textContent).toContain('Link zum Kopieren')
    expect(view.host.textContent).not.toContain('Link kopiert')
    await view.unmount()
  })
})
