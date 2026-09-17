import { useState } from 'react'
import { Star } from 'lucide-react'
import { Button } from '../ui/Button'
import { store } from '../../lib/store'
import type { Booking } from '../../types'
import { cn } from '../../lib/utils'

export function RatingPrompt({
  booking,
  userId,
  userName,
}: {
  booking: Booking
  userId: string
  userName: string
}) {
  const existing = store.getReviewForBooking(booking.id, userId)
  const [stars, setStars] = useState(existing?.rating ?? 5)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState(existing?.comment ?? '')
  const [done, setDone] = useState(Boolean(existing))

  if (booking.status !== 'completed') return null

  const isRequester = userId === booking.requesterId
  const isProvider = userId === booking.providerId
  if (!isRequester && !isProvider) return null

  const toUserId = isRequester ? booking.providerId : booking.requesterId
  const toUserName = isRequester ? booking.providerName : booking.requesterName

  const submit = () => {
    store.submitReview({
      bookingId: booking.id,
      listingId: booking.listingId,
      fromUserId: userId,
      fromUserName: userName,
      toUserId,
      toUserName,
      rating: stars,
      comment: comment.trim(),
    })
    void import('../../lib/rewards').then((m) => m.grantReviewReward()).catch(() => undefined)
    setDone(true)
  }

  return (
    <div className="rounded-2xl border border-cyan/30 bg-cyan/5 p-5">
      <h2 className="font-semibold text-cyan">
        {done ? 'Danke für deine Bewertung' : 'Job abgeschlossen — bitte bewerten'}
      </h2>
      <p className="mt-1 text-sm text-muted">
        Wie war die Zusammenarbeit mit <span className="text-ink">{toUserName}</span>?
        Ratings stärken Trust auf der Plattform.
      </p>

      <div className="mt-4 flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={done}
            aria-label={`${n} Sterne`}
            className="tap-target p-1"
            onMouseEnter={() => setHover(n)}
            onMouseLeave={() => setHover(0)}
            onClick={() => setStars(n)}
          >
            <Star
              size={28}
              className={cn(
                (hover || stars) >= n ? 'text-amber-400' : 'text-neutral-600',
              )}
              fill={(hover || stars) >= n ? 'currentColor' : 'none'}
            />
          </button>
        ))}
      </div>

      {!done && (
        <>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Kurzfeedback (optional) — Pünktlichkeit, Kommunikation, Qualität…"
            rows={3}
            className="mt-3 w-full rounded-xl border border-border bg-surface px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-cyan/50 focus:outline-none"
          />
          <Button className="mt-3" onClick={submit}>
            Bewertung absenden
          </Button>
        </>
      )}

      {done && existing && (
        <p className="mt-2 text-sm text-neutral-300">
          ⭐ {existing.rating}/5
          {existing.comment ? ` — „${existing.comment}“` : ''}
        </p>
      )}
      {done && !existing && (
        <p className="mt-2 text-sm text-neutral-300">⭐ {stars}/5 gespeichert</p>
      )}
    </div>
  )
}
