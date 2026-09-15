import type { Industry } from '../data/industries'
import { COMPANY_SIZES } from '../data/industries'
import { uid } from './utils'

const KEY = 'orbit_company_v1'
const EVT = 'orbit-company-changed'

export type CompanyDocKind = 'portfolio' | 'deck' | 'certificate'

export interface CompanyDoc {
  id: string
  kind: CompanyDocKind
  name: string
  mime: string
  size: number
  addedAt: string
}

export interface CompanyProfile {
  firmName: string
  industry: Industry | ''
  industries: Industry[]
  locations: string[]
  countries: string[]
  languages: string[]
  /** What the firm offers (services, products, capacity). */
  offers: string[]
  /** What the firm seeks (partners, suppliers, talent, capacity). */
  seeks: string[]
  hiringNeeds: string[]
  partnershipInterests: string[]
  radiusKm: number
  size: string
  bio: string
  website: string
  completed: boolean
  docs: CompanyDoc[]
  updatedAt: string
}

export function defaultCompany(): CompanyProfile {
  return {
    firmName: '',
    industry: '',
    industries: [],
    locations: [],
    countries: ['Deutschland', 'Remote / Global'],
    languages: ['Deutsch', 'Englisch'],
    offers: [],
    seeks: [],
    hiringNeeds: [],
    partnershipInterests: [],
    radiusKm: 80,
    size: COMPANY_SIZES[1],
    bio: '',
    website: '',
    completed: false,
    docs: [],
    updatedAt: new Date().toISOString(),
  }
}

function load(): CompanyProfile {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultCompany()
    const parsed = JSON.parse(raw) as CompanyProfile
    const base = defaultCompany()
    return {
      ...base,
      ...parsed,
      industries: Array.isArray(parsed.industries) ? parsed.industries : base.industries,
      locations: Array.isArray(parsed.locations) ? parsed.locations : base.locations,
      countries: Array.isArray(parsed.countries) ? parsed.countries : base.countries,
      languages: Array.isArray(parsed.languages) ? parsed.languages : base.languages,
      offers: Array.isArray(parsed.offers) ? parsed.offers : base.offers,
      seeks: Array.isArray(parsed.seeks) ? parsed.seeks : base.seeks,
      hiringNeeds: Array.isArray(parsed.hiringNeeds) ? parsed.hiringNeeds : base.hiringNeeds,
      partnershipInterests: Array.isArray(parsed.partnershipInterests)
        ? parsed.partnershipInterests
        : base.partnershipInterests,
      docs: Array.isArray(parsed.docs) ? parsed.docs : [],
    }
  } catch {
    return defaultCompany()
  }
}

let cache: CompanyProfile | null = null

function get(): CompanyProfile {
  if (!cache) cache = load()
  return cache
}

function commit(next: CompanyProfile) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribeCompany(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getCompany(): CompanyProfile {
  return structuredClone(get())
}

export function saveCompany(partial: Partial<CompanyProfile>): CompanyProfile {
  const next: CompanyProfile = {
    ...get(),
    ...partial,
    updatedAt: new Date().toISOString(),
  }
  commit(next)
  return structuredClone(next)
}

export function completeCompany(partial?: Partial<CompanyProfile>): CompanyProfile {
  return saveCompany({ ...partial, completed: true })
}

export function resetCompany() {
  const d = defaultCompany()
  commit(d)
  return d
}

export function addChip(field: keyof Pick<CompanyProfile, 'offers' | 'seeks' | 'hiringNeeds' | 'partnershipInterests' | 'locations'>, value: string) {
  const v = value.trim()
  if (!v) return getCompany()
  const cur = get()[field]
  if (cur.includes(v)) return getCompany()
  return saveCompany({ [field]: [...cur, v] })
}

export function removeChip(field: keyof Pick<CompanyProfile, 'offers' | 'seeks' | 'hiringNeeds' | 'partnershipInterests' | 'locations'>, value: string) {
  const cur = get()[field]
  return saveCompany({ [field]: cur.filter((x) => x !== value) })
}

export async function addCompanyDoc(file: File, kind: CompanyDocKind) {
  const doc: CompanyDoc = {
    id: uid('cdoc'),
    kind,
    name: file.name,
    mime: file.type || 'application/octet-stream',
    size: file.size,
    addedAt: new Date().toISOString(),
  }
  const next = saveCompany({ docs: [doc, ...get().docs].slice(0, 24) })
  return next
}

export function removeCompanyDoc(id: string) {
  return saveCompany({ docs: get().docs.filter((d) => d.id !== id) })
}

export function companyCompleteness(c?: CompanyProfile) {
  const p = c ?? get()
  const parts = [
    { ok: Boolean(p.firmName.trim()), label: 'Firma' },
    { ok: Boolean(p.industry) || p.industries.length > 0, label: 'Branche' },
    { ok: p.locations.length > 0, label: 'Standorte' },
    { ok: p.offers.length > 0 || p.seeks.length > 0, label: 'Angebot/Bedarf' },
    { ok: p.languages.length > 0 && p.countries.length > 0, label: 'Land/Sprache' },
  ]
  const score = Math.round((parts.filter((x) => x.ok).length / parts.length) * 100)
  return { score, parts }
}

export function companyIsReady(c?: CompanyProfile) {
  const p = c ?? get()
  return p.completed && Boolean(p.firmName.trim())
}
