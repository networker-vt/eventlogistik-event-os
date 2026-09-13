import { NavLink, Outlet } from 'react-router-dom'
import { cn } from '../../lib/utils'
import { CatalogDisclaimer } from '../../components/katalog/CatalogDisclaimer'
import {
  CATALOG_COMPANY_COUNT,
  CATALOG_TRANSPORTER_COUNT,
  CATALOG_VENUE_COUNT,
  catalogPlatforms,
  vehicleSizes,
} from '../../data/catalog'

const tabs = [
  { to: '/katalog/firmen', label: `Firmen (${CATALOG_COMPANY_COUNT})` },
  { to: '/katalog/locations', label: `Locations (${CATALOG_VENUE_COUNT})` },
  { to: '/katalog/transporteure', label: `Transporteure (${CATALOG_TRANSPORTER_COUNT})` },
  { to: '/katalog/fahrzeuggroessen', label: `Fahrzeuggrößen (${vehicleSizes.length})` },
  { to: '/katalog/plattformen', label: `Plattformen (${catalogPlatforms.length})` },
]

export function KatalogLayout() {
  return (
    <div className="space-y-5 pb-scroll-chrome">
      <div className="relative overflow-hidden rounded-3xl border border-border surface-shine p-5">
        <div className="pointer-events-none absolute -right-8 -top-8 h-28 w-28 rounded-full bg-teal/15 blur-3xl" />
        <p className="text-sm font-medium text-teal">📚 Öffentlicher Katalog</p>
        <h1 className="text-2xl font-bold tracking-tight">Business-Verzeichnis</h1>
        <p className="mt-1 max-w-2xl text-sm text-neutral-300">
          Firmendaten aus öffentlichen Verzeichnissen und Impressum-Angaben — kein Scraping privater
          Profile. Badge <span className="text-teal">Katalog</span> = öffentliche Business-Kontakte.
        </p>
      </div>
      <CatalogDisclaimer />
      <nav className="flex gap-2 overflow-x-auto pb-1">
        {tabs.map((t) => (
          <NavLink
            key={t.to}
            to={t.to}
            className={({ isActive }) =>
              cn(
                'shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium text-neutral-300',
                isActive ? 'border-teal/50 bg-teal/15 text-teal' : 'border-border hover:border-teal/30',
              )
            }
          >
            {t.label}
          </NavLink>
        ))}
      </nav>
      <Outlet />
    </div>
  )
}
