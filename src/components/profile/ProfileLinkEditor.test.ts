import { createElement, useState } from 'react'
import { act } from 'react'
import { createRoot } from 'react-dom/client'
import { describe, expect, it } from 'vitest'
import { I18nProvider } from '../../lib/i18n'
import { isFlagOn } from '../../lib/flags'
import type { ProfileLinkInput } from '../../types'
import { ProfileLinkEditor } from './ProfileLinkEditor'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

function Harness() {
  const [links, setLinks] = useState<ProfileLinkInput[]>([])
  return createElement(ProfileLinkEditor, { links, onChange: setLinks })
}

async function render() {
  const host = document.createElement('div')
  document.body.replaceChildren(host)
  const root = createRoot(host)
  await act(async () => {
    root.render(createElement(I18nProvider, null, createElement(Harness)))
  })
  return {
    host,
    async unmount() {
      await act(async () => root.unmount())
    },
  }
}

describe('ProfileLinkEditor', () => {
  it('keeps channels off and stores only the text the person typed', async () => {
    expect(isFlagOn('channels')).toBe(false)
    const view = await render()
    expect(view.host.textContent).toContain('Profil-Link hinzufügen')
    expect(view.host.textContent).toContain('Freiwillig')
    const select = view.host.querySelector('select')!
    const input = view.host.querySelector('input')!
    await act(async () => {
      select.value = 'instagram'
      select.dispatchEvent(new Event('change', { bubbles: true }))
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      setter?.call(input, '@orbit')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const add = [...view.host.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Profil-Link hinzufügen'),
    )!
    await act(async () => {
      add.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    const anchor = view.host.querySelector('a')
    expect(anchor?.getAttribute('href')).toBe('https://instagram.com/orbit')
    expect(anchor?.getAttribute('target')).toBe('_blank')
    expect(anchor?.getAttribute('rel')).toBe('noopener noreferrer')
    expect(anchor?.textContent).toContain('@orbit')
    expect(view.host.textContent).not.toContain('Netflix')
    await view.unmount()
  })

  it('shows a hint and does not add an invalid value', async () => {
    const view = await render()
    const input = view.host.querySelector('input')!
    await act(async () => {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set
      setter?.call(input, 'http://orbit.invalid')
      input.dispatchEvent(new Event('input', { bubbles: true }))
    })
    const add = [...view.host.querySelectorAll('button')].find((button) =>
      button.textContent?.includes('Profil-Link hinzufügen'),
    )!
    await act(async () => {
      add.dispatchEvent(new MouseEvent('click', { bubbles: true }))
    })
    expect(view.host.querySelector('a')).toBeNull()
    expect(view.host.textContent).toContain('kein gültiger Handle')
    await view.unmount()
  })
})
