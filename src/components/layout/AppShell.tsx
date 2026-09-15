import { useState } from 'react'
import { Link, NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'
import {
  Briefcase,
  Home,
  MessageSquare,
  MoreHorizontal,
  Plus,
  UserRound,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../lib/auth'
import { useI18n } from '../../lib/i18n'
import { themeForPath } from '../../lib/theme'
import { PwaInstallBanner } from './PwaInstallBanner'
import { CreateSheet } from './CreateSheet'
import { BrandIcon, BrandMark } from '../brand/BrandMark'
import { SkipLink } from '../a11y/SkipLink'
import { copyrightLine } from '../../lib/legal'

export function AppShell() {
  const { user } = useAuth()
  const { t, stub } = useI18n()
  const navigate = useNavigate()
  const location = useLocation()
  const [createOpen, setCreateOpen] = useState(false)
  const theme = themeForPath(location.pathname)

  const mobileNav = [
    { to: '/', label: t('nav.home'), icon: Home, end: true },
    { to: '/match', label: t('nav.match'), icon: Briefcase },
    { to: '/mein', label: t('nav.mein'), icon: UserRound },
    { to: '/messages', label: t('nav.inbox'), icon: MessageSquare },
    { to: '/mehr', label: t('nav.mehr'), icon: MoreHorizontal },
  ] as const

  const desktopPrimary = [
    { to: '/', label: t('nav.home'), end: true },
    { to: '/match', label: t('nav.match') },
    { to: '/mein', label: t('nav.mein') },
    { to: '/messages', label: t('nav.inbox') },
    { to: '/mehr', label: t('nav.mehr') },
  ]

  return (
    <div
      data-theme={theme}
      className="theme-shell mx-auto flex min-h-dvh max-w-6xl flex-col overflow-x-hidden"
    >
      <SkipLink />
      {stub && location.pathname !== '/' && (
        <p className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-center text-xs text-amber-100">
          {t('stub.banner')}
        </p>
      )}

      <header className="sticky top-0 z-30 hidden border-b border-border bg-surface/95 backdrop-blur md:block">
        <div className="flex items-center gap-3 px-4 py-3 lg:px-6">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="mr-2 flex shrink-0 items-center gap-2 text-left"
            aria-label="Orbit Start"
          >
            <BrandIcon size={36} />
            <div className="leading-tight">
              <div className="font-bold tracking-tight text-white">Orbit</div>
              <div className="text-[10px] uppercase tracking-wider text-[var(--theme-accent)]">
                {t('brand.tagline')}
              </div>
            </div>
          </button>

          <nav className="flex min-w-0 flex-1 flex-wrap items-center gap-0.5" aria-label="Primary">
            {desktopPrimary.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={'end' in item ? item.end : false}
                className={({ isActive }) =>
                  cn(
                    'rounded-lg px-3 py-2 text-sm text-neutral-300 hover:bg-white/5 hover:text-white',
                    isActive && 'bg-[var(--theme-accent)]/10 text-[var(--theme-accent)]',
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
              onClick={() => setCreateOpen(true)}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-xl bg-[var(--theme-accent)] px-3 py-2 text-sm font-semibold text-black"
            >
              <Plus size={16} /> {t('nav.create')}
            </button>
            {user ? (
              <button
                type="button"
                onClick={() => navigate('/mein')}
                className="tap-target rounded-full border border-border bg-surface-3 px-3 py-2 text-sm"
              >
                {user.name.split(' ')[0]}
              </button>
            ) : (
              <button
                type="button"
                onClick={() => navigate('/auth')}
                className="tap-target rounded-full bg-[var(--theme-accent)]/15 px-3 py-2 text-sm text-[var(--theme-accent)]"
              >
                {t('nav.login')}
              </button>
            )}
          </div>
        </div>
      </header>

      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border bg-surface/90 px-4 py-3 backdrop-blur safe-pt md:hidden">
        <button type="button" onClick={() => navigate('/')} className="flex min-h-11 items-center gap-2">
          <BrandMark compact />
        </button>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            aria-label={t('nav.create')}
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full border border-border bg-surface-3"
          >
            <Plus size={18} />
          </button>
          {user ? (
            <button
              type="button"
              onClick={() => navigate('/mein')}
              className="tap-target rounded-full border border-border bg-surface-3 px-3 py-2 text-sm"
            >
              {user.name.split(' ')[0]}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => navigate('/auth')}
              className="tap-target rounded-full bg-[var(--theme-accent)]/15 px-3 py-2 text-sm text-[var(--theme-accent)]"
            >
              {t('nav.login')}
            </button>
          )}
        </div>
      </header>

      <div className="flex min-w-0 flex-1 flex-col pb-app-chrome">
        <main id="main-content" tabIndex={-1} className="flex-1 px-4 py-4 outline-none md:px-6 md:py-6 max-md:pb-2">
          <div key={location.pathname + location.search} className="page-enter">
            <Outlet />
          </div>
          <footer className="mt-16 space-y-2 border-t border-border/80 pt-6 text-xs text-muted">
            <nav className="flex flex-wrap gap-x-4 gap-y-2" aria-label="Legal">
              <Link to="/impressum" className="hover:text-[var(--theme-accent)]">
                {t('footer.impressum')}
              </Link>
              <Link to="/datenschutz" className="hover:text-[var(--theme-accent)]">
                {t('footer.privacy')}
              </Link>
              <Link to="/agb" className="hover:text-[var(--theme-accent)]">
                {t('footer.terms')}
              </Link>
            </nav>
            <p>{copyrightLine()}</p>
          </footer>
        </main>
      </div>

      <CreateSheet open={createOpen} onClose={() => setCreateOpen(false)} />
      <PwaInstallBanner />

      <nav
        className="fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t border-border bg-surface/95 safe-pb backdrop-blur md:hidden"
        aria-label="Primary"
      >
        {mobileNav.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={'end' in item ? item.end : false}
            className={({ isActive }) =>
              cn(
                'relative flex min-h-[3.25rem] flex-col items-center justify-center gap-0.5 px-1 text-[10px] text-neutral-500 touch-manipulation transition-colors duration-200',
                isActive && 'text-[var(--theme-accent)]',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    'absolute top-0 h-0.5 w-6 rounded-full bg-[var(--theme-accent)] transition-all duration-200',
                    isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50',
                  )}
                />
                <item.icon
                  size={22}
                  className={cn('transition-transform duration-200', isActive && 'scale-110')}
                  aria-hidden
                />
                {item.label}
              </>
            )}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
