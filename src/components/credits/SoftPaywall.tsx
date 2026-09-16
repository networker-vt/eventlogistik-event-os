import { Link } from 'react-router-dom'
import { Button } from '../ui/Button'
import { CREDITS_FREE_DE, CREDITS_FREE_EN } from '../../lib/credits'
import { useI18n } from '../../lib/i18n'

/** Soft paywall — only at money moments (boosts, extra swipes, travel deep, priority interview). */
export function SoftPaywall({
  title,
  hint,
  cost,
  onBuy,
  onClose,
  walletTo = '/wallet',
}: {
  title: string
  hint?: string
  cost: number
  onBuy: () => void
  onClose: () => void
  walletTo?: string
}) {
  const { t, resolved } = useI18n()
  const free = resolved === 'de' ? CREDITS_FREE_DE : CREDITS_FREE_EN
  return (
    <div className="fixed inset-x-4 bottom-28 z-40 mx-auto max-w-sm rounded-2xl border border-violet-400/40 bg-surface-2 p-4 shadow-xl md:bottom-8">
      <p className="text-sm font-semibold text-white">{title}</p>
      <p className="mt-1 text-xs text-muted">{hint || t('paywall.hint')}</p>
      <p className="mt-2 text-[11px] text-neutral-400">{t('paywall.freeLane')}</p>
      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11px] text-neutral-400">
        {free.slice(0, 4).map((row) => (
          <li key={row}>{row}</li>
        ))}
      </ul>
      <div className="mt-3 flex flex-col gap-2">
        <Button size="sm" className="w-full" onClick={onBuy}>
          {t('paywall.buy')} · {cost} Credits
        </Button>
        <Link to={walletTo} className="text-center text-xs text-[var(--theme-accent)] hover:underline">
          {t('paywall.wallet')}
        </Link>
        <button type="button" className="text-xs text-muted hover:underline" onClick={onClose}>
          {t('paywall.later')}
        </button>
      </div>
    </div>
  )
}
