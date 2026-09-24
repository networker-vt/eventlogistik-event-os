import { getProtocol } from '../../lib/creditProtocol'
import { getCredits } from '../../lib/credits'
import { useI18n } from '../../lib/i18n'

export function BurnTable() {
  const { t } = useI18n()
  const protocol = getProtocol()
  const burns = getCredits().txs.filter((tx) => tx.kind === 'sponsor_fee' || /gebrannt|burn/i.test(tx.label))
  return (
    <div className="rounded-xl border border-violet-400/20 bg-black/20 p-3">
      <h3 className="text-sm font-semibold">{t('credits.burnTitle')}</h3>
      <p className="mt-0.5 text-xs text-muted">{t('credits.burnHint')}</p>
      <p className="mt-2 text-lg font-bold tabular-nums text-ink">
        {protocol.burned.toLocaleString('de-DE')}{' '}
        <span className="text-xs font-normal text-muted">{t('credits.burnedTotal')}</span>
      </p>
      {burns.length === 0 ? (
        <p className="mt-2 text-xs text-muted">{t('credits.burnEmpty')}</p>
      ) : (
        <ul className="mt-2 space-y-1 text-xs text-neutral-300">
          {burns.slice(0, 6).map((tx) => (
            <li key={tx.id} className="flex justify-between gap-2">
              <span className="truncate">{tx.label}</span>
              <span className="shrink-0 tabular-nums">−{tx.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
