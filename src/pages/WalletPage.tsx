import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowDownLeft,
  ArrowUpRight,
  Link2,
  Link2Off,
  Loader2,
  Wallet,
} from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { WalletDisclaimer } from '../components/wallet/WalletDisclaimer'
import { useWallet } from '../hooks/useWallet'
import {
  WALLET_METHODS,
  connectMethod,
  disconnectMethod,
  mockAdjustBalance,
  resetWallet,
  type WalletMethodId,
} from '../lib/wallet'
import { formatDateTime, formatPrice } from '../lib/utils'
import { cn } from '../lib/utils'

export function WalletPage() {
  const { wallet } = useWallet()
  const [busy, setBusy] = useState<WalletMethodId | null>(null)
  const [sheet, setSheet] = useState<null | 'topup' | 'payout'>(null)
  const [flash, setFlash] = useState<string | null>(null)

  const connectedCount = WALLET_METHODS.filter((m) => wallet.methods[m.id].connected).length

  const runConnect = (id: WalletMethodId, next: boolean) => {
    setBusy(id)
    window.setTimeout(() => {
      if (next) connectMethod(id)
      else disconnectMethod(id)
      setBusy(null)
      setFlash(next ? 'Methode verbunden (Demo — kein Provider-Call).' : 'Methode getrennt.')
      window.setTimeout(() => setFlash(null), 2800)
    }, 650)
  }

  const runCash = (type: 'topup' | 'payout') => {
    const method =
      WALLET_METHODS.find((m) => wallet.methods[m.id].connected)?.id ?? 'sepa'
    mockAdjustBalance(type, type === 'topup' ? 250 : 100, method)
    setSheet(null)
    setFlash(
      type === 'topup'
        ? 'Demo-Einzahlung +250 € — kein echtes Geld.'
        : 'Demo-Auszahlung −100 € — kein echtes Geld.',
    )
    window.setTimeout(() => setFlash(null), 2800)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-5 pb-scroll-chrome">
      <header className="space-y-1">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">Zahlungen</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Wallet size={22} className="text-cyan" /> Wallet
        </h1>
        <p className="text-sm text-muted">
          Finance-App-UX für LoadIn — ausschließlich lokal, Mock-Provider.
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
        <p className="mt-2 text-xs text-neutral-300">
          {connectedCount} Methode{connectedCount === 1 ? '' : 'n'} verbunden · Guthaben nur lokal
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

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Zahlungsmethoden</h2>
        <div className="space-y-2">
          {WALLET_METHODS.map((m) => {
            const st = wallet.methods[m.id]
            const on = st.connected
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
              const sign = tx.type === 'payout' || tx.type === 'pay' ? '−' : tx.type === 'topup' ? '+' : ''
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
            setFlash('Wallet auf Demo-Start zurückgesetzt.')
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
