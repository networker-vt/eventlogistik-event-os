import { uid } from './utils'

const KEY = 'el_ideas_v1'
const TWEAK_KEY = 'el_safe_tweaks_v1'
const EVT = 'el-ideas-changed'

export type IdeaCategory = 'idee' | 'bug' | 'ux' | 'feature'
export type IdeaPriority = 'low' | 'medium' | 'high'
export type IdeaStatus = 'neu' | 'geplant' | 'geprüft'

export const IDEA_CATEGORY_LABEL: Record<IdeaCategory, string> = {
  idee: 'Idee',
  bug: 'Bug',
  ux: 'UX',
  feature: 'Feature',
}

export interface IdeaItem {
  id: string
  category: IdeaCategory
  text: string
  email?: string
  createdAt: string
  tags: string[]
  priority: IdeaPriority
  status: IdeaStatus
  plannedReason?: string
  appliedTweaks: string[]
}

export interface SafeTweak {
  id: string
  label: string
  appliedAt: string
}

const TAG_RULES: { tag: string; keys: string[] }[] = [
  { tag: 'jobs', keys: ['job', 'gig', 'crew', 'besetzung', 'tagessatz', 'schicht'] },
  { tag: 'zahlung', keys: ['zahl', 'paypal', 'stripe', 'wallet', 'iban', 'krypto', 'auszahl', 'sepa'] },
  { tag: 'katalog', keys: ['katalog', 'firma', 'firmen', 'location', 'verzeichnis'] },
  { tag: 'mobile', keys: ['mobile', 'handy', 'ios', 'android', 'pwa', 'app store', 'play store'] },
  { tag: 'integrationen', keys: ['easyjob', 'rentman', 'crewbrain', 'eventworx', 'sync', 'api', 'erp', 'protonic'] },
  { tag: 'matching', keys: ['match', 'filter', 'suche', 'empfehl'] },
  { tag: 'ux', keys: ['ux', 'ui', 'design', 'kontrast', 'lesbar', 'nav', 'leer'] },
  { tag: 'trust', keys: ['trust', 'verifiz', 'rating', 'bewertung'] },
  { tag: 'referral', keys: ['empfehl', 'referral', 'werben', 'credits'] },
]

const KNOWN_GAPS: { id: string; label: string; keys: string[] }[] = [
  { id: 'payments-live', label: 'Live-Payments (Stripe/PayPal/KYC)', keys: ['stripe', 'echtes geld', 'echte zahlung', 'paypal live', 'kyc'] },
  { id: 'store-native', label: 'Native Store-Apps', keys: ['app store', 'play store', 'native app', 'capacitor'] },
  { id: 'push', label: 'Push-Benachrichtigungen', keys: ['push', 'benachricht'] },
  { id: 'erp-sync', label: 'ERP-Live-Sync', keys: ['easyjob', 'rentman', 'crewbrain', 'eventworx', 'erp sync'] },
  { id: 'supabase-live', label: 'Live-Backend statt Demo-Store', keys: ['supabase', 'echte daten', 'cloud sync'] },
]

const SAFE_TWEAKS: { id: string; keys: string[]; label: string }[] = [
  {
    id: 'contrast',
    keys: ['kontrast', 'lesbarkeit', 'zu dunkel', 'schwer lesbar', 'grau auf schwarz'],
    label: 'Kontrast der Fließtexte leicht erhöht',
  },
]

function load(): IdeaItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as IdeaItem[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

let cache: IdeaItem[] | null = null

function get(): IdeaItem[] {
  if (!cache) cache = load()
  return cache
}

function commit(next: IdeaItem[]) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeIdeas(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function listIdeas(): IdeaItem[] {
  return structuredClone(get())
}

export function analyzeIdea(text: string, category: IdeaCategory) {
  const hay = text.toLowerCase()
  const tags = TAG_RULES.filter((r) => r.keys.some((k) => hay.includes(k))).map((r) => r.tag)
  if (category === 'ux' && !tags.includes('ux')) tags.push('ux')
  if (category === 'bug' && !tags.includes('bug')) tags.push('bug')

  const gap = KNOWN_GAPS.find((g) => g.keys.some((k) => hay.includes(k)))
  let priority: IdeaPriority = 'medium'
  if (category === 'bug' || /crash|hängt|kaputt|zahl|sicher|datenleck/.test(hay)) priority = 'high'
  else if (category === 'idee' && text.length < 40) priority = 'low'

  const applied: string[] = []
  for (const t of SAFE_TWEAKS) {
    if (t.keys.some((k) => hay.includes(k))) {
      applySafeTweak(t.id, t.label)
      applied.push(t.id)
    }
  }

  return {
    tags,
    priority,
    status: (gap ? 'geplant' : 'neu') as IdeaStatus,
    plannedReason: gap?.label,
    appliedTweaks: applied,
  }
}

export function addIdea(input: { category: IdeaCategory; text: string; email?: string }): IdeaItem {
  const analysis = analyzeIdea(input.text, input.category)
  const item: IdeaItem = {
    id: uid('idea'),
    category: input.category,
    text: input.text.trim(),
    email: input.email?.trim() || undefined,
    createdAt: new Date().toISOString(),
    ...analysis,
  }
  const next = [item, ...get()]
  commit(next)
  return item
}

export function applySafeTweak(id: string, label: string) {
  const list = listSafeTweaks()
  if (list.some((t) => t.id === id)) {
    applyTweakDom(id)
    return
  }
  const next = [...list, { id, label, appliedAt: new Date().toISOString() }]
  localStorage.setItem(TWEAK_KEY, JSON.stringify(next))
  applyTweakDom(id)
}

export function listSafeTweaks(): SafeTweak[] {
  try {
    const raw = localStorage.getItem(TWEAK_KEY)
    return raw ? (JSON.parse(raw) as SafeTweak[]) : []
  } catch {
    return []
  }
}

function applyTweakDom(id: string) {
  if (typeof document === 'undefined') return
  if (id === 'contrast') document.documentElement.classList.add('tweak-contrast')
}

export function hydrateSafeTweaks() {
  for (const t of listSafeTweaks()) applyTweakDom(t.id)
}

export function clearIdeas() {
  commit([])
}
