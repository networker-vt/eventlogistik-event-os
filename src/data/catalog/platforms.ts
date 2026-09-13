import type { CatalogPlatform } from './types'

/** Outbound discovery platforms — not scraped user DBs. */
export const catalogPlatforms: CatalogPlatform[] = [
  {
    id: 'plat-dry-hire',
    name: 'dry-hire.com',
    url: 'https://dry-hire.com/de/world-of-dry-hire/land/deutschland',
    blurbDe:
      'Öffentliches Verzeichnis für Dry-Hire-Veranstaltungstechnik in DE und international. Firmenprofile mit Kontaktdaten.',
    tags: ['Dry Hire', 'VT', 'Verzeichnis'],
  },
  {
    id: 'plat-vt-stage',
    name: 'vt-stage / Branchentools',
    url: 'https://www.vt-stage.de',
    blurbDe:
      'Branchenportal und Tools rund um Veranstaltungstechnik — nützlich zur Discovery von Dienstleistern und News.',
    tags: ['VT', 'Portal'],
  },
  {
    id: 'plat-evvc',
    name: 'EVVC Location Portal',
    url: 'https://www.evvc.org',
    blurbDe:
      'Europäischer Verband der Veranstaltungs-Centren — Location- und Brancheninfos für Hallen und Kongresszentren.',
    tags: ['Locations', 'Verband'],
  },
  {
    id: 'plat-messe',
    name: 'AUMA / deutsche Messen',
    url: 'https://www.auma.de',
    blurbDe:
      'Überblick über Messeplätze und Termine in Deutschland — Orientierung für Event- und Ausstellungsplanung.',
    tags: ['Messe', 'Locations'],
  },
  {
    id: 'plat-vplt',
    name: 'VPLT',
    url: 'https://www.vplt.org',
    blurbDe:
      'Verband für Medien- und Veranstaltungstechnik — Normen, Weiterbildung, Branchennetzwerk.',
    tags: ['Verband', 'Standards'],
  },
  {
    id: 'plat-eventpartner',
    name: 'Event Partner',
    url: 'https://www.event-partner.de',
    blurbDe:
      'Fachmedium für Eventtechnologie — Produktnews, Praxis und Herstellerübersichten.',
    tags: ['News', 'Fachpresse'],
  },
]
