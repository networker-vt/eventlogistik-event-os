import { Badge } from '../ui/Badge'
import { Empty } from '../ui/Empty'
import { IDEA_CATEGORY_LABEL, type IdeaItem } from '../../lib/ideas'
import { formatDateTime } from '../../lib/utils'

const PRIORITY_TONE = {
  high: 'rose',
  medium: 'amber',
  low: 'default',
} as const

export function IdeenInbox({
  ideas,
  title = 'Ideen-Inbox',
  hint,
}: {
  ideas: IdeaItem[]
  title?: string
  hint?: string
}) {
  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        {hint && <p className="text-xs text-muted">{hint}</p>}
      </div>
      {ideas.length === 0 ? (
        <Empty
          emoji="💡"
          title="Noch keine Einträge"
          hint="Die Ideen-Box speichert Feedback lokal auf diesem Gerät."
        />
      ) : (
        <ul className="space-y-2">
          {ideas.map((idea) => (
            <li
              key={idea.id}
              className="card-elevated rounded-2xl border border-border px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-1.5">
                <Badge tone="cyan">{IDEA_CATEGORY_LABEL[idea.category]}</Badge>
                <Badge tone={PRIORITY_TONE[idea.priority]}>{idea.priority}</Badge>
                {idea.status === 'geplant' && (
                  <Badge tone="teal">geplant{idea.plannedReason ? ` · ${idea.plannedReason}` : ''}</Badge>
                )}
                {idea.appliedTweaks.length > 0 && <Badge tone="green">sicherer Tweak</Badge>}
              </div>
              <p className="mt-2 text-sm text-neutral-200">{idea.text}</p>
              {idea.tags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {idea.tags.map((t) => (
                    <span key={t} className="chip chip-cyan">
                      {t}
                    </span>
                  ))}
                </div>
              )}
              <p className="mt-2 text-[11px] text-muted">
                {formatDateTime(idea.createdAt)}
                {idea.email ? ` · ${idea.email}` : ' · anonym'}
              </p>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
