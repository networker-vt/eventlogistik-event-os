import { useEffect, useState } from 'react'
import { Button } from '../ui/Button'
import {
  getReminders,
  remainingReminderSlots,
  setReminderOptIn,
  subscribeReminders,
} from '../../lib/reminders'
import { useI18n } from '../../lib/i18n'

export function ReminderOptIn() {
  const { t } = useI18n()
  const [state, setState] = useState(getReminders)

  useEffect(() => subscribeReminders(() => setState(getReminders())), [])

  return (
    <section className="space-y-2 rounded-2xl border border-border bg-surface-2 p-4">
      <h2 className="text-lg font-semibold">{t('remind.title')}</h2>
      <p className="text-sm text-muted">{t('remind.lead')}</p>
      <Button size="sm" variant={state.optIn ? 'secondary' : 'primary'} onClick={() => setReminderOptIn(!state.optIn)}>
        {state.optIn ? t('remind.off') : t('remind.on')}
      </Button>
      {state.optIn && (
        <p className="text-[11px] text-muted">
          {t('remind.cap')} · {remainingReminderSlots()} {t('remind.left')}
        </p>
      )}
    </section>
  )
}
