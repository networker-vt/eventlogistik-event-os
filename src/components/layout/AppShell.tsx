import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  Home,
  Hotel,
  LayoutDashboard,
  MessageSquare,
  Package,
  Plus,
  Truck,
  UserRound,
  Bike,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import { PwaInstallBanner } from './PwaInstallBanner'

const nav = [
  { to: '/', label: 'Entdecken', icon: Home },
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
  { to: '/dashboard', label: 'Board', icon: LayoutDashboard },
  { to: '/messages', label: 'Chat', icon: MessageSquare },
  { to: '/profile', label: 'Profil', icon: UserRound },
]

const modules = [
  { to: '/freelancer', label: 'Freelancer', icon: UserRound },
  { to: '/firmen', label: 'Firmen', icon: Building2 },
  { to: '/material', label: 'Material', icon: Package },
  { to: '/transporter', label: 'Transporter', icon: Truck },
  { to: '/kuriere', label: 'Kuriere', icon: Bike },
  { to: '/hotels', label: 'Hotels', icon: Hotel },
  { to: '/jobs', label: 'Jobs & Gigs', icon: Briefcase },
]

export function AppShell() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const hideFab =
    location.pathname.startsWith('/listings/new') ||
    location.pathname.startsWith('/messages/') ||
    location.pathname.startsWith('/auth')

  return (
    <div className="mx-auto flex min-h-dvh max-w-6xl flex-col overflow-x-hidden md:flex-row">
      <aside className="hidden w-64 shrink-0 border-r border-border bg-surface-2/80 p-4 md:flex md:flex-col">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="mb-6 flex items-center gap-2 px-2 text-left"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-cyan/15 text-lg">⚡</span>
          <div>
            <div className="font-bold tracking-tight text-white">EventLogistik</div>
            <div className="text-[11px] uppercase tracking-wider text-cyan">Event-OS</div>
          </div>
        </button>

        <p className="mb-2 px-2 text-[11px] uppercase tracking-wider text-muted">Navigation</p>
        <nav className="space-y-1">
          {nav.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex min-h-11 items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5',
                  isActive && 'bg-cyan/10 text-cyan',
                )
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <p className="mb-2 mt-6 px-2 text-[11px] uppercase tracking-wider text-muted">Module</p>
        <nav className="space-y-1 overflow-y-auto">
          {modules.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex min-h-10 items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-white',
                  isActive && 'bg-teal/10 text-teal',
                )
              }
            >
              <item.icon size={16} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="mt-auto space-y-2 pt-6">
          <button
            type="button"
            onClick={() => navigate('/listings/new?vertical=job')}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan px-3 py-2.5 text-sm font-semibold text-black"
          >
            <Plus size={16} /> Job / Inserat
          </button>
          {!user && (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="min-h-11 w-full rounded-xl border border-border px-3 py-2 text-sm text-neutral-300 hover:border-cyan/40"
            >
              Anmelden
            </button>
          )}
          <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 pt-2 text-[11px] text-muted">
            <Link to="/impressum" className="hover:text-cyan">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-cyan">Datenschutz</Link>
            <Link to="/agb" className="hover:text-cyan">AGB</Link>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-[4.75rem] md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur safe-pt md:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="flex min-h-11 items-center gap-2 md:hidden"
          >
            <span className="text-cyan">⚡</span>
            <span className="font-semibold">EventLogistik</span>
          </button>
          <div className="hidden text-sm text-muted md:block">
            Marketplace · Jobs · Matching · Ops
          </div>
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

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <Outlet />
          <footer className="mt-10 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-muted md:hidden">
            <Link to="/impressum" className="hover:text-cyan">Impressum</Link>
            <Link to="/datenschutz" className="hover:text-cyan">Datenschutz</Link>
            <Link to="/agb" className="hover:text-cyan">AGB</Link>
          </footer>
        </main>
      </div>

      {!hideFab && (
        <button
          type="button"
          aria-label="Inserat erstellen"
          onClick={() => navigate('/listings/new')}
          className="fixed bottom-[5.25rem] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-cyan text-black shadow-lg glow-cyan md:hidden"
        >
          <Plus size={26} strokeWidth={2.5} />
        </button>
      )}

      <PwaInstallBanner />

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 safe-pb backdrop-blur md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 text-[10px] text-neutral-500 touch-manipulation',
                isActive && 'text-cyan',
              )
            }
          >
            <item.icon size={22} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
