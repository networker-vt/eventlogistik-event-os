/** Real public headlines for the Home strip. Titles match the publisher page. No invented items. */
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
    id: 'ts-aktien-2026',
    cat: 'wirtschaft',
    titleDe: 'Nach einer Studie investieren immer mehr Deutsche in Aktien',
    titleEn: 'Nach einer Studie investieren immer mehr Deutsche in Aktien',
    source: 'tagesschau',
    href: 'https://www.tagesschau.de/wirtschaft/finanzen/aktienmarkt-investieren-dax-ing-bank-marktbericht-100.html',
    tags: ['Wirtschaft', 'Markt', 'B2B'],
  },
  {
    id: 'ts-oecd-2026',
    cat: 'wirtschaft',
    titleDe: 'OECD hebt Konjunkturprognose für deutsche Wirtschaft deutlich an',
    titleEn: 'OECD hebt Konjunkturprognose für deutsche Wirtschaft deutlich an',
    source: 'tagesschau',
    href: 'https://www.tagesschau.de/wirtschaft/konjunktur/deutschland-bip-prognose-oecd-100.html',
    tags: ['Wirtschaft', 'Markt'],
  },
  {
    id: 'ts-dax-2026',
    cat: 'wirtschaft',
    titleDe: 'Marktbericht: DAX gibt frühe Gewinne ab',
    titleEn: 'Marktbericht: DAX gibt frühe Gewinne ab',
    source: 'tagesschau',
    href: 'https://www.tagesschau.de/wirtschaft/finanzen/marktberichte/marktbericht-dax-dow-jones-iran-china-100.html',
    tags: ['Wirtschaft', 'Markt'],
  },
  {
    id: 'heise-opendesk-2026',
    cat: 'tech',
    titleDe: 'Enorme Nachfrage nach openDesk – Partnerprogramm startet jetzt',
    titleEn: 'Enorme Nachfrage nach openDesk – Partnerprogramm startet jetzt',
    source: 'heise',
    href: 'https://www.heise.de/news/Enorme-Nachfrage-nach-openDesk-Partnerprogramm-startet-jetzt-11463168.html',
    tags: ['Tech', 'B2B', 'IT'],
  },
  {
    id: 'heise-bigtech-2026',
    cat: 'tech',
    titleDe: 'Kein Zwang zum Algorithmus: Australiens Vorstoß gegen Big Tech verärgert die USA',
    titleEn: 'Kein Zwang zum Algorithmus: Australiens Vorstoß gegen Big Tech verärgert die USA',
    source: 'heise',
    href: 'https://www.heise.de/news/Kein-Zwang-zum-Algorithmus-Australiens-Vorstoss-gegen-Big-Tech-veraergert-die-USA-11463208.html',
    tags: ['Tech', 'Markt', 'Politik'],
  },
  {
    id: 'heise-kassenbon-2026',
    cat: 'politik',
    titleDe: 'Ab 2028: Bundeskabinett beschließt Ende der Kassenbon-Pflicht',
    titleEn: 'Ab 2028: Bundeskabinett beschließt Ende der Kassenbon-Pflicht',
    source: 'heise',
    href: 'https://www.heise.de/news/Bundeskabinett-beschliesst-Ende-der-Kassenbon-Pflicht-ab-2028-11463222.html',
    tags: ['Politik', 'Handel'],
  },
]
