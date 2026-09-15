import { getPrefs, savePrefs } from './prefs'
import { uid } from './utils'
import { maybeGrantProfileComplete } from './rewards'

const KEY = 'orbit_profile_hub_v1'
const EVT = 'orbit-hub-changed'
const MAX_DATA_URL = 180_000

export type HubDocKind = 'qualification' | 'certificate' | 'training'

export interface SkillRating {
  id: string
  name: string
  stars: number
}

export interface HubDoc {
  id: string
  kind: HubDocKind
  name: string
  mime: string
  size: number
  addedAt: string
  dataUrl?: string
}

export interface HubState {
  skills: SkillRating[]
  docs: HubDoc[]
}

function defaultState(): HubState {
  return {
    skills: [
      { id: 'sk-1', name: 'Kommunikation', stars: 4 },
      { id: 'sk-2', name: 'Organisation', stars: 3 },
    ],
    docs: [],
  }
}

function load(): HubState {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultState()
    const parsed = JSON.parse(raw) as HubState
    return {
      skills: Array.isArray(parsed.skills) ? parsed.skills : defaultState().skills,
      docs: Array.isArray(parsed.docs) ? parsed.docs : [],
    }
  } catch {
    return defaultState()
  }
}

let cache: HubState | null = null

function get(): HubState {
  if (!cache) cache = load()
  return cache
}

function commit(next: HubState) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
  maybeGrantProfileComplete()
}

export function subscribeHub(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getHub(): HubState {
  return structuredClone(get())
}

export function setSkillStars(id: string, stars: number) {
  const next = structuredClone(get())
  const row = next.skills.find((s) => s.id === id)
  if (row) row.stars = Math.min(5, Math.max(1, Math.round(stars)))
  commit(next)
  return next
}

export function addSkill(name: string, stars = 3) {
  const n = name.trim()
  if (!n) return get()
  const next = structuredClone(get())
  if (next.skills.some((s) => s.name.toLowerCase() === n.toLowerCase())) return next
  next.skills.push({ id: uid('sk'), name: n, stars: Math.min(5, Math.max(1, stars)) })
  commit(next)
  return next
}

export function removeSkill(id: string) {
  const next = structuredClone(get())
  next.skills = next.skills.filter((s) => s.id !== id)
  commit(next)
  return next
}

export async function addDocFromFile(file: File, kind: HubDocKind): Promise<HubState> {
  const next = structuredClone(get())
  const doc: HubDoc = {
    id: uid('doc'),
    kind,
    name: file.name || 'Datei',
    mime: file.type || 'application/octet-stream',
    size: file.size,
    addedAt: new Date().toISOString(),
  }
  if (file.size > 0 && file.size < MAX_DATA_URL && file.type.startsWith('image/')) {
    try {
      doc.dataUrl = await readFileAsDataUrl(file)
    } catch {
      /* metadata only */
    }
  }
  next.docs.unshift(doc)
  commit(next)
  return next
}

export function removeDoc(id: string) {
  const next = structuredClone(get())
  next.docs = next.docs.filter((d) => d.id !== id)
  commit(next)
  return next
}

export function setRadiusKm(km: number) {
  const n = Math.min(2000, Math.max(1, Math.round(km)))
  savePrefs({ seeker: { ...getPrefs().seeker, radiusKm: n } })
  maybeGrantProfileComplete()
  return n
}

export function profileCompleteness(): { score: number; parts: { label: string; ok: boolean }[] } {
  const prefs = getPrefs()
  const hub = get()
  const parts = [
    { label: 'Prefs', ok: prefs.completed },
    { label: 'Radius', ok: prefs.seeker.radiusKm > 0 },
    { label: 'Branchen', ok: prefs.seeker.industries.length > 0 || prefs.employer.industries.length > 0 },
    { label: 'Skills', ok: hub.skills.length >= 3 },
    { label: 'Nachweise', ok: hub.docs.length >= 1 },
  ]
  const score = Math.round((parts.filter((p) => p.ok).length / parts.length) * 100)
  return { score, parts }
}

export function formatSkillLine() {
  return get()
    .skills.map((s) => `${s.name} (${s.stars}/5)`)
    .join(', ')
}

export function formatDocsLine() {
  const docs = get().docs
  if (!docs.length) return ''
  return docs.map((d) => d.name).join(', ')
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
