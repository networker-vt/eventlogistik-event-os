import { createElement } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../lib/i18n'
import { ListingContact } from './ListingContact'

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

const privateListing = {
  sellerKind: 'private' as const,
  city: 'Hamburg',
  venue: 'Elbphilharmonie',
}

describe('ListingContact', () => {
  it('renders no mail, tel, or WhatsApp buttons for a private listing without opt-in', async () => {
    const view = await render(
      createElement(ListingContact, {
        listing: privateListing,
        canMessage: true,
      }),
    )
    expect(view.host.querySelector('a[href^="mailto:"]')).toBeNull()
    expect(view.host.querySelector('a[href^="tel:"]')).toBeNull()
    expect(view.host.querySelector('a[href*="wa.me/"]')).toBeNull()
    const message = view.host.querySelector('a[href="#listing-inquiry"]')
    expect(message?.textContent).toContain('Nachricht senden')
    expect(message?.className).toContain('min-h-11')
    await view.unmount()
  })

  it('renders mail, tel, and WhatsApp after the listing opts in', async () => {
    const view = await render(
      createElement(ListingContact, {
        listing: {
          ...privateListing,
          showContact: true,
          publicContact: { email: 'alex@example.invalid', phone: '0171 1234567' },
        },
        canMessage: true,
      }),
    )
    const hrefs = [...view.host.querySelectorAll('a')].map((anchor) => anchor.getAttribute('href'))
    expect(hrefs).toContain('mailto:alex@example.invalid')
    expect(hrefs).toContain('tel:+491711234567')
    expect(hrefs).toContain('https://wa.me/491711234567')
    expect(view.host.querySelector('a[href="#listing-inquiry"]')).toBeNull()
    await view.unmount()
  })

  it('shows an honest hint when contact is off and no message path exists', async () => {
    const view = await render(
      createElement(ListingContact, { listing: privateListing, canMessage: false }),
    )
    expect(view.host.querySelector('a')).toBeNull()
    expect(view.host.textContent).toContain('Kontakt ist nicht öffentlich')
    expect(view.host.textContent).toContain('nicht möglich')
    await view.unmount()
  })
})
