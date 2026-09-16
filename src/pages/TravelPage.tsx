import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Plane } from 'lucide-react'
import { TravelCard } from '../components/travel/TravelCard'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Empty } from '../components/ui/Empty'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useI18n } from '../lib/i18n'
import {
  TRAVEL_DISCLAIMER_DE,
  TRAVEL_DISCLAIMER_EN,
  TRAVEL_KIND_META,
  TRAVEL_KINDS,
  mergeDeepScan,
  searchTravelForNeed,
  withCheapestFlag,
  type TravelKind,
} from '../lib/travel'
import { buyBoost, CREDITS_COSTS, hasTravelDeepScan, subscribeCredits } from '../lib/credits'
import { LaneBadge } from '../components/credits/LaneBadge'
import { cn } from '../lib/utils'

export function TravelPage() {
  const { t, resolved } = useI18n()
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()
  const kindParam = (params.get('kind') as TravelKind | 'all') || 'all'
  const [to, setTo] = useState(params.get('to') || '')
  const [from, setFrom] = useState(params.get('from') || '')
  const [date, setDate] = useState(params.get('date') || '')
  const [q, setQ] = useState(params.get('q') || '')
  const [scanTick, setScanTick] = useState(0)
  useEffect(() => subscribeCredits(() => setScanTick((n) => n + 1)), [])
  const scanOn = hasTravelDeepScan()

  const results = useMemo(() => {
    const kinds = kindParam === 'all' ? undefined : [kindParam]
    const base = searchTravelForNeed({
      kinds,
      to: to || undefined,
      from: from || undefined,
      dateIso: date || undefined,
      q: q || undefined,
    })
    return withCheapestFlag(mergeDeepScan(base, scanOn))
  }, [kindParam, to, from, date, q, scanOn, scanTick])

  const setKind = (next: TravelKind | 'all') => {
    const p = new URLSearchParams(params)
    if (next === 'all') p.delete('kind')
    else p.set('kind', next)
    setParams(p)
  }

  const disclaimer = resolved === 'de' ? TRAVEL_DISCLAIMER_DE : TRAVEL_DISCLAIMER_EN

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

      <p className="rounded-2xl border border-amber-500/50 bg-amber-500/15 px-3 py-2 text-xs text-amber-100">
        {disclaimer}
      </p>

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

      {results.length === 0 ? (
        <Empty
          emoji="✈️"
          title={t('travel.empty')}
          hint={t('travel.emptyHint')}
          actionLabel={t('travel.toAssist')}
          onAction={() => navigate('/')}
        />
      ) : (
        <ul className="space-y-2">
          {results.map((o) => (
            <li key={o.id}>
              <TravelCard offer={o} cheapest={o.cheapest} />
            </li>
          ))}
        </ul>
      )}

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
    </div>
  )
}
