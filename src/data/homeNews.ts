/** Curated glanceable headlines for Home — demo, not a live wire. */
export type HomeNewsCat = 'wirtschaft' | 'sport' | 'politik' | 'tech'

export interface HomeNewsItem {
  id: string
  cat: HomeNewsCat
  titleDe: string
  titleEn: string
  source: string
  href: string
  tags: string[]
}

export const HOME_NEWS: HomeNewsItem[] = [
  {
    id: 'hn-w-1',
    cat: 'wirtschaft',
    titleDe: 'DACH-Mittelstand sucht Partner statt Kataloge — Matching-Plattformen im Fokus',
    titleEn: 'DACH SMEs look for partners, not catalogues — matching platforms in focus',
    source: 'Handelsblatt',
    href: 'https://www.handelsblatt.com',
    tags: ['B2B', 'IT', 'Logistik'],
  },
  {
    id: 'hn-w-2',
    cat: 'wirtschaft',
    titleDe: 'Reisepreise Herbst: Kurzstrecken bleiben volatil, Bahn-Sparpreise ziehen an',
    titleEn: 'Autumn travel prices: short-haul stays volatile, rail saver fares pick up',
    source: 'Tagesschau',
    href: 'https://www.tagesschau.de',
    tags: ['Reise', 'Bahn'],
  },
  {
    id: 'hn-s-1',
    cat: 'sport',
    titleDe: 'Bundesliga-Wochenende: Stadien brauchen Crew — Last-Minute-Schichten',
    titleEn: 'Bundesliga weekend: stadiums need crew — last-minute shifts',
    source: 'Kicker',
    href: 'https://www.kicker.de',
    tags: ['Event', 'Sport'],
  },
  {
    id: 'hn-s-2',
    cat: 'sport',
    titleDe: 'Olympia-Vorlauf: Host Cities suchen Volunteers und Technik-Partner',
    titleEn: 'Olympic run-up: host cities look for volunteers and tech partners',
    source: 'Sportschau',
    href: 'https://www.sportschau.de',
    tags: ['Event', 'Sport'],
  },
  {
    id: 'hn-p-1',
    cat: 'politik',
    titleDe: 'Fachkräfteeinwanderung: Anerkennung von Qualifikationen bleibt Engpass',
    titleEn: 'Skilled immigration: recognition of qualifications stays a bottleneck',
    source: 'Tagesschau',
    href: 'https://www.tagesschau.de',
    tags: ['Jobs', 'Politik'],
  },
  {
    id: 'hn-p-2',
    cat: 'politik',
    titleDe: 'EU-Digitalregeln: Plattformen müssen Demo-Zahlungen klar kennzeichnen',
    titleEn: 'EU digital rules: platforms must label demo payments clearly',
    source: 'EU-Kommission',
    href: 'https://commission.europa.eu',
    tags: ['Tech', 'Politik'],
  },
  {
    id: 'hn-t-1',
    cat: 'tech',
    titleDe: 'KI-Matching: Skills und Radius schlagen Black-Box-Scores',
    titleEn: 'AI matching: skills and radius beat black-box scores',
    source: 'heise',
    href: 'https://www.heise.de',
    tags: ['IT', 'KI', 'Tech'],
  },
  {
    id: 'hn-t-2',
    cat: 'tech',
    titleDe: 'Remote-first: Hybrid-Jobs in EU-Städten wachsen schneller als Onsite',
    titleEn: 'Remote-first: hybrid jobs in EU cities grow faster than on-site',
    source: 'heise',
    href: 'https://www.heise.de',
    tags: ['IT', 'Remote'],
  },
]
