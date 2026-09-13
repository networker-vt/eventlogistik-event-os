import { useEffect, type ComponentType } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Bike,
  BookOpen,
  Briefcase,
  Building2,
  FileText,
  GraduationCap,
  Hotel,
  LayoutDashboard,
  Library,
  Package,
  Scale,
  Sparkles,
  Truck,
  UserRound,
  FolderKanban,
  Heart,
  Wallet,
  Lightbulb,
  Cable,
  Gift,
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
    id: 'marktplatz',
    title: 'Marktplatz',
    subtitle: 'Angebot & Gesuch in allen Verticals',
    accent: 'border-cyan/35 bg-cyan/5',
    links: [
      { to: '/freelancer', label: 'Freelancer', hint: 'Crew & Technik', icon: UserRound },
      { to: '/firmen', label: 'Firmen', hint: 'Technikfirmen', icon: Building2 },
      { to: '/material', label: 'Material', hint: 'Gear & Rental', icon: Package },
      { to: '/transporter', label: 'Transporter', hint: 'LKW & Trailer', icon: Truck },
      { to: '/kuriere', label: 'Kuriere', hint: 'Schnell & lokal', icon: Bike },
      { to: '/hotels', label: 'Hotels', hint: 'Crew-Unterkunft', icon: Hotel },
    ],
  },
  {
    id: 'katalog',
    title: 'Katalog',
    subtitle: 'Öffentliche Branchendaten — recherchieren, nicht buchen',
    accent: 'border-teal/35 bg-teal/5',
    links: [
      { to: '/katalog/firmen', label: 'Firmenverzeichnis', icon: Library },
      { to: '/katalog/locations', label: 'Locations', icon: Building2 },
      { to: '/katalog/transporteure', label: 'Transporteure', icon: Truck },
      { to: '/katalog/fahrzeuggroessen', label: 'Größen', hint: 'Fahrzeugklassen', icon: Package },
      { to: '/katalog/plattformen', label: 'Plattformen', icon: Sparkles },
    ],
  },
  {
    id: 'innovation',
    title: 'Innovation',
    subtitle: 'KI · XR · LED · Audio — kuratierte Fachnews',
    accent: 'border-violet-500/35 bg-violet-500/5',
    links: [{ to: '/innovation', label: 'Innovation Hub', hint: 'News & Trends', icon: Sparkles }],
  },
  {
    id: 'wissen',
    title: 'Wissen',
    subtitle: 'Medien & Fortbildung für die Branche',
    accent: 'border-amber-500/35 bg-amber-500/5',
    links: [
      { to: '/wissen/medien', label: 'Medien', hint: 'Fachpresse', icon: BookOpen },
      { to: '/wissen/fortbildung', label: 'Fortbildung', hint: 'Lehrgänge', icon: GraduationCap },
    ],
  },
  {
    id: 'account',
    title: 'Account & Ops',
    subtitle: 'Dashboard, Projekte, Profil, Legal',
    accent: 'border-border bg-surface-2/60',
    links: [
      { to: '/mein', label: 'Mein Bereich', hint: 'Favoriten', icon: Heart },
      { to: '/wallet', label: 'Wallet', hint: 'Zahlungen · Demo', icon: Wallet },
      { to: '/ideen', label: 'Ideen-Box', hint: 'Feedback an den Operator', icon: Lightbulb },
      { to: '/integrationen', label: 'Integrationen', hint: 'easyjob, Crewbrain, Rentman', icon: Cable },
      { to: '/empfehlen', label: 'Empfehlen', hint: 'Referral-Credits', icon: Gift },
      { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/projects/new', label: 'Projekte', hint: 'Neues Event-Projekt', icon: FolderKanban },
      { to: '/jobs', label: 'Jobs', hint: 'Seek & Hire', icon: Briefcase },
      { to: '/profile', label: 'Profil', icon: UserRound },
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
          Marktplatz, Katalog, Innovation, Wissen & Account — alles an einem Ort.
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
