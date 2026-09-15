import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowLeftRight,
  ArrowUpRight,
  Landmark,
  Link2,
  Link2Off,
  Loader2,
  Wallet,
} from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Input, Select } from '../components/ui/Input'
import { WalletDisclaimer } from '../components/wallet/WalletDisclaimer'
import { useFx } from '../hooks/useFx'
import { useWallet } from '../hooks/useWallet'
import { convertFx, FX_CODES, formatFx, type FxCode } from '../lib/fx'
import {
  CREDITS_COSTS,
  CREDITS_DISCLAIMER_DE,
  CREDITS_PER_EUR,
  claimReferralCreditsDemo,
  creditsToEur,
  exchangeCreditsToEur,
  exchangeEurToCredits,
  getCredits,
  spendCredits,
  subscribeCredits,
} from '../lib/credits'
import {
  WALLET_METHODS,
  connectMethod,
  disconnectMethod,
  mockAdjustBalance,
  mockCryptoWithdraw,
  mockPlatformCheckout,
  mockPayoutIban,
  resetWallet,
  type WalletMethodId,
} from '../lib/wallet'
import { formatDateTime, formatPrice } from '../lib/utils'
import { cn } from '../lib/utils'

export function WalletPage() {
  const { wallet } = useWallet()
  const { fx } = useFx()
  const [busy, setBusy] = useState<WalletMethodId | null>(null)
  const [sheet, setSheet] = useState<null | 'topup' | 'payout'>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const [fxAmount, setFxAmount] = useState('250')
  const [fxTo, setFxTo] = useState<FxCode>('USD')
  const [iban, setIban] = useState('')
  const [bic, setBic] = useState('')
  const [holder, setHolder] = useState('')
  const [payoutAmt, setPayoutAmt] = useState('100')
  const [cryptoAddr, setCryptoAddr] = useState('')
  const [cryptoAsset, setCryptoAsset] = useState<'btc' | 'usdc' | 'usdt'>('usdt')
  const [cryptoAmt, setCryptoAmt] = useState('50')
  const [credits, setCredits] = useState(getCredits)
  const [creditAmt, setCreditAmt] = useState('50')

  useEffect(() => subscribeCredits(() => setCredits(getCredits())), [])

  const connectedCount = WALLET_METHODS.filter((m) => wallet.methods[m.id]?.connected).length
  const eur = Number(fxAmount) || 0
  const converted = convertFx(eur, fxTo, fx.rates)

  const note = (msg: string) => {
    setFlash(msg)
    window.setTimeout(() => setFlash(null), 3200)
  }

  const runConnect = (id: WalletMethodId, next: boolean) => {
    setBusy(id)
    window.setTimeout(() => {
      if (next) connectMethod(id)
      else disconnectMethod(id)
      setBusy(null)
      note(next ? 'Methode verbunden (Demo — kein Provider-Call).' : 'Methode getrennt.')
    }, 650)
  }

  const runCash = (type: 'topup' | 'payout') => {
    const method = WALLET_METHODS.find((m) => wallet.methods[m.id]?.connected)?.id ?? 'sepa'
    mockAdjustBalance(type, type === 'topup' ? 250 : 100, method)
    setSheet(null)
    note(type === 'topup' ? 'Demo-Einzahlung +250 € — kein echtes Geld.' : 'Demo-Auszahlung −100 € — kein echtes Geld.')
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">Zahlungen</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Wallet size={22} className="text-cyan" /> Wallet
        </h1>
        <p className="text-sm text-muted">
          Plattform-Zahlung, FX und Auszahlung — Demo bis Stripe/PayPal/Banking-Partner + KYC.
        </p>
      </header>

      <WalletDisclaimer />

      {flash && (
        <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan">{flash}</p>
      )}

      <section className="relative overflow-hidden rounded-3xl border border-cyan/30 bg-gradient-to-br from-cyan/15 via-surface-2 to-black p-5">
        <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan/20 blur-3xl" />
        <p className="text-[11px] uppercase tracking-wider text-cyan">Verfügbar (Demo)</p>
        <div className="mt-1 text-4xl font-bold tabular-nums tracking-tight text-white">
          {formatPrice(wallet.balanceEur)}
        </div>
        <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-neutral-300">
          {FX_CODES.filter((c) => c !== 'EUR').map((c) => (
            <span key={c}>
              {c} {formatFx(convertFx(wallet.balanceEur, c, fx.rates), c)}
            </span>
          ))}
        </div>
        <p className="mt-2 text-xs text-neutral-300">
          {connectedCount} Methode{connectedCount === 1 ? '' : 'n'} verbunden · Kurse {fx.source} ·
          indikativ
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => setSheet('topup')}>
            <ArrowDownLeft size={16} /> Einzahlen
          </Button>
          <Button size="sm" variant="secondary" onClick={() => setSheet('payout')}>
            <ArrowUpRight size={16} /> Auszahlen
          </Button>
          <Link
            to="/mein"
            className="inline-flex min-h-10 items-center rounded-lg px-3 text-sm text-neutral-300 hover:text-cyan"
          >
            Zu Favoriten
          </Link>
        </div>
      </section>


      <section className="rounded-2xl border border-violet-500/35 bg-violet-500/10 p-5 space-y-3">
        <h2 className="text-lg font-semibold text-violet-200">Orbit Credits</h2>
        <p className="text-3xl font-bold tabular-nums text-white">
          {credits.balance}{' '}
          <span className="text-sm font-normal text-muted">
            ≈ {creditsToEur(credits.balance).toFixed(2)} € indikativ ({CREDITS_PER_EUR} Cr / €)
          </span>
        </p>
        <p className="text-xs text-violet-100/80">{CREDITS_DISCLAIMER_DE}</p>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              claimReferralCreditsDemo()
              note('+25 Credits Referral-Demo')
            }}
          >
            Referral verdienen
          </Button>
          {Object.entries(CREDITS_COSTS).map(([kind, meta]) => (
            <Button
              key={kind}
              size="sm"
              variant="ghost"
              onClick={() => {
                const ok = spendCredits(meta.credits, kind as 'featured' | 'unlock_message' | 'demo_gig', meta.label)
                note(ok ? `−${meta.credits} Credits: ${meta.label}` : 'Nicht genug Credits')
              }}
            >
              {meta.label} (−{meta.credits})
            </Button>
          ))}
        </div>
        <div className="flex flex-wrap items-end gap-2 border-t border-violet-500/20 pt-3">
          <Input
            label="Umtausch Betrag"
            type="number"
            value={creditAmt}
            onChange={(e) => setCreditAmt(e.target.value)}
          />
          <Button
            size="sm"
            onClick={() => {
              const n = Number(creditAmt) || 0
              const ok = exchangeEurToCredits(n)
              note(ok ? `EUR→Credits: ${n} €` : 'Wallet-EUR reicht nicht')
            }}
          >
            € → Credits
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              const n = Number(creditAmt) || 0
              const ok = exchangeCreditsToEur(n)
              note(ok ? `Credits→€: ${n} Cr` : 'Credits reichen nicht')
            }}
          >
            Credits → €
          </Button>
        </div>
        <ul className="max-h-40 space-y-1 overflow-y-auto text-xs text-neutral-300">
          {credits.txs.slice(0, 8).map((tx) => (
            <li key={tx.id} className="flex justify-between gap-2">
              <span className="truncate">{tx.label}</span>
              <span className="tabular-nums shrink-0">
                {tx.type === 'spend' || tx.type === 'exchange_out' ? '−' : '+'}
                {tx.amount}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {sheet && (
        <div className="rounded-2xl border border-amber-500/35 bg-amber-500/10 p-4">
          <p className="text-sm font-semibold text-amber-100">
            {sheet === 'topup' ? 'Demo-Einzahlung' : 'Demo-Auszahlung'}
          </p>
          <p className="mt-1 text-xs text-amber-100/85">
            Kein Bank- oder Krypto-Transfer. Der Betrag ändert nur die lokale Anzeige.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" onClick={() => runCash(sheet)}>
              {sheet === 'topup' ? '+250 € Demo' : '−100 € Demo'}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setSheet(null)}>
              Abbrechen
            </Button>
          </div>
        </div>
      )}

      <section className="card-elevated space-y-3 rounded-2xl border border-border p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <ArrowLeftRight size={18} className="text-cyan" /> FX-Rechner
        </h2>
        <p className="text-xs text-muted">
          EUR → USD / GBP / CHF / USDT. Kurse indikativ
          {fx.source === 'static' ? ' (statisch)' : ' (Frankfurter.app, USDT ≈ USD)'}. Kein Handel.
        </p>
        <div className="grid gap-3 sm:grid-cols-2">
          <Input
            label="Betrag in EUR"
            type="number"
            min={0}
            value={fxAmount}
            onChange={(e) => setFxAmount(e.target.value)}
          />
          <Select label="Zielwährung" value={fxTo} onChange={(e) => setFxTo(e.target.value as FxCode)}>
            {FX_CODES.filter((c) => c !== 'EUR').map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </div>
        <p className="text-2xl font-bold tabular-nums text-cyan">{formatFx(converted, fxTo)}</p>
        <div className="flex flex-wrap gap-1.5 text-[11px] text-muted">
          {FX_CODES.map((c) => (
            <span key={c} className="chip">
              1 EUR = {c === 'EUR' ? '1' : fx.rates[c].toFixed(3)} {c}
            </span>
          ))}
        </div>
      </section>

      <section className="card-elevated space-y-3 rounded-2xl border border-border p-5">
        <h2 className="text-lg font-semibold">Auf der Plattform zahlen</h2>
        <p className="text-xs text-muted">
          Mock-Checkout für Bookings & Featured. Bestätigung ändert nur das Demo-Guthaben.
        </p>
        <Button
          size="sm"
          onClick={() => {
            mockPlatformCheckout({ amountEur: 49, label: 'Featured-Listing 7 Tage (Demo-Checkout)' })
            note('Demo-Checkout −49 € — kein Stripe/PayPal.')
          }}
        >
          Featured 7 Tage · 49 € (Demo)
        </Button>
        <Link to="/jobs" className="block text-sm text-cyan hover:underline">
          Bookings über die Booking-Seite mit Pay-Sheet zahlen →
        </Link>
      </section>

      <section className="card-elevated space-y-3 rounded-2xl border border-border p-5">
        <h2 className="flex items-center gap-2 text-lg font-semibold">
          <Landmark size={18} className="text-cyan" /> Auszahlung aufs Konto
        </h2>
        <p className="text-xs text-muted">IBAN-Formular — Stub. Kein Banking-Partner, keine SEPA-Datei.</p>
        <Input label="Kontoinhaber" value={holder} onChange={(e) => setHolder(e.target.value)} placeholder="Mirco Küßner" />
        <Input label="IBAN" value={iban} onChange={(e) => setIban(e.target.value)} placeholder="DE89 ACCT-000034" />
        <Input label="BIC (optional)" value={bic} onChange={(e) => setBic(e.target.value)} placeholder="COBADEFFXXX" />
        <Input
          label="Betrag €"
          type="number"
          min={1}
          value={payoutAmt}
          onChange={(e) => setPayoutAmt(e.target.value)}
        />
        <Button
          size="sm"
          disabled={!iban || !holder}
          onClick={() => {
            mockPayoutIban({ iban, bic, holder, amountEur: Number(payoutAmt) || 0 })
            note('Demo-Auszahlung vorgemerkt — kein echter Überweisungsauftrag.')
          }}
        >
          Demo-Auszahlung
        </Button>
      </section>

      <section className="card-elevated space-y-3 rounded-2xl border border-border p-5">
        <h2 className="text-lg font-semibold">Krypto-Auszahlung</h2>
        <p className="text-xs text-muted">Adresse + Asset — kein On-Chain, keine Exchange-API.</p>
        <Select
          label="Asset"
          value={cryptoAsset}
          onChange={(e) => setCryptoAsset(e.target.value as 'btc' | 'usdc' | 'usdt')}
        >
          <option value="usdt">USDT</option>
          <option value="usdc">USDC</option>
          <option value="btc">BTC</option>
        </Select>
        <Input
          label="Adresse / Invoice"
          value={cryptoAddr}
          onChange={(e) => setCryptoAddr(e.target.value)}
          placeholder="bc1q… oder 0x… / T…"
        />
        <Input
          label="Betrag € (Gegenwert)"
          type="number"
          min={1}
          value={cryptoAmt}
          onChange={(e) => setCryptoAmt(e.target.value)}
        />
        <Button
          size="sm"
          disabled={!cryptoAddr}
          onClick={() => {
            mockCryptoWithdraw({
              asset: cryptoAsset,
              address: cryptoAddr,
              amountEur: Number(cryptoAmt) || 0,
            })
            note('Krypto-Withdraw nur lokal gebucht — keine Chain.')
          }}
        >
          Demo-Withdraw
        </Button>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Zahlungsmethoden</h2>
        <div className="space-y-2">
          {WALLET_METHODS.map((m) => {
            const st = wallet.methods[m.id]
            const on = Boolean(st?.connected)
            return (
              <article
                key={m.id}
                className={cn(
                  'flex items-center gap-3 rounded-2xl border p-4',
                  on ? 'border-cyan/30 bg-cyan/5' : 'border-border bg-surface-2',
                )}
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-xl border border-border bg-black/40 text-lg">
                  {m.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-sm font-semibold">{m.label}</h3>
                    <Badge tone={on ? 'green' : 'default'}>{on ? 'verbunden' : 'nicht verbunden'}</Badge>
                    {m.group === 'crypto' && <Badge tone="amber">Krypto</Badge>}
                  </div>
                  <p className="mt-0.5 text-[11px] text-muted">{on ? st.display : m.hint}</p>
                </div>
                <Button
                  size="sm"
                  variant={on ? 'ghost' : 'secondary'}
                  disabled={busy === m.id}
                  onClick={() => runConnect(m.id, !on)}
                >
                  {busy === m.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : on ? (
                    <>
                      <Link2Off size={14} /> Trennen
                    </>
                  ) : (
                    <>
                      <Link2 size={14} /> Verbinden
                    </>
                  )}
                </Button>
              </article>
            )
          })}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Umsätze</h2>
        {wallet.txs.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Demo-Buchungen.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-2">
            {wallet.txs.slice(0, 20).map((tx) => {
              const meta = WALLET_METHODS.find((m) => m.id === tx.methodId)
              const sign =
                tx.type === 'payout' || tx.type === 'pay' || tx.type === 'withdraw_crypto' ? '−' : tx.type === 'topup' ? '+' : ''
              return (
                <li key={tx.id} className="flex items-center justify-between gap-3 px-4 py-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm text-white">{tx.label}</p>
                    <p className="text-[11px] text-muted">
                      {meta?.label} · {formatDateTime(tx.createdAt)} · Demo
                    </p>
                  </div>
                  {tx.amountEur > 0 && (
                    <span
                      className={cn(
                        'shrink-0 text-sm font-semibold tabular-nums',
                        sign === '−' ? 'text-rose-300' : 'text-cyan',
                      )}
                    >
                      {sign}
                      {formatPrice(tx.amountEur)}
                    </span>
                  )}
                </li>
              )
            })}
          </ul>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="ghost"
          onClick={() => {
            resetWallet()
            note('Wallet auf Demo-Start zurückgesetzt.')
          }}
        >
          Wallet reset
        </Button>
        <Link to="/profile" className="self-center text-sm text-cyan hover:underline">
          Zum Profil
        </Link>
      </div>
    </div>
  )
}
