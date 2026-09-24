import { whatsappShareUrl } from './links'

export type SharePayload = {
  title: string
  text?: string
  url: string
}

export type ShareOutcome =
  | { status: 'shared' }
  | { status: 'copied' }
  | { status: 'aborted' }
  | { status: 'manual'; url: string }

function errorName(err: unknown): string {
  if (err && typeof err === 'object' && 'name' in err) return String((err as { name: unknown }).name)
  return ''
}

/**
 * Uses the system share sheet when the browser has one.
 * Otherwise copies the link. If copying fails, the caller shows the URL for manual copy.
 */
export async function shareOrCopy(input: SharePayload): Promise<ShareOutcome> {
  const url = input.url.trim()
  const nav = typeof navigator === 'undefined' ? undefined : navigator
  if (nav && typeof nav.share === 'function') {
    try {
      await nav.share({ title: input.title, text: input.text, url })
      return { status: 'shared' }
    } catch (err) {
      if (errorName(err) === 'AbortError') return { status: 'aborted' }
    }
  }
  try {
    if (url && nav?.clipboard && typeof nav.clipboard.writeText === 'function') {
      await nav.clipboard.writeText(url)
      return { status: 'copied' }
    }
  } catch {
    /* fall through to the manual field */
  }
  return { status: 'manual', url }
}

/**
 * Public GitHub Pages origin for links people share.
 * Do not use `window.location.origin`: the iOS app reports `capacitor://localhost`.
 */
export const PUBLIC_SITE_ORIGIN = 'https://networker-vt.github.io/eventlogistik-event-os'

export function resolvePublicOrigin(raw: string | null | undefined): string {
  const value = typeof raw === 'string' ? raw.trim() : ''
  if (!value) return PUBLIC_SITE_ORIGIN
  return value.replace(/\/+$/, '')
}

/** Absolute public URL for a route. The Pages path is already in the origin. */
export function absoluteUrl(path: string, configured?: string | null): string {
  if (/^https?:\/\//i.test(path)) return path
  const origin = resolvePublicOrigin(configured ?? import.meta.env.VITE_PUBLIC_SITE_URL)
  const rel = path.startsWith('/') ? path : `/${path}`
  return `${origin}${rel}`
}

export function whatsappShareHref(input: Pick<SharePayload, 'text' | 'url'>): string | null {
  const parts = [input.text?.trim(), input.url.trim()].filter(Boolean)
  return whatsappShareUrl(parts.join(' '))
}
