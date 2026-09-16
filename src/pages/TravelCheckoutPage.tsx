import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { WalletDisclaimer } from '../components/wallet/WalletDisclaimer'
import { useAuth } from '../lib/auth'
import { DEMO_USER_ID } from '../data/seed'
import { CREDITS_COSTS, getCredits } from '../lib/credits'
import { useI18n } from '../lib/i18n'
import { bookTravelOffer, creditsNeeded } from '../lib/tickets'
import { TRAVEL_DISCLAIMER_DE, TRAVEL_DISCLAIMER_EN, TRAVEL_KIND_META, getTravelOffer } from '../lib/travel'
import { formatPrice } from '../lib/utils'
import { getWallet, WALLET_METHODS, type WalletMethodId } from '../lib/wallet'
import { cn } from '../lib/utils'

export function TravelCheckoutPage() {
  const { offerId } = useParams()
  const { t, resolved } = useI18n()
  const { user, loginDemo } = useAuth()
  const navigate = useNavigate()
  const offer = offerId ? getTravelOffer(offerId) : undefined
  const [pay, setPay] = useState<'fiat' | 'credits'>('fiat')
  const [methodId, setMethodId] = useState<WalletMethodId>('sepa')
  const [err, setErr] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  if (!offer) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-muted">{t('checkout.missing')}</p>
        <Link to="/reise" className="text-sm text-[var(--theme-accent)] hover:underline">
          {t('travel.title')}
        </Link>
      </div>
    )
  }

  const meta = TRAVEL_KIND_META[offer.kind]
  const credits = creditsNeeded(offer.priceEur)
  const wallet = getWallet()
  const creditBal = getCredits().balance
  const disclaimer = resolved === 'de' ? TRAVEL_DISCLAIMER_DE : TRAVEL_DISCLAIMER_EN

  const book = async () => {
    setErr(null)
    setBusy(true)
    if (!user) loginDemo()
    const payerId = user?.id ?? DEMO_USER_ID
    const payerName = user?.name ?? 'Alex Müller'
    const result = await bookTravelOffer({
      offer,
      payerId,
      payerName,
      pay,
      methodId,
    })
    setBusy(false)
    if (!result.ok) {
      setErr(result.reason === 'credits' ? t('checkout.needCredits') : t('checkout.fail'))
      return
    }
    navigate(`/tickets/${result.ticket.id}`)
  }

  return (
    <div className="mx-auto max-w-lg space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">
          {t('checkout.kicker')}
        </p>
        <h1 className="text-2xl font-bold tracking-tight">{t('checkout.title')}</h1>
        <p className="text-sm text-muted">{t('checkout.lead')}</p>
      </header>

      <p className="rounded-2xl border-2 border-amber-400/70 bg-amber-500/20 px-3 py-3 text-sm font-semibold text-amber-100">
        {t('checkout.demoBanner')}
      </p>
      <p className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        {disclaimer}
      </p>
      <WalletDisclaimer />

      <section className="rounded-2xl border border-border bg-surface-2 p-4">
        <div className="flex items-start gap-3">
          <span className="text-2xl">{offer.imageEmoji}</span>
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-white">{offer.title}</p>
            <p className="text-xs text-muted">
              {resolved === 'de' ? meta.de : meta.en} · {offer.provider}
            </p>
            <p className="mt-1 text-sm text-neutral-300">
              {offer.from ? `${offer.from} → ` : ''}
              {offer.to} · {offer.dateFrom}
              {offer.dateTo ? ` – ${offer.dateTo}` : ''}
            </p>
          </div>
          <p className="text-lg font-bold tabular-nums">{formatPrice(offer.priceEur)}</p>
        </div>
      </section>

      <section className="space-y-2">
        <h2 className="text-sm font-semibold">{t('checkout.pay')}</h2>
        <div className="grid grid-cols-2 gap-2">
          {(['fiat', 'credits'] as const).map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => setPay(id)}
              className={cn(
                'min-h-11 rounded-xl border px-3 text-sm',
                pay === id
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                  : 'border-border bg-surface-2',
              )}
            >
              {id === 'fiat' ? t('checkout.fiat') : t('checkout.credits')}
            </button>
          ))}
        </div>
        {pay === 'fiat' ? (
          <div className="space-y-2">
            <p className="text-xs text-muted">
              {t('checkout.walletBal')}: {formatPrice(wallet.balanceEur)} · {t('checkout.noCharge')}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {WALLET_METHODS.filter((m) => m.group === 'fiat').map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setMethodId(m.id)}
                  className={cn(
                    'min-h-10 rounded-full border px-3 text-xs',
                    methodId === m.id
                      ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                      : 'border-border',
                  )}
                >
                  {m.icon} {m.label}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted">
            {t('checkout.creditHint')} {credits} / {creditBal} Credits
            {creditBal < credits ? ` — ${t('checkout.needCredits')}` : ''}
          </p>
        )}
      </section>

      {err && (
        <p className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs text-rose-200">{err}</p>
      )}

      <Button className="w-full" onClick={book} disabled={busy}>
        {busy ? t('checkout.working') : t('checkout.confirm')}
      </Button>
      <p className="text-center text-xs font-semibold uppercase tracking-wide text-amber-200">{t('badge.demo')}</p>
      <p className="text-center text-[11px] text-neutral-500">{CREDITS_COSTS.booking.label}</p>
    </div>
  )
}
