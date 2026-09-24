import { useState } from 'react'
import { Check, Loader2, Wallet, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { WalletDisclaimer } from './WalletDisclaimer'
import { useWallet } from '../../hooks/useWallet'
import {
  WALLET_METHODS,
  mockPayBooking,
  type WalletMethodId,
} from '../../lib/wallet'
import { formatPrice } from '../../lib/utils'
import { cn } from '../../lib/utils'

export function PaySheet({
  open,
  onClose,
  amountEur,
  title,
  bookingId,
  onSuccess,
}: {
  open: boolean
  onClose: () => void
  amountEur: number
  title: string
  bookingId: string
  onSuccess: () => void
}) {
  const { wallet } = useWallet()
  const connected = WALLET_METHODS.filter((m) => wallet.methods[m.id].connected)
  const [methodId, setMethodId] = useState<WalletMethodId | ''>('')
  const [phase, setPhase] = useState<'pick' | 'busy' | 'done'>('pick')

  if (!open) return null

  const selected = methodId || connected[0]?.id || ''
  const amount = amountEur > 0 ? amountEur : 0

  const pay = () => {
    if (!selected) return
    setPhase('busy')
    window.setTimeout(() => {
      mockPayBooking({
        amountEur: amount,
        methodId: selected,
        bookingId,
        label: `Buchung · ${title}`,
      })
      setPhase('done')
      window.setTimeout(() => {
        onSuccess()
        setPhase('pick')
      }, 900)
    }, 850)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-3 sm:items-center">
      <button type="button" aria-label="Schließen" className="absolute inset-0" onClick={onClose} />
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border bg-surface-2 shadow-2xl">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-semibold">
            <Wallet size={16} className="text-cyan" /> Zahlung (Demo)
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Schließen"
            className="tap-target flex h-11 w-11 items-center justify-center rounded-full text-muted hover:bg-ink/5"
          >
            <X size={16} />
          </button>
        </div>

        <div className="space-y-4 p-4">
          <WalletDisclaimer compact />

          <div className="rounded-2xl border border-cyan/25 bg-cyan/10 px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-cyan">Zu zahlen</div>
            <div className="text-3xl font-bold tabular-nums text-ink">{formatPrice(amount)}</div>
            <p className="mt-1 line-clamp-2 text-xs text-neutral-300">{title}</p>
          </div>

          {phase === 'done' ? (
            <div className="flex flex-col items-center gap-2 py-4 text-center">
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-cyan/40 bg-cyan/15 text-cyan">
                <Check size={22} />
              </span>
              <p className="font-semibold text-cyan">Demo-Zahlung erfolgreich</p>
              <p className="text-xs text-muted">Keine echte Bewegung · Buchung wird bestätigt</p>
            </div>
          ) : connected.length === 0 ? (
            <div className="rounded-xl border border-border bg-surface-3/60 p-4 text-sm">
              <p className="text-neutral-200">Keine Zahlungsmethode verbunden.</p>
              <p className="mt-1 text-xs text-muted">
                Verbinde PayPal, Karte, SEPA oder Krypto im Wallet — alles nur Demo.
              </p>
              <Link to="/wallet" className="mt-3 inline-block text-sm font-medium text-cyan hover:underline">
                Zum Wallet →
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-xs font-medium uppercase tracking-wider text-muted">Methode</p>
              {connected.map((m) => {
                const meta = wallet.methods[m.id]
                const on = selected === m.id
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethodId(m.id)}
                    className={cn(
                      'flex w-full items-center gap-3 rounded-xl border px-3 py-3 text-left',
                      on ? 'border-cyan/50 bg-cyan/10' : 'border-border bg-surface-3/50 hover:border-cyan/25',
                    )}
                  >
                    <span className="text-lg">{m.icon}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-medium">{m.label}</span>
                      <span className="block truncate text-xs text-muted">{meta.display}</span>
                    </span>
                    <span
                      className={cn(
                        'h-4 w-4 rounded-full border',
                        on ? 'border-cyan bg-cyan' : 'border-neutral-500',
                      )}
                    />
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex flex-wrap gap-2">
            {phase !== 'done' && (
              <Button
                className="flex-1"
                disabled={!selected || phase === 'busy' || connected.length === 0}
                onClick={pay}
              >
                {phase === 'busy' ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Demo läuft…
                  </>
                ) : (
                  'Demo-Zahlung bestätigen'
                )}
              </Button>
            )}
            <Button variant="ghost" onClick={onClose} disabled={phase === 'busy'}>
              Abbrechen
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
