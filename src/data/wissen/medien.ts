export interface BranchenMedium {
  id: string
  name: string
  url: string
  blurbDe: string
  tags: string[]
  focus: string
}

export const branchenMedien: BranchenMedium[] = [
  {
    id: 'med-production-partner',
    name: 'Production Partner',
    url: 'https://www.production-partner.de',
    blurbDe:
      'Fachmagazin und Online-Portal für Veranstaltungstechnik — Tests, Praxis, Herstellernews zu Licht, Ton, Video und Rigging.',
    tags: ['Licht', 'Ton', 'Video', 'Rigging'],
    focus: 'Technik & Praxis',
  },
  {
    id: 'med-eventelevator',
    name: 'EventElevator',
    url: 'https://www.eventelevator.de',
    blurbDe:
      'Branchenmedium rund um Events, Technik und Business — Trends, Interviews und Marktbeobachtung.',
    tags: ['Business', 'Events', 'Technik'],
    focus: 'Business & Trends',
  },
  {
    id: 'med-eventrookie',
    name: 'EVENT Rookie',
    url: 'https://www.eventrookie.de',
    blurbDe:
      'Einstieg und Orientierung für Nachwuchs in der Eventbranche — Wissen, Perspektiven, Community-Nähe.',
    tags: ['Business', 'Nachwuchs', 'Wissen'],
    focus: 'Nachwuchs & Orientierung',
  },
  {
    id: 'med-mothergrid',
    name: 'mothergrid',
    url: 'https://www.mothergrid.de',
    blurbDe:
      'Online-Magazin mit Fokus auf Live-Entertainment, Touring und Veranstaltungstechnik aus der Praxis.',
    tags: ['Ton', 'Licht', 'Live', 'Touring'],
    focus: 'Live & Touring',
  },
  {
    id: 'med-event-partner',
    name: 'Event Partner',
    url: 'https://www.event-partner.de',
    blurbDe:
      'Fachportal für Eventtechnologie und -wirtschaft — Produktnews, Messeberichte, Markt.',
    tags: ['Business', 'Video', 'Licht', 'Ton'],
    focus: 'Eventtechnologie',
  },
  {
    id: 'med-promedianews',
    name: 'ProMediaNews',
    url: 'https://www.promedianews.de',
    blurbDe:
      'Nachrichten und Hintergründe aus der Pro-Media- und AV-Welt — relevant für Install und Live.',
    tags: ['Video', 'AV', 'Business'],
    focus: 'Pro Media / AV',
  },
  {
    id: 'med-vplt',
    name: 'VPLT / Verbandsmedien',
    url: 'https://www.vplt.org',
    blurbDe:
      'Verband für Medien- und Veranstaltungstechnik — Standards, Stellungnahmen, Fortbildungs- und Brancheninfos.',
    tags: ['Standards', 'Business', 'Sicherheit'],
    focus: 'Verband & Standards',
  },
]

export const MEDIEN_COUNT = branchenMedien.length
