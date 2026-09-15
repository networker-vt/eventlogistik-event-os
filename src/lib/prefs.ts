import type { Industry, JobType, WorkMode } from '../data/industries'
import type { Listing, Profile } from '../types'

const KEY = 'orbit_prefs_v1'
const EVT = 'orbit-prefs-changed'

export type PrefsSide = 'seeker' | 'employer'

export interface SeekerPrefs {
  countries: string[]
  languages: string[]
  industries: Industry[]
  jobTypes: JobType[]
  workModes: WorkMode[]
  salaryMin: number
  radiusKm: number
  cities: string[]
  mustHaveSkills: string[]
}

export interface EmployerPrefs {
  countries: string[]
  languages: string[]
  rolesHiring: string[]
  companySize: string
  mustHaveSkills: string[]
  industries: Industry[]
}

export interface OrbitPrefs {
  side: PrefsSide
  completed: boolean
  seeker: SeekerPrefs
  employer: EmployerPrefs
  updatedAt: string
}

export function defaultPrefs(): OrbitPrefs {
  return {
    side: 'seeker',
    completed: false,
    seeker: {
      countries: ['Deutschland'],
      languages: ['Deutsch'],
      industries: [],
      jobTypes: ['Vollzeit', 'Teilzeit', 'Minijob', 'Freelance'],
      workModes: ['remote', 'hybrid', 'onsite'],
      salaryMin: 0,
      radiusKm: 50,
      cities: [],
      mustHaveSkills: [],
    },
    employer: {
      countries: ['Deutschland'],
      languages: ['Deutsch'],
      rolesHiring: [],
      companySize: '11–50',
      mustHaveSkills: [],
      industries: [],
    },
    updatedAt: new Date().toISOString(),
  }
}

function load(): OrbitPrefs {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return defaultPrefs()
    const parsed = JSON.parse(raw) as OrbitPrefs
    const base = defaultPrefs()
    return {
      ...base,
      ...parsed,
      seeker: { ...base.seeker, ...parsed.seeker },
      employer: { ...base.employer, ...parsed.employer },
    }
  } catch {
    return defaultPrefs()
  }
}

let cache: OrbitPrefs | null = null

function get(): OrbitPrefs {
  if (!cache) cache = load()
  return cache
}

function commit(next: OrbitPrefs) {
  cache = next
  localStorage.setItem(KEY, JSON.stringify(next))
  window.dispatchEvent(new CustomEvent(EVT))
}

export function subscribePrefs(cb: () => void) {
  const h = () => cb()
  window.addEventListener(EVT, h)
  window.addEventListener('storage', h)
  return () => {
    window.removeEventListener(EVT, h)
    window.removeEventListener('storage', h)
  }
}

export function getPrefs(): OrbitPrefs {
  return structuredClone(get())
}

export function savePrefs(partial: Partial<OrbitPrefs>): OrbitPrefs {
  const next: OrbitPrefs = {
    ...get(),
    ...partial,
    seeker: partial.seeker ? { ...get().seeker, ...partial.seeker } : get().seeker,
    employer: partial.employer
      ? { ...get().employer, ...partial.employer }
      : get().employer,
    updatedAt: new Date().toISOString(),
  }
  commit(next)
  return structuredClone(next)
}

export function completePrefs(side: PrefsSide): OrbitPrefs {
  return savePrefs({ side, completed: true })
}

export function resetPrefs() {
  const d = defaultPrefs()
  commit(d)
  return d
}

/** Hard-filter listings by seeker prefs before any feed/cards. */
export function filterListingsByPrefs(listings: Listing[], prefs?: OrbitPrefs): Listing[] {
  const p = prefs ?? get()
  if (!p.completed || p.side !== 'seeker') return listings
  const s = p.seeker
  return listings.filter((l) => {
    if (l.vertical !== 'job' && l.kind !== 'offer') {
      // keep non-job marketplace loosely if industries empty; else require industry tag
    }
    if (s.industries.length) {
      const industry = (l as Listing & { industry?: string }).industry
      const tags = [...(l.tags || []), ...(l.crafts || []), industry || ''].map((t) =>
        t.toLowerCase(),
      )
      const hit = s.industries.some((ind) =>
        tags.some((t) => t.includes(ind.toLowerCase().split('/')[0].trim().toLowerCase())),
      )
      if (!hit && industry) {
        if (!s.industries.includes(industry as Industry)) return false
      } else if (!hit && !industry) {
        // Event VT listings: map to Event industry
        const isEvent =
          l.vertical !== 'job' ||
          (l.crafts || []).some((c) =>
            ['Licht', 'Ton', 'Rigging', 'Stage', 'Video', 'FOH', 'Medienserver'].some((k) =>
              c.includes(k),
            ),
          )
        if (isEvent && !s.industries.some((i) => i.startsWith('Event'))) return false
        if (!isEvent) return false
      }
    }
    if (s.cities.length && !s.cities.some((c) => l.city.toLowerCase() === c.toLowerCase())) {
      // allow remote-tagged
      const mode = (l as Listing & { workMode?: WorkMode }).workMode
      if (mode !== 'remote' && !l.tags?.some((t) => /remote/i.test(t))) return false
    }
    if (s.salaryMin > 0) {
      const pay = l.priceFrom ?? l.priceTo ?? 0
      // normalize monthly-ish: if unit is Stunde, rough *160; Tag *20; Monat as-is
      let monthly = pay
      const u = (l.priceUnit || '').toLowerCase()
      if (u.includes('stunde') || u === 'h' || u === 'std') monthly = pay * 160
      else if (u.includes('tag')) monthly = pay * 20
      else if (u.includes('woche')) monthly = pay * 4
      if (monthly > 0 && monthly < s.salaryMin) return false
    }
    if (s.jobTypes.length) {
      const jt = (l as Listing & { jobType?: string }).jobType
      if (jt && !s.jobTypes.includes(jt as JobType)) return false
      // tag fallback
      if (!jt) {
        const tagHit = s.jobTypes.some((t) =>
          (l.tags || []).some((x) => x.toLowerCase().includes(t.toLowerCase())),
        )
        // if listing has no jobType and no matching tags, still show (legacy seed)
        if ((l.tags || []).some((x) => /minijob|vollzeit|teilzeit|freelance|werkstudent/i.test(x)) && !tagHit)
          return false
      }
    }
    if (s.workModes.length) {
      const mode = (l as Listing & { workMode?: WorkMode }).workMode
      if (mode && !s.workModes.includes(mode)) return false
    }
    if (s.mustHaveSkills.length) {
      const hay = [...(l.crafts || []), ...(l.requirements || []), ...(l.tags || [])]
        .join(' ')
        .toLowerCase()
      const ok = s.mustHaveSkills.every((sk) => hay.includes(sk.toLowerCase()))
      if (!ok) return false
    }
    if (s.countries.length && !s.countries.includes('Remote / Global')) {
      const country = (l as Listing & { country?: string }).country || 'Deutschland'
      if (!s.countries.includes(country) && country !== 'Remote / Global') {
        // default DE seed → Deutschland
        if (!(s.countries.includes('Deutschland') && (!country || country === 'Deutschland')))
          return false
      }
    }
    return true
  })
}

export function filterCandidatesByEmployerPrefs(
  profiles: Profile[],
  prefs?: OrbitPrefs,
): Profile[] {
  const p = prefs ?? get()
  if (!p.completed || p.side !== 'employer') return profiles
  const e = p.employer
  return profiles.filter((prof) => {
    if (e.mustHaveSkills.length) {
      const hay = [...(prof.crafts || []), ...(prof.certifications || []), prof.bio]
        .join(' ')
        .toLowerCase()
      if (!e.mustHaveSkills.every((sk) => hay.includes(sk.toLowerCase()))) return false
    }
    if (e.rolesHiring.length) {
      const hay = [...(prof.crafts || []), prof.role, prof.bio].join(' ').toLowerCase()
      if (!e.rolesHiring.some((r) => hay.includes(r.toLowerCase()))) return false
    }
    return true
  })
}
