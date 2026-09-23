import { useEffect, useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { TripOptionCards } from '../components/assist/TripOptionCards'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Empty } from '../components/ui/Empty'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useI18n } from '../lib/i18n'
import { TRAVEL_DISCLAIMER_DE, TRAVEL_DISCLAIMER_EN, TRAVEL_KIND_META, TRAVEL_KINDS, type TravelKind } from '../lib/travel'
import { buyBoost, CREDITS_COSTS, hasTravelDeepScan, subscribeCredits } from '../lib/credits'
import { LaneBadge } from '../components/credits/LaneBadge'
import { KidsBlocked } from '../components/kids/KidsBlocked'
import { emitParentalRequired, kidsHideTravel, subscribeKids } from '../lib/kids'
import { detectTripIntent, proposeTripOptions } from '../lib/trip'
import {
  bahnSearchUrl,
  searchLiveRail,
  travelSearchLinks,
  type RailJourney,
  type TravelSearchLink,
} from '../lib/travelConnectors'
import { cn, formatPrice } from '../lib/utils'

type RailState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'live'; journeys: RailJourney[] }
  | { status: 'empty' }
  | { status: 'error' }

function clock(iso: string, locale: 'de' | 'en') {
  if (!iso) return '—'
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString(locale === 'de' ? 'de-DE' : 'en-GB', { hour: '2-digit', minute: '2-digit' })
}

export function TravelPage() {
  const { t, resolved } = useI18n()
  const [params, setParams] = useSearchParams()
  const kindParam = (params.get('kind') as TravelKind | 'all') || 'all'
  const committedFrom = params.get('from') || ''
  const committedTo = params.get('to') || ''
  const committedDate = params.get('date') || ''
  const [to, setTo] = useState(committedTo)
  const [from, setFrom] = useState(committedFrom)
  const [date, setDate] = useState(committedDate)
  const [q, setQ] = useState(params.get('q') || '')
  const [scanTick, setScanTick] = useState(0)
  const [kids, setKids] = useState(kidsHideTravel)
  const [rail, setRail] = useState<RailState>({ status: 'idle' })
  useEffect(() => subscribeCredits(() => setScanTick((n) => n + 1)), [])
  useEffect(() => subscribeKids(() => setKids(kidsHideTravel())), [])
  const scanOn = hasTravelDeepScan()

  const tripCards = useMemo(() => {
    const intent = detectTripIntent([from, to, q].filter(Boolean).join(' '))
    return intent.matched ? proposeTripOptions(intent).slice(0, 3) : []
  }, [from, to, q])

  const wantRail = kindParam === 'all' || kindParam === 'rail'
  useEffect(() => {
    if (kids || !wantRail || !committedFrom || !committedTo) {
      setRail({ status: 'idle' })
      return
    }
    const ac = new AbortController()
    setRail({ status: 'loading' })
    void searchLiveRail({
      from: committedFrom,
      to: committedTo,
      dateIso: committedDate || undefined,
      results: scanOn ? 6 : 3,
      signal: ac.signal,
    })
      .then((journeys) => {
        if (ac.signal.aborted) return
        setRail(journeys.length ? { status: 'live', journeys } : { status: 'empty' })
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return
        if (err instanceof DOMException && err.name === 'AbortError') return
        setRail({ status: 'error' })
      })
    return () => ac.abort()
  }, [kids, wantRail, committedFrom, committedTo, committedDate, scanOn, scanTick])

  const links = useMemo(
    () =>
      travelSearchLinks({
        from: committedFrom,
        to: committedTo,
        dateIso: committedDate,
        locale: resolved,
      }),
    [committedFrom, committedTo, committedDate, resolved],
  )
  const bahnHref = committedFrom && committedTo ? bahnSearchUrl(committedFrom, committedTo, committedDate) : ''

  const setKind = (next: TravelKind | 'all') => {
    const p = new URLSearchParams(params)
    if (next === 'all') p.delete('kind')
    else p.set('kind', next)
    setParams(p)
  }

  const disclaimer = resolved === 'de' ? TRAVEL_DISCLAIMER_DE : TRAVEL_DISCLAIMER_EN
  const show = (kind: TravelKind) => kindParam === 'all' || kindParam === kind

  return (
    <div className="space-y-5 pb-scroll-chrome">
      <header className="space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">
              {t('travel.kicker')}
            </p>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Plane size={22} /> {t('travel.title')}
            </h1>
            <p className="mt-1 max-w-lg text-sm text-muted">{t('travel.lead')}</p>
          </div>
          <SpeakButton compact text={`${t('travel.title')}. ${t('travel.lead')}`} />
        </div>
      </header>

      {kids ? (
        <KidsBlocked title={t('kids.travelBlocked')} onAskParent={() => emitParentalRequired('leave_kids')} />
      ) : (
        <>
          <p className="rounded-2xl border border-amber-500/50 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
            {disclaimer}
          </p>

          {tripCards.length > 0 && <TripOptionCards options={tripCards} />}

          <div className="flex flex-wrap items-center gap-2">
            {scanOn ? (
              <span className="inline-flex items-center gap-2 text-xs text-[var(--theme-accent)]">
                <LaneBadge lane="credits" /> {t('travel.deepScanOn')}
              </span>
            ) : (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => {
                  void buyBoost('travel_scan').then(() => {
                    setScanTick((n) => n + 1)
                  })
                }}
              >
                {t('travel.deepScan')} · {CREDITS_COSTS.travel_scan.credits} Credits
              </Button>
            )}
            <p className="text-[11px] text-muted">{t('travel.deepScanHint')}</p>
          </div>

          <form
            className="grid gap-2 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault()
              const p = new URLSearchParams(params)
              if (to) p.set('to', to)
              else p.delete('to')
              if (from) p.set('from', from)
              else p.delete('from')
              if (date) p.set('date', date)
              else p.delete('date')
              if (q) p.set('q', q)
              else p.delete('q')
              setParams(p)
            }}
          >
            <Input value={from} onChange={(e) => setFrom(e.target.value)} placeholder={t('travel.from')} />
            <Input value={to} onChange={(e) => setTo(e.target.value)} placeholder={t('travel.to')} />
            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('travel.q')} />
            <div className="sm:col-span-2">
              <Button type="submit" className="w-full sm:w-auto">
                {t('travel.search')}
              </Button>
            </div>
          </form>

          <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t('travel.lanes')}>
            <button
              type="button"
              onClick={() => setKind('all')}
              className={cn(
                'min-h-10 rounded-full border px-3 text-xs font-medium',
                kindParam === 'all'
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                  : 'border-border',
              )}
            >
              {t('travel.all')}
            </button>
            {TRAVEL_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                className={cn(
                  'min-h-10 rounded-full border px-3 text-xs font-medium',
                  kindParam === k
                    ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                    : 'border-border',
                )}
              >
                {TRAVEL_KIND_META[k].emoji} {resolved === 'de' ? TRAVEL_KIND_META[k].de : TRAVEL_KIND_META[k].en}
              </button>
            ))}
          </div>

          <p className="text-xs text-muted">{t('travel.sort')}</p>

          {show('rail') && (
            <RailLane state={rail} ready={Boolean(committedFrom && committedTo)} bahnHref={bahnHref} />
          )}

          {TRAVEL_KINDS.filter((kind) => kind !== 'rail' && show(kind)).map((kind) => {
            const link = links.find((item) => item.kind === kind)
            return <OutboundLane key={kind} kind={kind} link={link} />
          })}

          <p className="text-xs text-muted">
            {t('travel.also')}{' '}
            <Link to="/marktplatz" className="text-[var(--theme-accent)] hover:underline">
              {t('market.nav')}
            </Link>
            {' · '}
            <Link to="/match" className="text-[var(--theme-accent)] hover:underline">
              {t('nav.match')}
            </Link>
          </p>
        </>
      )}
    </div>
  )
}

function RailLane({
  state,
  ready,
  bahnHref,
}: {
  state: RailState
  ready: boolean
  bahnHref: string
}) {
  const { t, resolved } = useI18n()
  return (
    <section className="space-y-2" aria-label={resolved === 'de' ? 'Bahn' : 'Rail'} data-travel-source={state.status === 'live' ? 'live' : 'empty-cta'}>
      <h2 className="text-sm font-semibold text-ink">{resolved === 'de' ? 'Bahn' : 'Rail'}</h2>
      {state.status === 'live' && (
        <>
          <p className="text-xs text-[var(--theme-accent)]">{t('travel.railLive')}</p>
          <ul className="space-y-2">
            {state.journeys.map((journey) => (
              <li key={journey.id}>
                <a
                  href={bahnHref}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface-2/70 px-3 py-3 hover:border-[var(--theme-accent)]/40"
                >
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-3 text-xl">🚆</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-ink">
                      {clock(journey.departure, resolved)} → {clock(journey.arrival, resolved)}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted">
                      {journey.from} → {journey.to}
                      {journey.lines.length ? ` · ${journey.lines.join(' · ')}` : ''}
                    </p>
                    <p className="mt-1 text-[11px] text-neutral-500">
                      {journey.transfers} {t('travel.transfers')}
                      {journey.durationMin != null ? ` · ${journey.durationMin} min` : ''}
                      {' · '}
                      {journey.priceEur != null ? formatPrice(journey.priceEur) : t('travel.noPrice')}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        </>
      )}
      {state.status === 'loading' && <p className="text-sm text-muted">{t('travel.loading')}</p>}
      {state.status !== 'live' && state.status !== 'loading' && (
        <Empty
          emoji="🚆"
          title={
            !ready ? t('travel.railNeed') : state.status === 'error' ? t('travel.railFail') : t('travel.railEmpty')
          }
          hint={t('travel.linkNote')}
          className="py-6"
        />
      )}
      {bahnHref && (
        <a
          href={bahnHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 items-center text-sm font-medium text-[var(--theme-accent)] hover:underline"
        >
          {t('travel.openBahn')}
        </a>
      )}
    </section>
  )
}

function OutboundLane({ kind, link }: { kind: TravelKind; link: TravelSearchLink | undefined }) {
  const { t, resolved } = useI18n()
  const meta = TRAVEL_KIND_META[kind]
  const label = resolved === 'de' ? meta.de : meta.en
  return (
    <section className="space-y-2" data-travel-source="empty-cta" data-travel-kind={kind}>
      <h2 className="text-sm font-semibold text-ink">
        {meta.emoji} {label}
      </h2>
      {link ? (
        <a
          href={link.href}
          target="_blank"
          rel="noreferrer"
          className="flex min-h-11 items-center justify-between gap-3 rounded-2xl border border-border bg-surface-2/70 px-3 py-3 hover:border-[var(--theme-accent)]/40"
        >
          <span>
            <span className="block text-sm font-semibold text-ink">{link.provider}</span>
            <span className="block text-xs text-muted">{t('travel.linkNote')}</span>
          </span>
          <span className="text-sm font-medium text-[var(--theme-accent)]">{t('travel.openExternal')}</span>
        </a>
      ) : (
        <Empty emoji={meta.emoji} title={t('travel.railNeed')} hint={t('travel.emptyHint')} className="py-6" />
      )}
    </section>
  )
}
