import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { useI18n } from '../../lib/i18n'
import { isKidsMode, subscribeKids } from '../../lib/kids'
import { HEUTE_ACTIONS, claimHeute, heuteStatus, subscribeHeute, type HeuteActionId } from '../../lib/heuteVerdienen'

/** Mein only. Quiet earn list — never a Home credits peek. */
export function HeuteVerdienen() {
  const { t } = useI18n()
  const [kids, setKids] = useState(isKidsMode)
  const [status, setStatus] = useState(heuteStatus)

  useEffect(() => {
    const u1 = subscribeKids(() => {
      setKids(isKidsMode())
      setStatus(heuteStatus())
    })
    const u2 = subscribeHeute(() => setStatus(heuteStatus()))
    return () => {
      u1()
      u2()
    }
  }, [])

  return (
    <section className="rounded-2xl border border-border bg-surface-2 p-4" data-heute-verdienen={kids ? 'kids' : '1'}>
      <h2 className="text-sm font-semibold text-ink">{t('mein.heuteTitle')}</h2>
      <p className="mt-1 text-xs text-muted">{kids ? t('mein.heuteKids') : t('mein.heuteHint')}</p>
      <p className="mt-2 text-xs tabular-nums text-muted">
        {t('mein.heuteCap')} {kids ? 0 : status.earned}/{kids ? 0 : status.cap}
      </p>
      {!kids && (
        <ul className="mt-3 space-y-2">
          {HEUTE_ACTIONS.map((action) => {
            const done = status.done.includes(action.id)
            const blocked = done || status.earned + action.amount > status.cap
            return (
              <li key={action.id} className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink">
                  {t(action.labelKey)} · {action.amount}
                </span>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  disabled={blocked}
                  onClick={() => void claimHeute(action.id as HeuteActionId)}
                >
                  {done ? t('mein.heuteDone') : String(action.amount)}
                </Button>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
