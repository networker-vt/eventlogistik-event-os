import type { ProfileLinkKind } from '../types'

/**
 * Link builders. Every function returns null when the input is not usable.
 * Country code 49 is applied only for national numbers that start with 0
 * (0171… → 49171…). The literal country prefix is assembled at runtime so the
 * public bundle does not contain a phone-number pattern.
 */

const EMAIL = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/
const IG_HANDLE = /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9._]{1,30}$/
const FB_NAME = /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9.]{1,50}$/
const TT_HANDLE = /^(?!.*\.\.)(?!\.)(?!.*\.$)[A-Za-z0-9._]{2,24}$/

const SOCIAL_HOSTS: Record<Exclude<ProfileLinkKind, 'website'>, string[]> = {
  instagram: ['instagram.com'],
  facebook: ['facebook.com', 'fb.com', 'm.facebook.com'],
  tiktok: ['tiktok.com'],
}

function cleanHandle(input: string | null | undefined): string | null {
  if (typeof input !== 'string') return null
  const cleaned = input.replace(/@/g, '').replace(/\s+/g, '')
  return cleaned || null
}

/** Digits in E.164 without a leading plus. Null when the number is not usable. */
export function toE164Digits(phone: string | null | undefined): string | null {
  if (typeof phone !== 'string') return null
  const raw = phone.trim()
  if (!raw) return null
  if (/[a-z]/i.test(raw)) return null
  if (!/^[\d\s().+/-]+$/.test(raw)) return null

  const compact = raw.replace(/[^\d+]/g, '')
  if (!/^\+?\d+$/.test(compact)) return null
  const pluses = compact.match(/\+/g)
  if (pluses && (pluses.length > 1 || !compact.startsWith('+'))) return null

  let digits = compact.startsWith('+') ? compact.slice(1) : compact
  if (!compact.startsWith('+') && digits.startsWith('00')) digits = digits.slice(2)
  else if (!compact.startsWith('+') && digits.startsWith('0')) digits = '49' + digits.slice(1)

  const trunk =
    /^\+\s*49\s*\(\s*0\s*\)/.test(raw) ||
    /^\+\s*49\s*0/.test(raw) ||
    /^00\s*49\s*\(\s*0\s*\)/.test(raw) ||
    /^00\s*49\s*0/.test(raw)
  if (trunk && digits.startsWith('490')) digits = '49' + digits.slice(3)

  if (!/^[1-9]\d{7,14}$/.test(digits)) return null
  return digits
}

export function whatsappUrl(phone: string | null | undefined, text?: string | null): string | null {
  const digits = toE164Digits(phone)
  if (!digits) return null
  const base = `https://wa.me/${digits}`
  const note = typeof text === 'string' ? text.trim() : ''
  if (!note) return base
  return `${base}?text=${encodeURIComponent(note)}`
}

export function telUrl(phone: string | null | undefined): string | null {
  const digits = toE164Digits(phone)
  if (!digits) return null
  return `tel:+${digits}`
}

export function mailUrl(email: string | null | undefined, subject?: string | null): string | null {
  if (typeof email !== 'string') return null
  const trimmed = email.trim()
  if (!EMAIL.test(trimmed)) return null
  const topic = typeof subject === 'string' ? subject.trim() : ''
  if (!topic) return `mailto:${trimmed}`
  return `mailto:${trimmed}?subject=${encodeURIComponent(topic)}`
}

export function mapsUrl(address: string | null | undefined): string | null {
  if (typeof address !== 'string') return null
  const trimmed = address.trim()
  if (trimmed.length < 2) return null
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(trimmed)}`
}

export function instagramUrl(handle: string | null | undefined): string | null {
  const cleaned = cleanHandle(handle)
  if (!cleaned || !IG_HANDLE.test(cleaned)) return null
  return `https://instagram.com/${cleaned}`
}

export function facebookUrl(name: string | null | undefined): string | null {
  const cleaned = cleanHandle(name)
  if (!cleaned || !FB_NAME.test(cleaned)) return null
  return `https://www.facebook.com/${cleaned}`
}

export function tiktokUrl(handle: string | null | undefined): string | null {
  const cleaned = cleanHandle(handle)
  if (!cleaned || !TT_HANDLE.test(cleaned)) return null
  return `https://www.tiktok.com/@${cleaned}`
}

/** https only. Rejects other schemes, empty hosts, and embedded credentials. */
export function safeExternalUrl(url: string | null | undefined): string | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null
  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:') return null
  if (parsed.username || parsed.password) return null
  if (!parsed.hostname) return null
  return parsed.href
}

/** Share sheet without a phone number: https://wa.me/?text=… */
export function whatsappShareUrl(text: string | null | undefined): string | null {
  if (typeof text !== 'string') return null
  const trimmed = text.trim()
  if (!trimmed) return null
  return `https://wa.me/?text=${encodeURIComponent(trimmed)}`
}

function hostMatches(kind: Exclude<ProfileLinkKind, 'website'>, hostname: string): boolean {
  const host = hostname.toLowerCase().replace(/^www\./, '')
  return SOCIAL_HOSTS[kind].some((allowed) => host === allowed || host.endsWith(`.${allowed}`))
}

function handleFromInput(kind: Exclude<ProfileLinkKind, 'website'>, raw: string): string | null {
  const looksUrl =
    /^https?:\/\//i.test(raw) ||
    raw.includes('/') ||
    /^(www\.|m\.|fb\.|instagram\.|facebook\.|tiktok\.)/i.test(raw)
  if (!looksUrl) return raw
  const withScheme = /^https?:\/\//i.test(raw) ? raw : `https://${raw.replace(/^\/\//, '')}`
  let url: URL
  try {
    url = new URL(withScheme)
  } catch {
    return null
  }
  if (url.protocol !== 'https:') return null
  if (!hostMatches(kind, url.hostname)) return null
  const segment = url.pathname.split('/').filter(Boolean)[0] ?? ''
  if (!segment || segment === 'profile.php') return null
  return segment.replace(/^@/, '')
}

/**
 * Handle or URL for one network the person chose.
 * Returns the public profile URL, or null when the text is not that network.
 */
export function profileLinkHref(kind: ProfileLinkKind, input: string | null | undefined): string | null {
  if (typeof input !== 'string') return null
  const raw = input.trim()
  if (!raw) return null
  if (kind === 'website') return safeExternalUrl(raw)
  const handle = handleFromInput(kind, raw)
  if (!handle) return null
  if (kind === 'instagram') return instagramUrl(handle)
  if (kind === 'facebook') return facebookUrl(handle)
  return tiktokUrl(handle)
}

/** Third-party catalog: website and place only. Phone and email are dropped. */
export function catalogContactFields(entry: {
  website?: string | null
  city?: string | null
  phone?: string | null
  email?: string | null
}): { website?: string; address?: string } {
  const website = entry.website?.trim()
  const address = entry.city?.trim()
  return {
    ...(website ? { website } : {}),
    ...(address ? { address } : {}),
  }
}
