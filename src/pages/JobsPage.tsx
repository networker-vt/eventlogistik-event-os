import { useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  Briefcase,
  CheckCircle2,
  Clock,
  MapPin,
  Plus,
  Scale,
  Search,
  Users,
} from 'lucide-react'
import { FilterBar } from '../components/listings/FilterBar'
import { ListingCard } from '../components/listings/ListingCard'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { BOOKING_STATUS_LABELS } from '../data/constants'
import { useListings, useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { formatPrice } from '../lib/utils'
import type { ListingFilters } from '../types'

type Side = 'seek' | 'hire'

export function JobsPage() {
  const [params, setParams] = useSearchParams()
  const side = (params.get('side') as Side) || 'seek'
  const { user, loginDemo } = useAuth()
  useStoreVersion()
  const navigate = useNavigate()

  const [filters, setFilters] = useState<ListingFilters>({
    vertical: 'job',
    kind: side === 'seek' ? 'offer' : 'all',
  })

  const { listings } = useListings({ ...filters, vertical: 'job' })

  const myJobBookings = useMemo(() => {
    if (!user) return []
    return store.listBookingsForUser(user.id).filter((b) => b.vertical === 'job')
  }, [user])

  const postedJobs = useMemo(() => {
    if (!user) return []
    return store.listListings({ vertical: 'job' }).filter((l) => l.ownerId === user.id)
  }, [user, listings])

  const setSide = (next: Side) => {
    setParams({ side: next })
    setFilters((f) => ({
      ...f,
      vertical: 'job',
      kind: next === 'seek' ? 'offer' : next === 'hire' ? 'all' : f.kind,
    }))
  }

  return (
    <div className="space-y-5">
      <div className="rounded-3xl border border-border bg-surface-2 p-5">
        <p className="text-sm text-cyan">💼 Jobs & Gigs</p>
        <h1 className="mt-1 text-2xl font-bold">
          {side === 'seek' ? 'Jobs finden — Rate zuerst' : 'Jobs posten & Crew besetzen'}
        </h1>
        <p className="mt-2 text-sm text-muted">
          {side === 'seek'
            ? 'Keine versteckten Tagessätze. Filtern, bewerben, Status tracken — besser als WhatsApp-Listen.'
            : 'Strukturierter Job-Post in unter 2 Minuten. Bewerber-Pipeline, Chat mit Kontext, verifizierte Crew.'}
        </p>

        <div className="mt-4 flex rounded-xl border border-border bg-surface p-1">
          <button
            type="button"
            onClick={() => setSide('seek')}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium ${side === 'seek' ? 'bg-cyan text-black' : 'text-muted'}`}
          >
            <Search size={16} /> Jobs finden
          </button>
          <button
            type="button"
            onClick={() => setSide('hire')}
            className={`flex min-h-11 flex-1 items-center justify-center gap-2 rounded-lg text-sm font-medium ${side === 'hire' ? 'bg-teal text-black' : 'text-muted'}`}
          >
            <Users size={16} /> Jobs / Crew
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {side === 'hire' ? (
            <Button onClick={() => navigate('/listings/new?vertical=job&kind=offer')}>
              <Plus size={16} /> Job posten
            </Button>
          ) : (
            <Button variant="secondary" onClick={() => navigate('/listings/new?vertical=job&kind=request')}>
              Verfügbarkeit posten (Gesuch)
            </Button>
          )}
          {!user && (
            <Button variant="ghost" onClick={loginDemo}>
              Demo starten
            </Button>
          )}
        </div>
      </div>

      {side === 'seek' && (
        <>
          <div className="grid grid-cols-3 gap-2">
            {[
              { icon: CheckCircle2, label: 'Rate upfront' },
              { icon: MapPin, label: 'Stadt & Datum' },
              { icon: Clock, label: '1-Tap Apply' },
            ].map((x) => (
              <div
                key={x.label}
                className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface-2 px-2 py-3 text-center"
              >
                <x.icon size={16} className="text-cyan" />
                <span className="text-[11px] text-muted">{x.label}</span>
              </div>
            ))}
          </div>

          <div className="sticky-filters -mx-4 bg-surface/95 px-4 py-2 backdrop-blur md:mx-0 md:bg-transparent md:px-0 md:py-0">
            <FilterBar
              value={filters}
              onChange={(f) => setFilters({ ...f, vertical: 'job' })}
              showVertical={false}
              showRate
              sticky
            />
          </div>

          {listings.length === 0 ? (
            <Empty
              title="Keine Jobs in diesem Filter"
              hint="Tagessatz, Stadt oder Gewerk lockern — oder Verfügbarkeit als Gesuch posten."
              actionLabel="Filter zurücksetzen"
              onAction={() => setFilters({ vertical: 'job', kind: 'offer' })}
            />
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} highlightRate />
              ))}
            </div>
          )}

          {user && myJobBookings.length > 0 && (
            <section className="space-y-3">
              <h2 className="font-semibold">Meine Bewerbungen</h2>
              <div className="space-y-2">
                {myJobBookings
                  .filter((b) => b.requesterId === user.id)
                  .map((b) => (
                    <Link
                      key={b.id}
                      to={`/bookings/${b.id}`}
                      className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{b.listingTitle}</div>
                        <div className="text-xs text-muted">
                          {b.offerAmount != null ? formatPrice(b.offerAmount) : 'Rate offen'} ·{' '}
                          {BOOKING_STATUS_LABELS[b.status]}
                        </div>
                      </div>
                      <Badge tone={b.status === 'booked' ? 'green' : b.status === 'offer' ? 'cyan' : 'amber'}>
                        {BOOKING_STATUS_LABELS[b.status]}
                      </Badge>
                    </Link>
                  ))}
              </div>
            </section>
          )}
        </>
      )}

      {side === 'hire' && (
        <>
          <div className="rounded-2xl border border-dashed border-teal/40 bg-teal/5 p-4 text-sm text-neutral-300">
            <Briefcase className="mb-2 inline text-teal" size={18} /> Structured Post: Datum · Ort/Venue ·
            Rolle/Gewerk · Budget/Tagessatz · Call-Zeiten · Requirements — unter 2 Minuten.
          </div>

          <div className="sticky-filters -mx-4 bg-surface/95 px-4 py-2 backdrop-blur md:mx-0 md:bg-transparent md:px-0 md:py-0">
            <FilterBar
              value={filters}
              onChange={(f) => setFilters({ ...f, vertical: 'job' })}
              showVertical={false}
              showRate
              sticky
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} highlightRate />
            ))}
          </div>
          {listings.length === 0 && (
            <Empty
              title="Noch keine Jobs sichtbar"
              hint="Poste deinen ersten Job mit klarer Rate — Bewerbungen landen in der Pipeline."
              actionLabel="Job posten"
              onAction={() => navigate('/listings/new?vertical=job&kind=offer')}
            />
          )}

          {user && postedJobs.length > 0 && (
            <section className="space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h2 className="font-semibold">Meine Job-Posts</h2>
              </div>
              <div className="space-y-2">
                {postedJobs.map((job) => {
                  const apps = store.listBookingsForListing(job.id)
                  return (
                    <div
                      key={job.id}
                      className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{job.title}</div>
                        <div className="text-xs text-muted">
                          {apps.length} Bewerbung{apps.length === 1 ? '' : 'en'}
                          {job.priceFrom != null ? ` · ab ${formatPrice(job.priceFrom)}` : ''}
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {apps.length >= 2 && (
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => navigate(`/jobs/compare/${job.id}`)}
                          >
                            <Scale size={14} /> Vergleichen
                          </Button>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => navigate(`/listings/${job.id}`)}>
                          Öffnen
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {user && (
            <section className="space-y-3">
              <h2 className="font-semibold">Bewerber-Pipeline</h2>
              {myJobBookings.filter((b) => b.providerId === user.id || postedJobs.some((p) => p.id === b.listingId)).length === 0 ? (
                <p className="text-sm text-muted">
                  Noch keine Bewerbungen. Poste einen Job oder warte auf eingehende Anfragen.
                </p>
              ) : (
                <div className="space-y-2">
                  {myJobBookings
                    .filter(
                      (b) =>
                        b.providerId === user.id ||
                        postedJobs.some((p) => p.id === b.listingId),
                    )
                    .map((b) => (
                      <Link
                        key={b.id}
                        to={`/bookings/${b.id}`}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-4 py-3 hover:border-teal/40"
                      >
                        <div>
                          <div className="font-medium">{b.requesterName}</div>
                          <div className="text-xs text-muted">
                            {b.listingTitle}
                            {b.offerAmount != null ? ` · ${formatPrice(b.offerAmount)}` : ''}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge>{BOOKING_STATUS_LABELS[b.status]}</Badge>
                          {b.threadId && (
                            <Button
                              size="sm"
                              variant="secondary"
                              onClick={(e) => {
                                e.preventDefault()
                                navigate(`/messages/${b.threadId}`)
                              }}
                            >
                              Chat
                            </Button>
                          )}
                        </div>
                      </Link>
                    ))}
                </div>
              )}
            </section>
          )}
        </>
      )}
    </div>
  )
}
