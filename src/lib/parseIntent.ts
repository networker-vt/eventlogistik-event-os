import { CITIES } from '../data/constants'
import { type Industry, INDUSTRIES } from '../data/industries'
import {
  isMarketplaceInterest,
  type MarketplaceInterest,
  type PrefsSide,
  type SeekerPrefs,
  type EmployerPrefs,
} from './prefs'

const INTEREST_RULES: { id: MarketplaceInterest; re: RegExp }[] = [
  { id: 'travel', re: /\b(reise|reisen|flug|flüge|fluege|hotel|urlaub|bahn|abflug|trip|travel|flight|flights|zug)\b/i },
  { id: 'kabine', re: /\b(kleidung|klamotten|schuhe|frisur|outfit|kabine|mode|anziehen|haircut|shoes|clothes)\b/i },
  { id: 'learning', re: /\b(lernen|lerne|kurs|campus|fortbildung|studium|lektion|learn|course)\b/i },
  { id: 'services', re: /\b(dienstleistung|dienstleistungen|service|services|handwerk|reparatur|umzug)\b/i },
  { id: 'jobs', re: /\b(job|jobs|arbeit|stelle|stellen|minijob|gehalt|bewerbung|bewerben|hiring|karriere|schicht|nebenjob)\b/i },
  { id: 'b2b', re: /\b(b2b|firma|firmen|partner|partnerschaft|lieferant|unternehmen|geschäft|geschaeft|business|crew)\b/i },
  { id: 'social', re: /\b(leute|freunde|community|treffen|vernetzen|friends|meetup)\b/i },
]

const LANGUAGE_RULES: { label: string; re: RegExp }[] = [
  { label: 'Deutsch', re: /\b(deutsch|german)\b/i },
  { label: 'Englisch', re: /\b(englisch|english)\b/i },
  { label: 'Französisch', re: /\b(französisch|franzoesisch|french|français|francais)\b/i },
  { label: 'Niederländisch', re: /\b(niederländisch|niederlaendisch|dutch)\b/i },
  { label: 'Polnisch', re: /\b(polnisch|polish)\b/i },
  { label: 'Spanisch', re: /\b(spanisch|spanish|español|espanol)\b/i },
  { label: 'Italienisch', re: /\b(italienisch|italian)\b/i },
]

const INDUSTRY_RULES: { id: Industry; re: RegExp }[] = [
  { id: 'Pflege / Care', re: /\b(pflege|care|kranken)\w*/i },
  { id: 'Logistik / Lager', re: /\b(lager|logistik)\w*/i },
  { id: 'IT / Software', re: /\b(software|entwickler|developer|react|\bit\b)\b/i },
  { id: 'Einzelhandel', re: /\b(einzelhandel|verkauf|retail)\b/i },
  { id: 'Gastronomie / Hotel', re: /\b(gastro|kellner|kellnerin|gastronomie)\b/i },
  { id: 'Büro / Admin', re: /\b(büro|buero|admin)\b/i },
  { id: 'Handwerk / Bau', re: /\b(handwerk|bau)\b/i },
  { id: 'Kundenservice', re: /\b(kundenservice|support)\b/i },
  { id: 'Marketing / Sales', re: /\b(marketing|sales)\b/i },
  { id: 'Bildung', re: /\b(bildung|lehrer|lehrerin|nachhilfe)\b/i },
  { id: 'Gesundheit', re: /\b(gesundheit|arzt|ärztin|aerztin)\b/i },
  { id: 'Produktion', re: /\b(produktion|fertigung)\b/i },
  { id: 'Minijob / Nebenjob', re: /\b(minijob|nebenjob)\b/i },
  { id: 'Event / Veranstaltungstechnik', re: /\b(veranstaltung|lichttechnik|bühne|buehne)\b/i },
]

const CITY_ALIASES: { re: RegExp; city: (typeof CITIES)[number] }[] = [
  { re: /\bmuenchen\b/i, city: 'München' },
  { re: /\bmunchen\b/i, city: 'München' },
  { re: /\bkoeln\b/i, city: 'Köln' },
  { re: /\bzuerich\b/i, city: 'Zürich' },
]

const OFFER_RE =
  /\b(ich biete|wir bieten|wir stellen|stellen ein|stelle ausschreiben|hiring|mitarbeiter suchen|personal suchen)\b/i
const SEEK_WORK_RE =
  /\b(ich suche arbeit|job suchen|jobs suchen|stelle suchen|minijob suchen|nebenjob suchen|suche (?:einen |eine |mein )?(?:job|jobs|minijob|nebenjob|stelle))\b/i

export interface ParsedIntent {
  interests: MarketplaceInterest[]
  languages: string[]
  radiusKm: number | null
  cities: string[]
  industries: Industry[]
  side: PrefsSide | null
}

export function parseMarketplaceIntent(text: string): ParsedIntent {
  const note = text.trim()
  const interests = INTEREST_RULES.filter((rule) => rule.re.test(note)).map((rule) => rule.id)
  const languages = LANGUAGE_RULES.filter((rule) => rule.re.test(note)).map((rule) => rule.label)
  const industries = INDUSTRY_RULES.filter((rule) => INDUSTRIES.includes(rule.id) && rule.re.test(note)).map(
    (rule) => rule.id,
  )

  let radiusKm: number | null = null
  const km = note.match(/(\d{1,4})\s*km\b/i)
  if (km) radiusKm = Math.min(2000, Number(km[1]))
  else if (/\b(in der nähe|in der naehe|nearby|um die ecke)\b/i.test(note)) radiusKm = 20
  else if (/\b(remote|weltweit|egal wo|global)\b/i.test(note)) radiusKm = 500

  const cities = new Set<string>()
  for (const city of CITIES) {
    if (new RegExp(`\\b${city.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i').test(note)) cities.add(city)
  }
  for (const alias of CITY_ALIASES) {
    if (alias.re.test(note)) cities.add(alias.city)
  }

  const offer = OFFER_RE.test(note)
  const seekWork = SEEK_WORK_RE.test(note)
  const consumer = interests.some((id) => id === 'travel' || id === 'kabine' || id === 'learning' || id === 'social')
  let side: PrefsSide | null = null
  if (offer && (seekWork || consumer)) side = 'both'
  else if (offer) side = 'employer'
  else if (seekWork) side = 'seeker'

  return {
    interests,
    languages,
    radiusKm,
    cities: [...cities],
    industries,
    side,
  }
}

export function buildPrefsFromSetup(input: {
  note: string
  languages: string[]
  radiusKm: number
  cities: string[]
  interests: MarketplaceInterest[]
  currentSide: PrefsSide
  kids?: boolean
}): {
  side: PrefsSide
  interests: MarketplaceInterest[]
  todayNote: string
  seeker: Partial<SeekerPrefs>
  employer: Partial<EmployerPrefs>
} {
  const parsed = parseMarketplaceIntent(input.note)
  const interests = (input.kids ? input.interests.filter((id) => id !== 'social') : input.interests).filter(
    isMarketplaceInterest,
  )
  const clearIndustry = parsed.industries.length === 0 && !interests.includes('jobs')
  const industryPatch = parsed.industries.length
    ? { industries: parsed.industries }
    : clearIndustry
      ? { industries: [] as Industry[] }
      : {}
  return {
    side: parsed.side ?? input.currentSide,
    interests,
    todayNote: input.note.trim(),
    seeker: {
      languages: input.languages,
      radiusKm: input.radiusKm,
      cities: input.cities,
      ...industryPatch,
    },
    employer: {
      languages: input.languages,
      radiusKm: input.radiusKm,
      ...industryPatch,
    },
  }
}
