import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { de, enUS, es, fr, pl } from 'date-fns/locale'
import type { Locale as DateFnsLocale } from 'date-fns'

export type Locale = 'de' | 'en' | 'es' | 'fr' | 'pl'

export const LOCALES: {
  id: Locale
  native: string
  stub?: boolean
}[] = [
  { id: 'de', native: 'Deutsch' },
  { id: 'en', native: 'English' },
  { id: 'es', native: 'Español', stub: true },
  { id: 'fr', native: 'Français', stub: true },
  { id: 'pl', native: 'Polski', stub: true },
]

const KEY = 'orbit_locale_v1'
const EVT = 'orbit-locale-changed'

type Dict = Record<string, string>

const deDict: Dict = {
  'skip.toContent': 'Zum Inhalt springen',
  'nav.home': 'Home',
  'nav.match': 'Match',
  'nav.mein': 'Mein',
  'nav.inbox': 'Inbox',
  'nav.mehr': 'Mehr',
  'nav.create': 'Erstellen',
  'nav.login': 'Login',
  'brand.tagline': 'Matching statt Spam',
  'brand.loading': 'Orbit wird geladen…',
  'home.kicker': 'Orbit · Job Matching OS',
  'home.title': 'Dein Orbit für Arbeit —',
  'home.titleAccent': 'Matching statt Spam',
  'home.lead':
    'Global, branchenübergreifend: IT, Pflege, Retail, Logistik, Gastro, Admin, Minijobs — Event/VT ist nur ein Sektor unter vielen. Prefs zuerst, dann swipen.',
  'home.matchOpen': 'Match Finder öffnen',
  'home.matchHint': 'Tinder-Style Karten mit erklärbarem Match-Rating %.',
  'home.swipe': 'Los swipen',
  'home.prefsSetup': 'Prefs einrichten',
  'home.prefsAdjust': 'Prefs anpassen',
  'home.prefsHint': 'Länder, Sprachen, Branchen, Typ, Remote, Gehalt, Skills — Hard-Filter vor dem Feed.',
  'home.wizard': 'Wizard starten',
  'home.demo': 'Demo starten',
  'home.dashboard': 'Dashboard',
  'home.postJob': 'Job posten',
  'home.photoJobs': 'Firma fotografieren',
  'home.stats.jobs': 'Jobs live',
  'home.stats.requests': 'Gesuche',
  'home.stats.bookings': 'Buchungen',
  'home.world': 'Deine Welt',
  'home.worldHint': 'Personalisiert aus Prefs + lokalem Verhalten (Views, Swipes, Bewerbungen). Unpassendes wird ausgeblendet.',
  'home.worldEmpty': 'Noch keine Treffer in deiner Welt.',
  'home.loosen': 'Prefs lockern',
  'home.toMatch': 'Zum Match →',
  'feat.prefs': 'Preference-first',
  'feat.prefsText': 'Hard-Filter vor jeder Karte — Land, Sprache, Branche, Typ, Gehalt, Skills.',
  'feat.match': 'Explainable Match %',
  'feat.matchText': 'Skills / Land / Sprache / Gehalt / Typ — transparent, kein Black-Box-Spam.',
  'feat.sources': 'Ehrliche Quellen',
  'feat.sourcesText': 'Keine inoffiziellen Scrapes. Aggregatoren nur als API/Partner-Stubs.',
  'mein.kicker': 'Mein Bereich',
  'mein.title': 'Dein persönlicher Hub',
  'mein.lead':
    'Radius, Prefs, Skills mit Selbsteinschätzung, Nachweise — lokal auf diesem Gerät. Sprache hier umschalten.',
  'mein.radius': 'Suchradius',
  'mein.radiusHint': 'Wie weit du für Vor-Ort-Jobs reisen magst (km). Remote bleibt unabhängig.',
  'mein.km': 'km',
  'mein.seeker': 'Jobsuche-Prefs',
  'mein.employer': 'Arbeitgeber-Prefs',
  'mein.skills': 'Skills & Sterne',
  'mein.skillsHint': '1–5 Sterne Selbsteinschätzung. Wird beim 1-Tap-Interesse mitgeschickt.',
  'mein.skillAdd': 'Skill hinzufügen',
  'mein.docs': 'Nachweise',
  'mein.docsHint':
    'Qualifikationen, Zertifikate, Fortbildungen — Datei wählen (Kamera/Galerie/Files). Demo: Metadaten in localStorage, kein Server.',
  'mein.qual': 'Qualifikation',
  'mein.cert': 'Zertifikat',
  'mein.train': 'Fortbildung',
  'mein.language': 'Sprache',
  'mein.languageHint': 'DE und EN sind vollständig. ES / FR / PL sind Stubs (UI fällt auf EN zurück).',
  'mein.completeness': 'Profilvollständigkeit',
  'mein.favorites': 'Favoriten',
  'mein.calendar': 'Lokaler Kalender',
  'mein.rewards': 'Orbit Credits',
  'match.kicker': 'Match Finder',
  'match.jobs': 'Jobs swipen',
  'match.candidates': 'Kandidaten swipen',
  'match.needPrefs': 'Zuerst Prefs setzen',
  'match.needPrefsHint': 'Orbit filtert den Feed hard — ohne Prefs kein Match-Deck.',
  'match.openPrefs': 'Prefs öffnen',
  'match.skip': 'Skip',
  'match.interest': 'Interesse',
  'match.empty': 'Deck leer',
  'match.emptyHint': 'Prefs lockern oder später wiederkommen — neue Inserate landen hier.',
  'match.explain': 'Match erklären',
  'match.hideScore': 'Score ausblenden',
  'match.mutual': 'Mutual Match!',
  'apply.interest': 'Interesse',
  'apply.oneTap': '1-Tap Interesse',
  'apply.shares': 'Teilt Profil, Skills und Nachweise — kein Anschreiben-Marathon.',
  'apply.sent': 'Interesse gesendet',
  'apply.sentHint': 'Profilpaket liegt im Chat. Als Nächstes: Interview-Raum oder Termin.',
  'apply.chat': 'Zum Chat',
  'apply.interview': 'Interview',
  'speak.label': 'Vorlesen',
  'speak.stop': 'Stopp',
  'speak.unsupported': 'Vorlesen wird von diesem Browser nicht unterstützt.',
  'photo.title': 'Firma fotografieren',
  'photo.lead':
    'Foto von Ladenfront oder Büro — Demo-Vision schätzt den Firmennamen und zeigt offene Jobs in der Nähe.',
  'photo.disclaimer':
    'Kein echtes Computer Vision. Treffer sind Demo-Daten. Später: On-Device- oder Partner-Vision.',
  'photo.camera': 'Kamera',
  'photo.gallery': 'Galerie',
  'photo.analyze': 'Analysieren (Demo)',
  'photo.guess': 'Geschätzter Name',
  'photo.jobs': 'Offene Jobs in der Nähe',
  'interview.title': 'Interview',
  'interview.lead': 'Chat-Raum, Termin wählen, Video-Call-Platzhalter. Echtes Calling braucht später einen Provider.',
  'interview.chat': 'Chat-Interview',
  'interview.schedule': 'Termin wählen',
  'interview.video': 'Video-Call (Stub)',
  'interview.videoHint':
    'Lokale Kameravorschau. Live-Calls brauchen Daily, Twilio oder LiveKit — hier bewusst nur ein Stub.',
  'interview.confirm': 'Slot bestätigen',
  'interview.botIntro': 'Hallo — kurzes Orbit-Interview (Demo). Drei Fragen, dann Termin oder Video-Stub.',
  'reviews.title': 'Erfahrungen',
  'reviews.lead': 'App, Firmen, erledigte Jobs, Agentur ↔ Auftraggeber. Sterne + Kurztext, lokal gespeichert.',
  'reviews.app': 'Orbit App',
  'reviews.company': 'Firma',
  'reviews.job': 'Job',
  'reviews.agency': 'Agentur ↔ Auftraggeber',
  'reviews.submit': 'Bewertung senden',
  'reviews.thanks': 'Danke — Credits für faires Feedback (Demo).',
  'rewards.welcome': 'Willkommensbonus',
  'rewards.welcomeHint': '+50 Orbit Credits beim ersten Öffnen. Demo, kein echtes Geld.',
  'stub.banner': 'Diese Sprache ist ein Stub — Oberfläche auf Englisch, bis die Übersetzung steht.',
  'footer.impressum': 'Impressum',
  'footer.privacy': 'Datenschutz',
  'footer.terms': 'AGB',
  'mehr.title': 'Mehr',
  'mehr.lead': 'Quellen, Interviews, Foto-Jobs, Event-Sektor (archiviert), Ideen, Wallet, Legal.',
  'mehr.event': 'Sektor Event / VT',
  'mehr.eventHint': 'Archiv-Modul — eine Branche unter vielen, nicht die Startseite.',
}

const enDict: Dict = {
  'skip.toContent': 'Skip to content',
  'nav.home': 'Home',
  'nav.match': 'Match',
  'nav.mein': 'Me',
  'nav.inbox': 'Inbox',
  'nav.mehr': 'More',
  'nav.create': 'Create',
  'nav.login': 'Log in',
  'brand.tagline': 'Matching, not spam',
  'brand.loading': 'Loading Orbit…',
  'home.kicker': 'Orbit · Job Matching OS',
  'home.title': 'Your orbit for work —',
  'home.titleAccent': 'Matching, not spam',
  'home.lead':
    'Global, all-industry: IT, care, retail, logistics, hospitality, admin, mini-jobs — Event/VT is one sector among many. Prefs first, then swipe.',
  'home.matchOpen': 'Open Match Finder',
  'home.matchHint': 'Tinder-style cards with an explainable Match %.',
  'home.swipe': 'Start swiping',
  'home.prefsSetup': 'Set up prefs',
  'home.prefsAdjust': 'Adjust prefs',
  'home.prefsHint': 'Countries, languages, industries, type, remote, pay, skills — hard filters before the feed.',
  'home.wizard': 'Start wizard',
  'home.demo': 'Start demo',
  'home.dashboard': 'Dashboard',
  'home.postJob': 'Post a job',
  'home.photoJobs': 'Photograph a company',
  'home.stats.jobs': 'Jobs live',
  'home.stats.requests': 'Requests',
  'home.stats.bookings': 'Bookings',
  'home.world': 'Your world',
  'home.worldHint': 'Tailored from prefs + local behaviour (views, swipes, applies). Noise that does not match is hidden.',
  'home.worldEmpty': 'Nothing in your world yet.',
  'home.loosen': 'Loosen prefs',
  'home.toMatch': 'Go to Match →',
  'feat.prefs': 'Preference-first',
  'feat.prefsText': 'Hard filters before every card — country, language, industry, type, pay, skills.',
  'feat.match': 'Explainable Match %',
  'feat.matchText': 'Skills / country / language / pay / type — transparent, not a black box.',
  'feat.sources': 'Honest sources',
  'feat.sourcesText': 'No unofficial scrapes. Aggregators as API/partner stubs only.',
  'mein.kicker': 'My space',
  'mein.title': 'Your personal hub',
  'mein.lead':
    'Radius, prefs, self-rated skills, certificates — stored locally on this device. Switch language here.',
  'mein.radius': 'Search radius',
  'mein.radiusHint': 'How far you will travel for on-site jobs (km). Remote stays independent.',
  'mein.km': 'km',
  'mein.seeker': 'Job-seeker prefs',
  'mein.employer': 'Employer prefs',
  'mein.skills': 'Skills & stars',
  'mein.skillsHint': '1–5 star self-rating. Shared with one-tap Interest.',
  'mein.skillAdd': 'Add skill',
  'mein.docs': 'Documents',
  'mein.docsHint':
    'Qualifications, certificates, training — pick a file (camera/gallery/files). Demo: metadata in localStorage, no server.',
  'mein.qual': 'Qualification',
  'mein.cert': 'Certificate',
  'mein.train': 'Training',
  'mein.language': 'Language',
  'mein.languageHint': 'DE and EN are complete. ES / FR / PL are stubs (UI falls back to English).',
  'mein.completeness': 'Profile completeness',
  'mein.favorites': 'Favorites',
  'mein.calendar': 'Local calendar',
  'mein.rewards': 'Orbit Credits',
  'match.kicker': 'Match Finder',
  'match.jobs': 'Swipe jobs',
  'match.candidates': 'Swipe candidates',
  'match.needPrefs': 'Set prefs first',
  'match.needPrefsHint': 'Orbit hard-filters the feed — no prefs, no deck.',
  'match.openPrefs': 'Open prefs',
  'match.skip': 'Skip',
  'match.interest': 'Interest',
  'match.empty': 'Deck empty',
  'match.emptyHint': 'Loosen prefs or come back later — new listings land here.',
  'match.explain': 'Explain match',
  'match.hideScore': 'Hide score',
  'match.mutual': 'Mutual match!',
  'apply.interest': 'Interest',
  'apply.oneTap': '1-tap Interest',
  'apply.shares': 'Shares profile, skills and documents — no cover-letter marathon.',
  'apply.sent': 'Interest sent',
  'apply.sentHint': 'Profile pack is in chat. Next: interview room or a time slot.',
  'apply.chat': 'Open chat',
  'apply.interview': 'Interview',
  'speak.label': 'Read aloud',
  'speak.stop': 'Stop',
  'speak.unsupported': 'Read-aloud is not supported in this browser.',
  'photo.title': 'Photograph a company',
  'photo.lead':
    'Photo of a storefront or office — demo vision guesses the company name and shows nearby open jobs.',
  'photo.disclaimer':
    'Not real computer vision. Matches are demo data. Later: on-device or partner vision.',
  'photo.camera': 'Camera',
  'photo.gallery': 'Gallery',
  'photo.analyze': 'Analyze (demo)',
  'photo.guess': 'Guessed name',
  'photo.jobs': 'Open jobs nearby',
  'interview.title': 'Interview',
  'interview.lead': 'Chat room, pick a slot, video-call placeholder. Real calling needs a provider later.',
  'interview.chat': 'Chat interview',
  'interview.schedule': 'Pick a slot',
  'interview.video': 'Video call (stub)',
  'interview.videoHint':
    'Local camera preview. Live calls need Daily, Twilio or LiveKit — this is an honest stub.',
  'interview.confirm': 'Confirm slot',
  'interview.botIntro': 'Hi — short Orbit interview (demo). Three questions, then a slot or the video stub.',
  'reviews.title': 'Experiences',
  'reviews.lead': 'App, companies, completed jobs, agency ↔ client. Stars + short text, stored locally.',
  'reviews.app': 'Orbit app',
  'reviews.company': 'Company',
  'reviews.job': 'Job',
  'reviews.agency': 'Agency ↔ client',
  'reviews.submit': 'Submit review',
  'reviews.thanks': 'Thanks — credits for fair feedback (demo).',
  'rewards.welcome': 'Welcome bonus',
  'rewards.welcomeHint': '+50 Orbit Credits on first open. Demo, not real money.',
  'stub.banner': 'This language is a stub — UI in English until a full translation ships.',
  'footer.impressum': 'Legal notice',
  'footer.privacy': 'Privacy',
  'footer.terms': 'Terms',
  'mehr.title': 'More',
  'mehr.lead': 'Sources, interviews, photo jobs, Event sector (archived), ideas, wallet, legal.',
  'mehr.event': 'Event / VT sector',
  'mehr.eventHint': 'Archive module — one industry among many, not the home screen.',
}

const dicts: Record<'de' | 'en', Dict> = { de: deDict, en: enDict }

const dateLocales: Record<Locale, DateFnsLocale> = {
  de,
  en: enUS,
  es,
  fr,
  pl,
}

function loadLocale(): Locale {
  try {
    const raw = localStorage.getItem(KEY)
    if (raw && LOCALES.some((l) => l.id === raw)) return raw as Locale
  } catch {
    /* ignore */
  }
  const nav = typeof navigator !== 'undefined' ? navigator.language.slice(0, 2) : 'de'
  if (nav === 'en') return 'en'
  if (nav === 'es') return 'es'
  if (nav === 'fr') return 'fr'
  if (nav === 'pl') return 'pl'
  return 'de'
}

function applyDocumentLang(locale: Locale) {
  if (typeof document === 'undefined') return
  document.documentElement.lang = locale === 'de' ? 'de' : locale
}

interface I18nValue {
  locale: Locale
  resolved: 'de' | 'en'
  stub: boolean
  setLocale: (l: Locale) => void
  t: (key: string) => string
  dateLocale: DateFnsLocale
}

const I18nContext = createContext<I18nValue | null>(null)

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>(() =>
    typeof window === 'undefined' ? 'de' : loadLocale(),
  )

  useEffect(() => {
    applyDocumentLang(locale)
  }, [locale])

  const meta = LOCALES.find((l) => l.id === locale) ?? LOCALES[0]
  const resolved: 'de' | 'en' = locale === 'de' ? 'de' : 'en'

  const setLocale = useCallback((l: Locale) => {
    setLocaleState(l)
    try {
      localStorage.setItem(KEY, l)
    } catch {
      /* ignore */
    }
    applyDocumentLang(l)
    window.dispatchEvent(new CustomEvent(EVT))
  }, [])

  const t = useCallback(
    (key: string) => {
      const dict = dicts[resolved]
      return dict[key] ?? deDict[key] ?? key
    },
    [resolved],
  )

  const value = useMemo<I18nValue>(
    () => ({
      locale,
      resolved,
      stub: Boolean(meta.stub),
      setLocale,
      t,
      dateLocale: dateLocales[locale],
    }),
    [locale, resolved, meta.stub, setLocale, t],
  )

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>
}

export function useI18n() {
  const ctx = useContext(I18nContext)
  if (!ctx) throw new Error('useI18n must be used within I18nProvider')
  return ctx
}

export function tStatic(key: string, locale?: Locale) {
  const l = locale ?? (typeof document !== 'undefined' ? (document.documentElement.lang as Locale) : 'de')
  const resolved: 'de' | 'en' = l === 'de' ? 'de' : 'en'
  return dicts[resolved][key] ?? deDict[key] ?? key
}
