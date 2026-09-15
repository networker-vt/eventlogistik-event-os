import { useEffect, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  BookOpen,
  Briefcase,
  Cable,
  FileText,
  Gift,
  GraduationCap,
  Heart,
  Library,
  Lightbulb,
  Scale,
  SlidersHorizontal,
  Sparkles,
  Wallet,
} from 'lucide-react'

type HubLink = {
  to: string
  label: string
  hint?: string
  icon: ComponentType<{ size?: number; className?: string }>
}

type HubSection = {
  id: string
  title: string
  subtitle: string
  accent: string
  links: HubLink[]
}

const sections: HubSection[] = [
  {
    id: 'quellen',
    title: 'Quellen',
    subtitle: 'Aggregatoren & Partner — keine inoffiziellen Scrapes',
    accent: 'border-cyan/35 bg-cyan/5',
    links: [
      { to: '/quellen', label: 'Quellen / Aggregatoren', hint: 'LinkedIn, StepStone, Indeed…', icon: Cable },
      { to: '/prefs', label: 'Prefs', hint: 'Hard-Filter Wizard', icon: SlidersHorizontal },
      { to: '/match', label: 'Match Finder', hint: 'Swipe Jobs & Kandidaten', icon: Heart },
      { to: '/jobs', label: 'Jobs Liste', hint: 'Klassische Liste', icon: Briefcase },
    ],
  },
  {
    id: 'sektor-event',
    title: 'Sektor Event / VT',
    subtitle: 'Alter Katalog & Marketplace — eine Branche unter vielen',
    accent: 'border-teal/35 bg-teal/5',
    links: [
      { to: '/katalog/firmen', label: 'Katalog Firmen', hint: 'Branchendaten VT', icon: Library },
      { to: '/katalog/locations', label: 'Locations', icon: Library },
      { to: '/freelancer', label: 'Freelancer VT', icon: Briefcase },
      { to: '/material', label: 'Material / Gear', icon: Briefcase },
      { to: '/transporter', label: 'Transporter', icon: Briefcase },
      { to: '/innovation', label: 'Innovation', hint: 'KI · XR · LED', icon: Sparkles },
    ],
  },
  {
    id: 'ideen',
    title: 'Ideen & Wachstum',
    subtitle: 'Feedback, Referral, Credits',
    accent: 'border-violet-500/35 bg-violet-500/5',
    links: [
      { to: '/ideen', label: 'Ideen-Box', hint: 'Feedback an den Operator', icon: Lightbulb },
      { to: '/empfehlen', label: 'Empfehlen', hint: 'Orbit Credits verdienen', icon: Gift },
      { to: '/wallet', label: 'Wallet & Credits', hint: 'Credits ↔ EUR Demo', icon: Wallet },
    ],
  },
  {
    id: 'wissen',
    title: 'Wissen',
    subtitle: 'Medien & Fortbildung',
    accent: 'border-amber-500/35 bg-amber-500/5',
    links: [
      { to: '/wissen/medien', label: 'Medien', icon: BookOpen },
      { to: '/wissen/fortbildung', label: 'Fortbildung', icon: GraduationCap },
    ],
  },
  {
    id: 'legal',
    title: 'Legal & Account',
    subtitle: 'Impressum Mirco Küßner · Datenschutz · AGB',
    accent: 'border-border bg-surface-2/60',
    links: [
      { to: '/mein', label: 'Mein Bereich', hint: 'Favoriten & Kalender', icon: Heart },
      { to: '/impressum', label: 'Impressum', icon: FileText },
      { to: '/datenschutz', label: 'Datenschutz', icon: Scale },
      { to: '/agb', label: 'AGB', icon: FileText },
    ],
  },
]

export function MehrPage() {
  const { hash } = useLocation()
  useEffect(() => {
    if (!hash) return
    const id = hash.replace(/^#/, '')
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [hash])

  return (
    <div className="space-y-6 pb-scroll-chrome">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold tracking-tight">Mehr</h1>
        <p className="text-sm text-muted">
          Quellen, Sektor Event/VT, Ideen, Empfehlen, Wallet, Wissen, Legal.
        </p>
      </header>

      {sections.map((section) => (
        <section
          key={section.id}
          id={section.id}
          className={`scroll-mt-20 rounded-2xl border p-4 md:p-5 ${section.accent}`}
        >
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-white">{section.title}</h2>
            <p className="text-xs text-neutral-400">{section.subtitle}</p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {section.links.map((link) => (
              <Link
                key={link.to + link.label}
                to={link.to}
                className="card-hover flex min-h-12 items-center gap-3 rounded-xl border border-border/80 bg-black/25 px-3 py-3"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-surface-3 text-cyan">
                  <link.icon size={18} />
                </span>
                <span className="min-w-0">
                  <span className="block text-sm font-medium text-white">{link.label}</span>
                  {link.hint && (
                    <span className="block truncate text-[11px] text-muted">{link.hint}</span>
                  )}
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
