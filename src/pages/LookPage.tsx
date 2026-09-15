import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Camera, ImageIcon, Sparkles, Video } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { LaneBadge } from '../components/credits/LaneBadge'
import {
  CREDITS_COSTS,
  getCredits,
  spendCredits,
  subscribeCredits,
} from '../lib/credits'
import { useI18n } from '../lib/i18n'
import {
  LOOK_INTENTS,
  detectLookIntent,
  getLook,
  nearbyFor,
  productsFor,
  setBoostedShop,
  setLookIntent,
  subscribeLook,
  variantsFor,
  type LookIntent,
} from '../lib/look'
import { getPrefs, subscribePrefs } from '../lib/prefs'
import { cn } from '../lib/utils'

function todayKey() {
  return new Date().toISOString().slice(0, 10)
}

export function LookPage() {
  const { t } = useI18n()
  const [params] = useSearchParams()
  const cameraRef = useRef<HTMLInputElement>(null)
  const galleryRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLInputElement>(null)
  const [media, setMedia] = useState<{ url: string; kind: 'image' | 'video' } | null>(null)
  const [intent, setIntent] = useState<LookIntent>(() => detectLookIntent(params.get('intent') || '') || getLook().intent)
  const [analyzed, setAnalyzed] = useState(false)
  const [busy, setBusy] = useState(false)
  const [activeVariant, setActiveVariant] = useState('original')
  const [credits, setCredits] = useState(getCredits)
  const [look, setLook] = useState(getLook)
  const [flash, setFlash] = useState<string | null>(null)
  const [prefsTick, setPrefsTick] = useState(0)

  useEffect(() => {
    const q = params.get('intent') || params.get('q') || ''
    const detected = detectLookIntent(q)
    if (!detected) return
    setIntent(detected)
    setLookIntent(detected)
  }, [params])

  useEffect(() => {
    const u1 = subscribeCredits(() => setCredits(getCredits()))
    const u2 = subscribeLook(() => setLook(getLook()))
    const u3 = subscribePrefs(() => setPrefsTick((n) => n + 1))
    return () => {
      u1()
      u2()
      u3()
    }
  }, [])

  const extraOn = credits.lookTryOnDay === todayKey()
  const variants = useMemo(() => variantsFor(intent, extraOn), [intent, extraOn])
  const products = useMemo(() => productsFor(intent), [intent])
  const places = useMemo(
    () => nearbyFor(intent, look.boostedShopId),
    [intent, look.boostedShopId, prefsTick],
  )
  const current = variants.find((v) => v.id === activeVariant) || variants[0]
  const city = getPrefs().seeker.cities[0] || 'Berlin'

  const onFile = (file: File | undefined, kind: 'image' | 'video') => {
    if (!file) return
    const url = URL.createObjectURL(file)
    setMedia({ url, kind })
    setAnalyzed(false)
    setActiveVariant('original')
  }

  const analyze = () => {
    if (!media) return
    setBusy(true)
    window.setTimeout(() => {
      setAnalyzed(true)
      setLookIntent(intent)
      setBusy(false)
    }, 550)
  }

  const pickIntent = (id: LookIntent) => {
    setIntent(id)
    setLookIntent(id)
    setActiveVariant('original')
  }

  const note = (msg: string) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(null), 2800)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">{t('look.kicker')}</p>
        <h1 className="text-2xl font-bold tracking-tight">{t('look.title')}</h1>
        <p className="text-sm text-muted">{t('look.lead')}</p>
        <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
          {t('look.disclaimer')}
        </p>
      </header>

      <div className="flex flex-wrap gap-2">
        {LOOK_INTENTS.map((it) => (
          <button
            key={it.id}
            type="button"
            onClick={() => pickIntent(it.id)}
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs',
              intent === it.id
                ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15 text-white'
                : 'border-border text-muted hover:text-white',
            )}
          >
            {it.emoji} {it.labelDe}
          </button>
        ))}
      </div>

      <div className="flex gap-2">
        <Button variant="secondary" className="flex-1" onClick={() => cameraRef.current?.click()}>
          <Camera size={16} /> {t('look.selfie')}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => galleryRef.current?.click()}>
          <ImageIcon size={16} /> {t('look.upload')}
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => videoRef.current?.click()}>
          <Video size={16} /> {t('look.video')}
        </Button>
      </div>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0], 'image')}
      />
      <input
        ref={galleryRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0], 'image')}
      />
      <input
        ref={videoRef}
        type="file"
        accept="video/*"
        className="sr-only"
        onChange={(e) => onFile(e.target.files?.[0], 'video')}
      />

      {!media && (
        <p className="rounded-2xl border border-dashed border-border px-3 py-6 text-center text-sm text-muted">
          {t('look.emptyHint')}
        </p>
      )}
      {media && (
        <div className="relative overflow-hidden rounded-2xl border border-border bg-black">
          {media.kind === 'video' ? (
            <video
              src={media.url}
              className="max-h-80 w-full object-cover"
              style={{ filter: current?.filter }}
              controls
              muted
              playsInline
            />
          ) : (
            <img
              src={media.url}
              alt="Dein Look — Demo, kein Live-ML"
              className="max-h-80 w-full object-cover"
              style={{ filter: current?.filter }}
            />
          )}
          {current && current.id !== 'original' && (
            <div className="pointer-events-none absolute inset-0" style={{ background: current.overlay }} />
          )}
          <div className="absolute left-2 top-2 flex gap-1">
            <Badge tone="amber">Demo</Badge>
            <LaneBadge lane={current?.free ? 'free' : 'credits'} />
          </div>
          {current && current.id !== 'original' && (
            <p className="absolute bottom-2 left-2 right-2 rounded-lg bg-black/55 px-2 py-1 text-[11px] text-white">
              {current.labelDe} · {current.hintDe}
            </p>
          )}
        </div>
      )}

      <Button disabled={!media || busy} onClick={analyze} className="w-full">
        <Sparkles size={16} /> {busy ? t('look.analyzing') : t('look.analyze')}
        <LaneBadge lane="free" />
      </Button>

      {flash && (
        <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan">{flash}</p>
      )}

      {analyzed && (
        <>
          <section className="space-y-2">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{t('look.tryon')}</h2>
              {!extraOn && (
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => {
                    const meta = CREDITS_COSTS.look_tryon
                    const ok = spendCredits(meta.credits, 'look_tryon', meta.label)
                    note(ok ? t('look.tryonUnlocked') : t('credits.notEnough'))
                  }}
                >
                  {t('look.extraPack')} (−{CREDITS_COSTS.look_tryon.credits})
                </Button>
              )}
            </div>
            <p className="text-[11px] text-muted">{t('look.tryonHint')}</p>
            <div className="-mx-4 overflow-x-auto px-4 [scrollbar-width:thin]">
              <ul className="flex snap-x gap-2">
                {variants.map((v) => (
                  <li key={v.id}>
                    <button
                      type="button"
                      onClick={() => setActiveVariant(v.id)}
                      className={cn(
                        'w-28 snap-start rounded-xl border px-2 py-2 text-left',
                        activeVariant === v.id
                          ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/10'
                          : 'border-border bg-surface-2',
                      )}
                    >
                      <p className="text-xs font-medium text-white">{v.labelDe}</p>
                      <p className="mt-0.5 text-[10px] text-muted">{v.free ? t('look.free') : t('look.extra')}</p>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">{t('look.shops')}</h2>
            <p className="text-[11px] text-muted">{t('look.shopsHint')}</p>
            <ul className="grid gap-2 sm:grid-cols-2">
              {products.map((p) => (
                <li key={p.id}>
                  {p.internal ? (
                    <Link
                      to={p.href}
                      className="block rounded-xl border border-border bg-surface-2 px-3 py-3 hover:border-[var(--theme-accent)]/40"
                    >
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      <p className="text-[11px] text-muted">
                        {p.shop} · {p.priceLabel}
                      </p>
                    </Link>
                  ) : (
                    <a
                      href={p.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-xl border border-border bg-surface-2 px-3 py-3 hover:border-[var(--theme-accent)]/40"
                    >
                      <p className="text-sm font-medium text-white">{p.title}</p>
                      <p className="text-[11px] text-muted">
                        {p.shop} · {p.priceLabel} · extern
                      </p>
                    </a>
                  )}
                </li>
              ))}
            </ul>
          </section>

          <section className="space-y-2">
            <h2 className="text-base font-semibold">{t('look.nearby')}</h2>
            <p className="text-[11px] text-muted">
              {t('look.nearbyHint')} · {city} · {getPrefs().seeker.radiusKm || 50} km
            </p>
            {places.length === 0 ? (
              <p className="text-sm text-muted">{t('look.nearbyEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {places.map((p) => (
                  <li
                    key={p.id}
                    className="flex items-center justify-between gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2"
                  >
                    <div>
                      <p className="text-sm font-medium text-white">
                        {p.name}
                        {look.boostedShopId === p.id && (
                          <span className="ml-2 text-[10px] uppercase text-violet-200">Featured</span>
                        )}
                      </p>
                      <p className="text-[11px] text-muted">
                        {p.kind} · {p.city} · {p.km.toFixed(1)} km · {p.hint}
                      </p>
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={look.boostedShopId === p.id}
                      onClick={() => {
                        const meta = CREDITS_COSTS.look_shop
                        const ok = spendCredits(meta.credits, 'look_shop', `${meta.label}: ${p.name}`)
                        if (ok) setBoostedShop(p.id)
                        note(ok ? t('look.shopBoosted') : t('credits.notEnough'))
                      }}
                    >
                      Boost (−{CREDITS_COSTS.look_shop.credits})
                    </Button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  )
}
