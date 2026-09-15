/**
 * Channel linking stubs — no OAuth, no scraping.
 * Connected flags live in localStorage and only bias on-device ranking.
 */
export type ChannelId = 'amazon' | 'netflix' | 'youtube' | 'spotify' | 'instagram'

export interface ChannelDef {
  id: ChannelId
  label: string
  emoji: string
  tags: string[]
  benefitDe: string
}

export const CHANNEL_DEFS: ChannelDef[] = [
  {
    id: 'amazon',
    label: 'Amazon',
    emoji: '📦',
    tags: ['shop', 'shopping', 'retail', 'handel', 'amazon', 'marktplatz', 'kleid', 'sneaker'],
    benefitDe: 'Leicht mehr Shopping- & Retail-Deals',
  },
  {
    id: 'netflix',
    label: 'Netflix',
    emoji: '🎬',
    tags: ['film', 'serie', 'stream', 'entertainment', 'netflix', 'creator'],
    benefitDe: 'Leicht mehr Entertainment & Creator',
  },
  {
    id: 'youtube',
    label: 'YouTube',
    emoji: '▶️',
    tags: ['youtube', 'video', 'creator', 'entertainment', 'tutorial'],
    benefitDe: 'Leicht mehr Creator- & Video-Themen',
  },
  {
    id: 'spotify',
    label: 'Spotify',
    emoji: '🎧',
    tags: ['musik', 'music', 'band', 'spotify', 'konzert', 'entertainment'],
    benefitDe: 'Leicht mehr Musik, Bands, Live',
  },
  {
    id: 'instagram',
    label: 'Instagram',
    emoji: '📸',
    tags: ['instagram', 'fashion', 'look', 'style', 'foto', 'creator'],
    benefitDe: 'Leicht mehr Look, Fashion, Creator',
  },
]

const KEY = 'orbit_channels_v1'
const EVT = 'orbit-channels-changed'

export type ChannelState = Record<ChannelId, boolean>

function defaultState(): ChannelState {
  return {
    amazon: false,
    netflix: false,
    youtube: false,
    spotify: false,
    instagram: false,
  }
}

function load(): ChannelState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    return { ...defaultState(), ...(JSON.parse(raw) as Partial<ChannelState>) }
  } catch {
    return defaultState()
  }
}

let cache: ChannelState | null = null
function get(): ChannelState {
  if (!cache) cache = load()
  return cache
}
function commit(next: ChannelState) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function getChannels(): ChannelState {
  return { ...get() }
}

export function toggleChannel(id: ChannelId, on?: boolean) {
  const next = { ...get() }
  next[id] = on ?? !next[id]
  commit(next)
  return next[id]
}

export function subscribeChannels(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function connectedChannelDefs(): ChannelDef[] {
  const st = get()
  return CHANNEL_DEFS.filter((c) => st[c.id])
}

/** Light on-device bias. Never claims to have read the real account. */
export function channelBoostForText(text: string): { score: number; label?: string } {
  const hay = text.toLowerCase()
  const connected = connectedChannelDefs()
  if (connected.length === 0) return { score: 0 }
  let score = 0
  let label: string | undefined
  for (const ch of connected) {
    if (ch.tags.some((t) => hay.includes(t))) {
      score += 14
      label = ch.label
    }
  }
  return { score: Math.min(28, score), label }
}

export const CHANNELS_DISCLAIMER_DE =
  'Verbinden ist ein Stub — kein OAuth, kein Login bei Amazon/Netflix/YouTube. Orbit liest diese Konten nicht. Der Schalter speichert nur lokal, damit Demo-Deals etwas in Richtung Shopping, Entertainment oder Musik kippen.'
