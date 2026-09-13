import { ShieldAlert } from 'lucide-react'
import { WALLET_DISCLAIMER_DE } from '../../lib/wallet'
import { cn } from '../../lib/utils'

export function WalletDisclaimer({ className, compact = false }: { className?: string; compact?: boolean }) {
  return (
    <div
      role="note"
      className={cn(
        'flex items-start gap-2.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-amber-100',
        className,
      )}
    >
      <ShieldAlert size={16} className="mt-0.5 shrink-0 text-amber-300" />
      <p className={cn('leading-relaxed', compact ? 'text-[11px]' : 'text-xs')}>
        <strong className="font-semibold text-amber-200">Kein echtes Geld. </strong>
        {WALLET_DISCLAIMER_DE}
      </p>
    </div>
  )
}
