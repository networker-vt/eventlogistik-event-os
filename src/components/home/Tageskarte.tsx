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
import { Button, ButtonLink } from '../ui/Button'

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
  const rawAction = plan ? primaryAssistAction(plan) : null
  const action =
    rawAction?.actionTo === '/wallet' || rawAction?.actionTo?.startsWith('/wallet')
      ? { ...rawAction, actionTo: undefined, actionLabel: undefined }
      : rawAction

  const tripResult = Boolean(plan?.tripOptions?.length)

  return (
    <section
      className={
        plan
          ? 'rounded-[1.25rem] border border-border/70 bg-surface px-5 py-6'
          : 'rounded-2xl border border-border/80 bg-surface-2/40 p-4'
      }
      aria-label={plan ? t('assist.planKicker') : t('home.tageskarte')}
      data-tageskarte="1"
      data-assist-plan={plan ? '1' : undefined}
    >
      <div className="flex items-start justify-between gap-2">
        <p className="text-[13px] font-medium uppercase tracking-[0.14em] text-muted">
          {plan ? t('assist.planKicker') : t('home.tageskarte')}
          {!plan && <span className="text-neutral-600"> · {t(`home.slot.${slot}`)}</span>}
        </p>
        {plan && (
          <Button type="button" size="sm" variant="ghost" onClick={() => clearPlan()}>
            {t('assist.clear')}
          </Button>
        )}
      </div>

      {plan ? (
        <>
          <h2 className="mt-3 text-[1.65rem] font-semibold leading-tight tracking-tight text-ink">{plan.summary}</h2>
          {action && !tripResult && <p className="mt-2 text-[15px] text-ink-soft">{action.title}</p>}
          {!tripResult && (
            <div className="mt-5 flex flex-wrap items-center gap-2">
              {action?.actionTo && (
                <ButtonLink to={action.actionTo} size="sm" variant="secondary">
                  {action.actionLabel || t('home.next')}
                </ButtonLink>
              )}
              {action?.actionTo && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    enqueueReminder({
                      title: plan.summary,
                      actionTo: action.actionTo!,
                      actionLabel: action.actionLabel || t('home.next'),
                    })
                  }}
                >
                  {t('assist.remind')}
                </Button>
              )}
            </div>
          )}
          <p className="mt-5 border-t border-border/50 pt-3 text-[13px] text-muted">
            {t('home.tageskarteAlso')}: {daily.title}
          </p>
        </>
      ) : (
        <>
          <h2 className="mt-1 text-base font-semibold text-ink">{daily.title}</h2>
          <p className="mt-1 text-sm text-neutral-300">{daily.body}</p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => onUsePrompt(daily.prompt)}>
              {t('home.tageskarteDo')}
            </Button>
            {item.to && (
              <ButtonLink to={item.to} size="sm" variant="ghost">
                {t('home.next')}
              </ButtonLink>
            )}
          </div>
        </>
      )}
    </section>
  )
}
