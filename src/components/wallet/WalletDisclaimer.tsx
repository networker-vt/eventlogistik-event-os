import { ShieldAlert } from 'lucide-react'
import { WALLET_DISCLAIMER_DE } from '../../lib/wallet'
import { cn } from '../../lib/utils'

export function WalletDisclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      role="status"
      className={cn(
        'flex items-start gap-3 rounded-2xl border-2 border-amber-400/70 bg-amber-500/20 px-4 py-3 text-amber-50 shadow-[0_0_24px_rgba(251,191,36,0.12)]',
        className,
      )}
    >
      <ShieldAlert size={20} className="mt-0.5 shrink-0 text-amber-300" />
      <div className="min-w-0">
        <p className="text-sm font-bold uppercase tracking-wide text-amber-200">Demo — kein echtes Geld</p>
        <p className={cn('mt-1 leading-relaxed text-amber-100/90', compact ? 'text-xs' : 'text-xs')}>
          {WALLET_DISCLAIMER_DE} Credits: hartes Cap 21.000.000, client-seitiges Demo-Ledger. Echte
          Enforcement braucht später Server/Chain — dieser Client mint nie darüber. Packs sind ein Stub
          bis Stripe/PayPal.
        </p>
      </div>
    </div>
  )
}
