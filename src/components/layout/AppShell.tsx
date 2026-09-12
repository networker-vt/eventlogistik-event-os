import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Building2,
  Home,
  Hotel,
  LayoutDashboard,
  MessageSquare,
  Package,
  PlusCircle,
  Truck,
  UserRound,
  Bike,
  Search,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../lib/auth'

const nav = [
  { to: '/', label: 'Entdecken', icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
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
  { to: '/jobs', label: 'Jobs', icon: Briefcase },
]

export function AppShell() {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col md:flex-row">
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
                  'flex items-center gap-2 rounded-xl px-3 py-2.5 text-sm text-neutral-300 hover:bg-white/5',
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
                  'flex items-center gap-2 rounded-xl px-3 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-white',
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
            onClick={() => navigate('/listings/new')}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-cyan px-3 py-2.5 text-sm font-semibold text-black"
          >
            <PlusCircle size={16} /> Inserat erstellen
          </button>
          {!user && (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="w-full rounded-xl border border-border px-3 py-2 text-sm text-neutral-300 hover:border-cyan/40"
            >
              Anmelden
            </button>
          )}
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col pb-20 md:pb-0">
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur md:px-6">
          <div className="flex items-center gap-2 md:hidden">
            <span className="text-cyan">⚡</span>
            <span className="font-semibold">EventLogistik</span>
          </div>
          <div className="hidden items-center gap-2 text-sm text-muted md:flex">
            <Search size={16} />
            <span>Marketplace · Matching · Ops Lite</span>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/profile')}
                className="rounded-full border border-border bg-surface-3 px-3 py-1.5 text-sm"
              >
                {user.name.split(' ')[0]}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="rounded-full bg-cyan/15 px-3 py-1.5 text-sm text-cyan"
              >
                Login
              </button>
            )}
          </div>
        </header>

        <main className="flex-1 px-4 py-4 md:px-6 md:py-6">
          <Outlet />
        </main>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-4 border-t border-border bg-surface/95 safe-pb backdrop-blur md:hidden">
        {nav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) =>
              cn(
                'flex flex-col items-center gap-1 py-2 text-[11px] text-neutral-500',
                isActive && 'text-cyan',
              )
            }
          >
            <item.icon size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
