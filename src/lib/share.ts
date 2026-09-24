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

/** Absolute URL for a route, including the Pages or Capacitor base. */
export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path
  const origin = typeof window !== 'undefined' ? window.location.origin : ''
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')
  const rel = path.startsWith('/') ? path : `/${path}`
  return `${origin}${base}${rel}`
}

export function whatsappShareHref(input: Pick<SharePayload, 'text' | 'url'>): string | null {
  const parts = [input.text?.trim(), input.url.trim()].filter(Boolean)
  return whatsappShareUrl(parts.join(' '))
}
