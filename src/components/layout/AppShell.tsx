import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  ChevronDown,
  Home,
  Hotel,
  MessageSquare,
  MoreHorizontal,
  Package,
  Plus,
  Truck,
  Bike,
  UserRound,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import { PwaInstallBanner } from './PwaInstallBanner'
import { CreateSheet } from './CreateSheet'
import { BrandIcon, BrandMark } from '../brand/BrandMark'
import { IdeenFab } from '../ideas/IdeenFab'
import { copyrightLine } from '../../lib/legal'

const mobileNav = [
  { to: '/', label: 'Home', icon: Home, end: true },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '__create__', label: 'Erstellen', icon: Plus, create: true },
  { to: '/messages', label: 'Inbox', icon: MessageSquare },
  { to: '/mehr', label: 'Mehr', icon: MoreHorizontal },
] as const

const marketplaceLinks = [
  { to: '/freelancer', label: 'Freelancer', icon: UserRound },
  { to: '/firmen', label: 'Firmen', icon: Building2 },
  { to: '/material', label: 'Material', icon: Package },
  { to: '/transporter', label: 'Transporter', icon: Truck },
  { to: '/kuriere', label: 'Kuriere', icon: Bike },
  { to: '/hotels', label: 'Hotels', icon: Hotel },
]

const desktopPrimary = [
  { to: '/', label: 'Home', end: true },
  { to: '/jobs', label: 'Jobs' },
]

const desktopSecondary = [
  { to: '/katalog/firmen', label: 'Katalog' },
  { to: '/innovation', label: 'Innovation' },
  { to: '/wissen/medien', label: 'Wissen' },
  { to: '/messages', label: 'Messages' },
]

export function AppShell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [createOpen, setCreateOpen] = useState(false)
  const [marketOpen, setMarketOpen] = useState(false)

  const marketActive = marketplaceLinks.some((l) => location.pathname.startsWith(l.to))

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col overflow-x-hidden">
      {/* Desktop top nav */}
      <header className="sticky top-0 z-30 hidden border-b border-border bg-surface/95 backdrop-blur md:block">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-2 flex shrink-0 items-center gap-2 text-left"
            aria-label="LoadIn Start"
          >
            <BrandIcon size={36} />
            <div className="leading-tight">
              <div className="font-bold tracking-tight text-white">LoadIn</div>
              <div className="text-[10px] uppercase tracking-wider text-cyan">Crew · Gigs · Gear</div>
            </div>
          </button>

          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5">
            {desktopPrimary.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white',
                    isActive && 'bg-cyan/10 text-cyan',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}

            <div
              className="relative"
              onMouseEnter={() => setMarketOpen(true)}
              onMouseLeave={() => setMarketOpen(false)}
            >
              <button
                type="button"
                onClick={() => setMarketOpen((v) => !v)}
                className={cn(
                  'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white',
                  (marketOpen || marketActive) && 'bg-cyan/10 text-cyan',
                )}
                aria-expanded={marketOpen}
                aria-haspopup="menu"
              >
                Marktplatz <ChevronDown size={14} className={cn('transition', marketOpen && 'rotate-180')} />
              </button>
              {marketOpen && (
                <div
                  role="menu"
                  className="absolute left-0 top-full z-40 min-w-[14rem] rounded-xl border border-border bg-surface-2 py-2 shadow-xl"
                >
                  {marketplaceLinks.map((item) => (
                    <Link
                      key={item.to}
                      to={item.to}
                      role="menuitem"
                      onClick={() => setMarketOpen(false)}
                      className="flex items-center gap-2 px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5 hover:text-white"
                    >
                      <item.icon size={16} className="text-cyan" />
                      {item.label}
                    </Link>
                  ))}
                  <div className="my-1 border-t border-border" />
                  <Link
                    to="/mehr#marktplatz"
                    onClick={() => setMarketOpen(false)}
                    className="block px-3 py-2 text-xs text-muted hover:text-cyan"
                  >
                    Alle Verticals unter Mehr →
                  </Link>
                </div>
              )}
            </div>

            {desktopSecondary.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white',
                    isActive && 'bg-cyan/10 text-cyan',
                  )
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => navigate('/listings/new?vertical=job')}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-cyan px-3 py-2 text-sm font-semibold text-black"
            >
              <Plus size={16} /> Neu
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="tap-target rounded-full border border-border bg-surface-3 px-3 py-2 text-sm"
              >
                {user.name.split(' ')[0]}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="tap-target rounded-full bg-cyan/15 px-3 py-2 text-sm text-cyan"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur safe-pt md:hidden">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex min-h-11 items-center gap-2"
        >
          <BrandMark compact />
        </button>
        <div className="flex items-center gap-2">
          {user ? (
            <button
              type="button"
              onClick={() => navigate('/profile')}
              className="tap-target rounded-full border border-border bg-surface-3 px-3 py-2 text-sm"
            >
              {user.name.split(' ')[0]}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="tap-target rounded-full bg-cyan/15 px-3 py-2 text-sm text-cyan"
            >
              Login
            </button>
          )}
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col pb-app-chrome">
        <main className="flex-1 px-4 py-4 md:px-6 md:py-6 max-md:pb-2">
          <div key={location.pathname + location.search} className="page-enter">
            <Outlet />
          </div>
          <footer className="mt-10 space-y-3 border-t border-border pt-4 text-xs text-muted">
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <Link to="/impressum" className="hover:text-cyan">
                Impressum
              </Link>
              <Link to="/datenschutz" className="hover:text-cyan">
                Datenschutz
              </Link>
              <Link to="/agb" className="hover:text-cyan">
                AGB
              </Link>
              <Link to="/ideen" className="hover:text-cyan">
                Ideen-Box
              </Link>
              <Link to="/integrationen" className="hover:text-cyan">
                Integrationen
              </Link>
              <Link to="/empfehlen" className="hover:text-cyan">
                Empfehlen
              </Link>
              <Link to="/mehr" className="hover:text-cyan md:hidden">
                Mehr
              </Link>
              <Link to="/mein" className="hover:text-cyan">
                Favoriten
              </Link>
              <Link to="/wallet" className="hover:text-cyan">
                Wallet
              </Link>
            </div>
            <p>{copyrightLine()}</p>
          </footer>
        </main>
      </div>

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
      <IdeenFab />
      <PwaInstallBanner />

      {/* Mobile bottom nav — max 5 */}
      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 safe-pb backdrop-blur md:hidden">
        {mobileNav.map((item) => {
          if ('create' in item && item.create) {
            return (
              <button
                key="create"
                type="button"
                aria-label="Erstellen"
                onClick={() => setCreateOpen(true)}
                className="relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 text-[10px] text-neutral-500 touch-manipulation"
              >
                <span className="-mt-5 flex h-12 w-12 items-center justify-center rounded-full bg-cyan text-black shadow-lg glow-cyan">
                  <Plus size={26} strokeWidth={2.5} />
                </span>
                <span className="sr-only">Erstellen</span>
              </button>
            )
          }
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={'end' in item ? item.end : false}
              className={({ isActive }) =>
                cn(
                  'relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 text-[10px] text-neutral-500 touch-manipulation transition-colors duration-200',
                  isActive && 'text-cyan',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <span
                    className={cn(
                      'absolute top-0 h-0.5 w-6 rounded-full bg-cyan transition-all duration-200',
                      isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                    )}
                  />
                  <item.icon
                    size={22}
                    className={cn('transition-transform duration-200', isActive && 'scale-110')}
                  />
                  {item.label}
                </>
              )}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}
