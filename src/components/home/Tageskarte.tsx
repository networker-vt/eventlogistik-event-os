import { Link } from 'react-router-dom'
import {
  clearPlan,
  primaryAssistAction,
  type AssistPlan,
} from '../../lib/assist'
import { enqueueReminder } from '../../lib/reminders'
import {
  tageskarteCopy,
  type DaySlot,
  type TageskarteItem,
} from '../../lib/tageskarte'
import { useI18n } from '../../lib/i18n'

/** Exactly one Home product card — daily suggestion, with Assist plan merged in when present. */
export function Tageskarte({
  item,
  slot,
  plan,
  onUsePrompt,
}: {
  item: TageskarteItem
  slot: DaySlot
  plan: AssistPlan | null
  onUsePrompt: (prompt: string) => void
}) {
  const { t, resolved } = useI18n()
  const daily = tageskarteCopy(item, resolved)
  const action = plan ? primaryAssistAction(plan) : null

  return (
    <section
      className="rounded-2xl border border-border/80 bg-surface-2/40 p-4"
      aria-label={t('home.tageskarte')}
      data-tageskarte="1"
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium uppercase tracking-wider text-muted">
          {t('home.tageskarte')}
          <span className="text-neutral-600"> · {t(`home.slot.${slot}`)}</span>
        </p>
        {plan && (
          <button type="button" className="text-[11px] text-muted hover:underline" onClick={() => clearPlan()}>
            {t('assist.clear')}
          </button>
        )}
      </div>

      {plan ? (
        <>
          <h2 className="mt-1 text-base font-semibold text-white">{plan.summary}</h2>
          {action && <p className="mt-1 text-sm text-neutral-300">{action.title}</p>}
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            {action?.actionTo && (
              <Link to={action.actionTo} className="text-sm text-[var(--theme-accent)] hover:underline">
                {action.actionLabel || t('home.next')} →
              </Link>
            )}
            {action?.actionTo && (
              <button
                type="button"
                className="text-[11px] text-muted hover:underline"
                onClick={() => {
                  enqueueReminder({
                    title: plan.summary,
                    actionTo: action.actionTo!,
                    actionLabel: action.actionLabel || t('home.next'),
                  })
                }}
              >
                {t('assist.remind')}
              </button>
            )}
          </div>
          <p className="mt-3 border-t border-border/60 pt-2 text-[11px] text-muted">
            {t('home.tageskarteAlso')}: {daily.title}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-1 text-base font-semibold text-white">{daily.title}</h2>
          <p className="mt-1 text-sm text-neutral-300">{daily.body}</p>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1">
            <button
              type="button"
              className="text-sm text-[var(--theme-accent)] hover:underline"
              onClick={() => onUsePrompt(daily.prompt)}
            >
              {t('home.tageskarteDo')} →
            </button>
            {item.to && (
              <Link to={item.to} className="text-[11px] text-muted hover:underline">
                {t('home.next')}
              </Link>
            )}
          </div>
        </>
      )}
    </section>
  )
}
