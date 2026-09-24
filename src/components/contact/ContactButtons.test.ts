import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../lib/i18n'
import { ContactButtons } from './ContactButtons'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

async function render(node: ReturnType<typeof createElement>) {
  const host = document.createElement('div')
  document.body.replaceChildren(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(createElement(I18nProvider, null, node))
  })
  return {
    host,
    async unmount() {
      await act(async () => root.unmount())
    },
  }
}

describe('ContactButtons', () => {
  it('shows only valid actions, with icon text and a safe external rel', async () => {
    const view = await render(
      createElement(ContactButtons, {
        phone: '0171 1234567',
        email: 'alex@example.invalid',
        address: 'Berlin',
        instagram: '@orbit',
        website: 'https://orbit.invalid',
      }),
    )
    const links = [...view.host.querySelectorAll('a')]
    const hrefs = links.map((a) => a.getAttribute('href'))
    expect(hrefs).toContain('https://wa.me/491711234567')
    expect(hrefs).toContain('tel:+491711234567')
    expect(hrefs).toContain('mailto:alex@example.invalid')
    expect(hrefs).toContain('https://www.google.com/maps/search/?api=1&query=Berlin')
    expect(hrefs).toContain('https://instagram.com/orbit')
    expect(hrefs).toContain('https://orbit.invalid/')
    expect(view.host.textContent).toContain('WhatsApp')
    expect(view.host.textContent).toContain('Anrufen')
    expect(view.host.textContent).toContain('E-Mail')
    expect(view.host.textContent).toContain('Route')
    expect(view.host.textContent).toContain('Instagram')
    expect(view.host.textContent).toContain('Website')
    for (const link of links) {
      expect(link.className).toContain('min-h-11')
      expect(link.className).toContain('min-w-11')
      expect(link.textContent?.trim().length).toBeGreaterThan(1)
      const href = link.getAttribute('href') || ''
      if (href.startsWith('https://')) {
        expect(link.getAttribute('target')).toBe('_blank')
        expect(link.getAttribute('rel')).toBe('noopener noreferrer')
      }
    }
    expect(view.host.textContent).not.toMatch(/ungültig/i)
    await view.unmount()
  })

  it('shows a visible hint for invalid data and skips empty fields', async () => {
    const view = await render(
      createElement(ContactButtons, {
        phone: 'abc',
        email: '',
        website: 'http://orbit.invalid',
      }),
    )
    expect(view.host.querySelector('a')).toBeNull()
    const hint = view.host.querySelector('[role="status"]')
    expect(hint?.className).toContain('text-warn')
    expect(hint?.className).not.toContain('text-amber-200')
    expect(view.host.textContent).toContain('Diese Telefonnummer ist ungültig.')
    expect(view.host.textContent).toContain('Dieser Link ist ungültig.')
    expect(view.host.textContent).not.toContain('E-Mail')
    await view.unmount()
  })

  it('never renders catalog phone numbers or emails', async () => {
    const view = await render(
      createElement(ContactButtons, {
        catalog: true,
        phone: '0171 1234567',
        email: 'firma@example.invalid',
        website: 'https://orbit.invalid/firma',
        address: 'Hamburg',
        links: [{ kind: 'instagram', input: '@secret' }],
      }),
    )
    const html = view.host.innerHTML
    expect(html).not.toContain('wa.me/49')
    expect(html).not.toContain('tel:')
    expect(html).not.toContain('mailto:')
    expect(html).not.toContain('0171')
    expect(html).not.toContain('firma@')
    expect(html).not.toContain('instagram.com')
    expect(html).toContain('https://orbit.invalid/firma')
    expect(html).toContain('query=Hamburg')
    await view.unmount()
  })

  it('renders saved profile links as real anchors', async () => {
    const view = await render(
      createElement(ContactButtons, {
        links: [
          { kind: 'tiktok', input: '@orbit' },
          { kind: 'website', input: 'notaurl' },
        ],
      }),
    )
    expect(view.host.querySelector('a')?.getAttribute('href')).toBe('https://www.tiktok.com/@orbit')
    expect(view.host.textContent).toContain('Dieser Link ist ungültig.')
    await view.unmount()
  })
})
