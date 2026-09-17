import { StarRating } from '../ui/StarRating'
import { avgRating, type ExperienceReview } from '../../lib/experience'
import { formatDate } from '../../lib/utils'

export function ExperienceList({
  reviews,
  empty = 'Noch keine Erfahrungen.',
}: {
  reviews: ExperienceReview[]
  empty?: string
}) {
  const avg = avgRating(reviews)
  if (!reviews.length) {
    return <p className="text-sm text-muted">{empty}</p>
  }
  return (
    <div className="space-y-3">
      {avg != null && (
        <p className="text-sm text-neutral-300">
          Ø {avg.toFixed(1)} · {reviews.length} Review{reviews.length === 1 ? '' : 's'}
        </p>
      )}
      <ul className="space-y-2">
        {reviews.slice(0, 6).map((r) => (
          <li key={r.id} className="rounded-xl border border-border/70 bg-black/20 px-3 py-2">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-medium text-ink">{r.fromName}</span>
              <StarRating value={r.rating} readOnly size={14} />
            </div>
            {r.comment && <p className="mt-1 text-sm text-neutral-300">{r.comment}</p>}
            <p className="mt-1 text-[11px] text-muted">
              {r.targetLabel} · {formatDate(r.createdAt.slice(0, 10))}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
