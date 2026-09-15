import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { CalendarClock, MessageSquare, Video } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { SpeakButton } from '../components/a11y/SpeakButton'
import { useI18n } from '../lib/i18n'
import {
  confirmInterviewSlot,
  getInterviewRoom,
  listInterviewRooms,
  sendInterviewMessage,
  subscribeInterviews,
  type InterviewRoom,
} from '../lib/interviews'
import { formatDateTime } from '../lib/utils'

export function InterviewPage() {
  const { t } = useI18n()
  const { roomId } = useParams()
  const navigate = useNavigate()
  const [, setTick] = useState(0)
  useEffect(() => subscribeInterviews(() => setTick((n) => n + 1)), [])

  const rooms = listInterviewRooms()
  const active = roomId ? getInterviewRoom(roomId) : rooms[0]

  if (!roomId && rooms[0]) {
    return (
      <div className="space-y-4 pb-scroll-chrome">
        <header className="space-y-2">
          <h1 className="text-2xl font-bold">{t('interview.title')}</h1>
          <p className="text-sm text-muted">{t('interview.lead')}</p>
          <SpeakButton text={`${t('interview.title')}. ${t('interview.lead')}`} />
        </header>
        <ul className="space-y-2">
          {rooms.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => navigate(`/interview/${r.id}`)}
                className="flex min-h-14 w-full items-center justify-between rounded-2xl border border-border bg-surface-2 px-4 py-3 text-left"
              >
                <span>
                  <span className="block font-medium">{r.title}</span>
                  <span className="text-xs text-muted">{r.peerName}</span>
                </span>
                <MessageSquare size={16} className="text-[var(--theme-accent)]" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    )
  }

  if (!active) {
    return (
      <div className="rounded-2xl border border-border p-8 text-center">
        <p>Kein Interview-Raum.</p>
        <Button className="mt-3" onClick={() => navigate('/match')}>
          Match
        </Button>
      </div>
    )
  }

  return <InterviewRoomView room={active} />
}

function InterviewRoomView({ room }: { room: InterviewRoom }) {
  const { t } = useI18n()
  const [body, setBody] = useState('')
  const [tab, setTab] = useState<'chat' | 'schedule' | 'video'>('chat')
  const [stream, setStream] = useState<MediaStream | null>(null)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    return () => {
      stream?.getTracks().forEach((tr) => tr.stop())
    }
  }, [stream])

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream
  }, [stream])

  const startPreview = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: false })
      setStream(s)
      if (videoRef.current) videoRef.current.srcObject = s
    } catch {
      setStream(null)
    }
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    sendInterviewMessage(room.id, body)
    setBody('')
  }

  return (
    <div className="mx-auto max-w-lg space-y-4 pb-scroll-chrome">
      <header>
        <p className="text-xs uppercase tracking-wider text-[var(--theme-accent)]">{t('interview.title')}</p>
        <h1 className="text-xl font-bold">{room.title}</h1>
        <p className="text-sm text-muted">{room.peerName}</p>
      </header>

      <div className="grid grid-cols-3 gap-1 rounded-xl border border-border bg-surface-2 p-1">
        {(
          [
            ['chat', t('interview.chat'), MessageSquare],
            ['schedule', t('interview.schedule'), CalendarClock],
            ['video', t('interview.video'), Video],
          ] as const
        ).map(([id, label, Icon]) => (
          <button
            key={id}
            type="button"
            onClick={() => setTab(id)}
            className={`flex min-h-11 items-center justify-center gap-1 rounded-lg text-xs font-medium ${
              tab === id ? 'bg-[var(--theme-accent)] text-black' : 'text-neutral-300'
            }`}
          >
            <Icon size={14} /> {label}
          </button>
        ))}
      </div>

      {tab === 'chat' && (
        <section className="flex min-h-[50vh] flex-col rounded-2xl border border-border bg-surface-2">
          <div className="flex-1 space-y-2 overflow-y-auto p-4">
            {room.messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                    m.role === 'user' ? 'bg-[var(--theme-accent)] text-black' : 'bg-surface-3'
                  }`}
                >
                  <div>{m.body}</div>
                  <div className="mt-1 text-[10px] opacity-70">{formatDateTime(m.at)}</div>
                </div>
              </div>
            ))}
          </div>
          <form onSubmit={send} className="border-t border-border p-3">
            <Textarea
              label="Antwort"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={2}
            />
            <Button className="mt-2 w-full" type="submit">
              Senden
            </Button>
          </form>
        </section>
      )}

      {tab === 'schedule' && (
        <section className="space-y-2 rounded-2xl border border-border bg-surface-2 p-4">
          <h2 className="font-semibold">{t('interview.schedule')}</h2>
          {room.slots.map((s) => (
            <button
              key={s.id}
              type="button"
              onClick={() => confirmInterviewSlot(room.id, s.id)}
              className={`flex min-h-12 w-full items-center justify-between rounded-xl border px-3 py-2 text-left text-sm ${
                s.confirmed
                  ? 'border-[var(--theme-accent)] bg-[var(--theme-accent)]/15'
                  : 'border-border bg-black/20'
              }`}
            >
              <span>{s.label}</span>
              <span className="text-xs text-muted">{s.confirmed ? '✓' : t('interview.confirm')}</span>
            </button>
          ))}
        </section>
      )}

      {tab === 'video' && (
        <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4">
          <h2 className="font-semibold">{t('interview.video')}</h2>
          <p className="text-sm text-muted">{t('interview.videoHint')}</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="overflow-hidden rounded-xl border border-border bg-black">
              <video ref={videoRef} autoPlay playsInline muted className="aspect-video w-full object-cover" />
              <p className="px-2 py-1 text-[10px] text-muted">Du (lokal)</p>
            </div>
            <div className="flex aspect-video flex-col items-center justify-center rounded-xl border border-dashed border-border bg-black/40 text-center text-xs text-muted">
              <Video size={28} className="mb-2 opacity-50" />
              {room.peerName}
              <span className="mt-1">Kein Remote-Stream</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => void startPreview()}>
            Kamera-Vorschau starten
          </Button>
          <p className="text-xs text-muted">
            Deep-link später z. B. <code>https://orbit.jobs/call/{room.id}</code> — Provider anbinden.
          </p>
          {room.listingId && (
            <Link to={`/listings/${room.listingId}`} className="text-sm text-[var(--theme-accent)] hover:underline">
              Zum Job →
            </Link>
          )}
        </section>
      )}
    </div>
  )
}
