import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, Heart, LayoutDashboard, Library, Lightbulb, UserRound, Wallet } from 'lucide-react'
import { IdeenInbox } from '../components/ideas/IdeenInbox'
import { useIdeas } from '../hooks/useIdeas'
import { FavoriteButton } from '../components/favorites/FavoriteButton'
import { ListingCard } from '../components/listings/ListingCard'
import { Badge } from '../components/ui/Badge'
import { Empty } from '../components/ui/Empty'
import { CATALOG_KIND_LABEL, catalogSectionPath, resolveCatalogEntry } from '../data/catalog/lookup'
import { useFavorites } from '../hooks/useFavorites'
import { store } from '../lib/store'
import { formatDate } from '../lib/utils'
import { listLocalCalendar, removeLocalCalendarItem, type LocalCalItem } from '../lib/calendar'
import { CalendarExport } from '../components/calendar/CalendarExport'

export function MeinPage() {
  const { items } = useFavorites()
  const { ideas } = useIdeas()
  const navigate = useNavigate()
  const [cal, setCal] = useState<LocalCalItem[]>(() => listLocalCalendar())
  useEffect(() => {
    const h = () => setCal(listLocalCalendar())
    window.addEventListener('orbit-cal-changed', h)
    window.addEventListener('storage', h)
    return () => {
      window.removeEventListener('orbit-cal-changed', h)
      window.removeEventListener('storage', h)
    }
  }, [])


  const listingFavs = items.filter((f) => f.type === 'listing')
  const catalogFavs = items.filter((f) => f.type === 'catalog')

  const jobListings = listingFavs
    .map((f) => store.getListing(f.id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l && l.vertical === 'job'))
  const otherListings = listingFavs
    .map((f) => store.getListing(f.id))
    .filter((l): l is NonNullable<typeof l> => Boolean(l && l.vertical !== 'job'))
  const missingListingIds = listingFavs
    .filter((f) => !store.getListing(f.id))
    .map((f) => f.id)

  const catalogRows = catalogFavs.map((f) => ({
    fav: f,
    entry: resolveCatalogEntry(f.kind, f.id),
  }))

  const total = jobListings.length + otherListings.length + catalogFavs.length

  return (
    <div className="space-y-6 pb-scroll-chrome">
      <header className="space-y-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-rose-300">Mein Bereich</p>
          <h1 className="text-2xl font-bold tracking-tight">Favoriten</h1>
          <p className="mt-1 text-sm text-muted">
            Gemerkte Jobs, Marktplatz-Inserate und Katalog-Einträge — lokal auf diesem Gerät
            (localStorage).
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            to="/wallet"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-sm text-cyan"
          >
            <Wallet size={16} /> Wallet
          </Link>
          <Link
            to="/ideen"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-sm text-cyan"
          >
            <Lightbulb size={16} /> Ideen-Box
          </Link>
          <Link
            to="/empfehlen"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-neutral-300 hover:border-cyan/30"
          >
            Empfehlen
          </Link>
          <Link
            to="/dashboard"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-neutral-300 hover:border-cyan/30"
          >
            <LayoutDashboard size={16} /> Dashboard
          </Link>
          <Link
            to="/profile"
            className="inline-flex min-h-10 items-center gap-1.5 rounded-xl border border-border bg-surface-2 px-3 py-2 text-sm text-neutral-300 hover:border-cyan/30"
          >
            <UserRound size={16} /> Profil
          </Link>
        </div>
        <p className="text-xs text-muted">
          {total} Favorit{total === 1 ? '' : 'en'} · {jobListings.length} Jobs · {otherListings.length}{' '}
          Inserate · {catalogFavs.length} Katalog
        </p>
      </header>


      <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
        <h2 className="text-lg font-semibold">Lokaler Kalender</h2>
        <p className="text-xs text-muted">
          Interviews, Starts, Bewerbungen — nur auf diesem Gerät. ICS/Google von Match/Booking.
        </p>
        {cal.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Einträge.</p>
        ) : (
          <ul className="space-y-2">
            {cal.map((c) => (
              <li
                key={c.id}
                className="flex items-start justify-between gap-2 rounded-xl border border-border/60 bg-black/20 px-3 py-2 text-sm"
              >
                <div className="min-w-0">
                  <div className="font-medium text-white">{c.title}</div>
                  <div className="text-xs text-muted">
                    {c.kind} · {formatDate(c.startIso.slice(0, 10))}
                    {c.location ? ` · ${c.location}` : ''}
                  </div>
                  <div className="mt-1">
                    <CalendarExport
                      compact
                      kind={c.kind}
                      event={{
                        title: c.title,
                        startIso: c.startIso,
                        endIso: c.endIso,
                        location: c.location,
                      }}
                    />
                  </div>
                </div>
                <button
                  type="button"
                  className="text-xs text-rose-300 hover:underline"
                  onClick={() => setCal(removeLocalCalendarItem(c.id))}
                >
                  Entfernen
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      <IdeenInbox
        ideas={ideas}
        title="Ideen-Inbox (Operator)"
        hint="Lokal auf diesem Gerät — Keyword-Tags, Priorität, geplante Lücken. Kein Server."
      />

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Briefcase size={18} className="text-cyan" /> Jobs
        </h2>
        {jobListings.length === 0 ? (
          <Empty
            emoji="💼"
            title="Noch keine Job-Favoriten"
            hint="Herz auf einer Jobkarte tippen — sie landet hier."
            actionLabel="Jobs entdecken"
            onAction={() => navigate('/jobs?side=seek')}
          />
        ) : (
          <div className="stagger-in grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {jobListings.map((l) => (
              <ListingCard key={l.id} listing={l} highlightRate />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Heart size={18} className="text-rose-300" /> Listings
        </h2>
        {otherListings.length === 0 ? (
          <Empty
            emoji="📌"
            title="Keine gemerkten Inserate"
            hint="Angebote & Gesuche aus dem Marktplatz hier sammeln."
            actionLabel="Marktplatz"
            onAction={() => navigate('/mehr#marktplatz')}
          />
        ) : (
          <div className="stagger-in grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {otherListings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}
        {missingListingIds.length > 0 && (
          <p className="text-xs text-muted">
            {missingListingIds.length} gemerktes Inserat nicht mehr im Store.
          </p>
        )}
      </section>

      <section className="space-y-3">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Library size={18} className="text-teal" /> Katalog-Einträge
        </h2>
        {catalogRows.length === 0 ? (
          <Empty
            emoji="📚"
            title="Keine Katalog-Favoriten"
            hint="Firmen, Locations, Transporteure merken — öffentlicher Katalog, kein Booking."
            actionLabel="Katalog öffnen"
            onAction={() => navigate('/katalog/firmen')}
          />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {catalogRows.map(({ fav, entry }) => (
              <article
                key={`${fav.kind}-${fav.id}`}
                className="card-elevated flex items-start gap-3 rounded-2xl border border-border p-4"
              >
                <div className="min-w-0 flex-1">
                  <div className="mb-1 flex flex-wrap gap-1">
                    <Badge tone="teal">{CATALOG_KIND_LABEL[fav.kind]}</Badge>
                  </div>
                  <Link
                    to={catalogSectionPath(fav.kind)}
                    className="text-sm font-semibold text-white hover:text-cyan"
                  >
                    {entry?.name ?? 'Eintrag nicht mehr vorhanden'}
                  </Link>
                  <p className="mt-1 text-xs text-muted">
                    {[entry?.city, entry?.hint].filter(Boolean).join(' · ') || 'Katalog'}
                  </p>
                  <p className="mt-1 text-[10px] text-muted">gemerkt {formatDate(fav.addedAt)}</p>
                </div>
                <FavoriteButton catalog={{ kind: fav.kind, id: fav.id }} />
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
