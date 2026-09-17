import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { useI18n } from '../../lib/i18n'
import {
  checkParentalAnswer,
  makeParentalChallenge,
  subscribeParentalGate,
  unlockParentalSession,
  type ParentalReason,
} from '../../lib/kids'

const REASON_KEY: Record<ParentalReason, string> = {
  leave_kids: 'kids.gateLeave',
  credits_spend: 'kids.gateCredits',
  external_social: 'kids.gateSocial',
}

export function ParentalGate({
  open,
  reason = 'leave_kids',
  onClose,
  onUnlocked,
}: {
  open: boolean
  reason?: ParentalReason
  onClose: () => void
  onUnlocked: () => void
}) {
  const { t, resolved } = useI18n()
  const [challenge] = useState(() => makeParentalChallenge(Date.now()))
  const [answer, setAnswer] = useState('')
  const [tries, setTries] = useState(0)
  const [err, setErr] = useState<string | null>(null)

  if (!open) return null

  const prompt = resolved === 'de' ? challenge.promptDe : challenge.promptEn
  const locked = tries >= 3

  const submit = () => {
    if (locked) return
    if (!checkParentalAnswer(challenge, answer)) {
      const next = tries + 1
      setTries(next)
      setErr(next >= 3 ? t('kids.gateLocked') : t('kids.gateWrong'))
      return
    }
    unlockParentalSession()
    onUnlocked()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/40 p-4 md:items-center" role="dialog" aria-modal="true" aria-labelledby="parental-gate-title">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-4 shadow-xl">
        <p className="text-xs font-medium uppercase tracking-wider text-[var(--theme-accent)]">{t('kids.gateKicker')}</p>
        <h2 id="parental-gate-title" className="mt-1 text-lg font-semibold text-ink">
          {t('kids.gateTitle')}
        </h2>
        <p className="mt-1 text-sm text-muted">{t(REASON_KEY[reason])}</p>
        <p className="mt-3 text-sm font-medium text-ink">{prompt}</p>
        <form
          className="mt-3 space-y-3"
          onSubmit={(e) => {
            e.preventDefault()
            submit()
          }}
        >
          <Input
            label={t('kids.gateAnswer')}
            inputMode="numeric"
            autoComplete="off"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={locked}
          />
          {err && <p className="text-xs text-rose-300">{err}</p>}
          <div className="flex gap-2">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
              {t('kids.gateCancel')}
            </Button>
            <Button type="submit" className="flex-1" disabled={locked}>
              {t('kids.gateConfirm')}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

/** App-level listener: opens the gate when credits/social/leave request it. */
export function ParentalGateHost({
  onUnlocked,
}: {
  onUnlocked?: (reason: ParentalReason) => void
}) {
  const [reason, setReason] = useState<ParentalReason | null>(null)
  useEffect(
    () =>
      subscribeParentalGate((next) => {
        setReason(next)
      }),
    [],
  )
  if (!reason) return null
  return (
    <ParentalGate
      key={reason}
      open
      reason={reason}
      onClose={() => setReason(null)}
      onUnlocked={() => {
        const r = reason
        setReason(null)
        if (r) onUnlocked?.(r)
      }}
    />
  )
}
