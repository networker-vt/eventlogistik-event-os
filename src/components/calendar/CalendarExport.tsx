import { CalendarPlus } from 'lucide-react'
import {
  addLocalCalendarItem,
  downloadIcs,
  googleCalendarUrl,
  webcalHint,
  type CalEventInput,
} from '../../lib/calendar'
import { Button } from '../ui/Button'

export function CalendarExport({
  event,
  kind = 'interview',
  compact,
}: {
  event: CalEventInput
  kind?: 'interview' | 'start' | 'application' | 'other' | 'reminder' | 'plan'
  compact?: boolean
}) {
  const addLocal = () => {
    addLocalCalendarItem({
      title: event.title,
      startIso: event.startIso,
      endIso: event.endIso,
      location: event.location,
      kind,
    })
  }

  if (compact) {
    return (
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          type="button"
          onClick={() => downloadIcs(event, 'orbit.ics')}
        >
          <CalendarPlus size={14} /> ICS
        </Button>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-xl border border-border bg-surface-2 px-3 text-xs text-neutral-200 hover:border-cyan/40"
        >
          Google
        </a>
      </div>
    )
  }

  return (
    <div className="space-y-2 rounded-2xl border border-border bg-surface-2 p-4">
      <h3 className="flex items-center gap-2 text-sm font-semibold">
        <CalendarPlus size={16} className="text-cyan" /> Kalender
      </h3>
      <p className="text-xs text-muted">{webcalHint()}</p>
      <div className="flex flex-wrap gap-2">
        <Button size="sm" type="button" onClick={() => downloadIcs(event, 'orbit.ics')}>
          ICS Download
        </Button>
        <a
          href={googleCalendarUrl(event)}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-9 items-center rounded-xl border border-cyan/30 bg-cyan/10 px-3 text-xs font-medium text-cyan"
        >
          Google Calendar
        </a>
        <Button size="sm" variant="ghost" type="button" onClick={addLocal}>
          + Mein Bereich
        </Button>
      </div>
    </div>
  )
}
