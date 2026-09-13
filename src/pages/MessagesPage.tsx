import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
import { Empty } from '../components/ui/Empty'
import { useStoreVersion } from '../hooks/useStore'
import { useAuth } from '../lib/auth'
import { store } from '../lib/store'
import { formatDateTime } from '../lib/utils'

export function MessagesPage() {
  const { threadId } = useParams()
  const { user, loginDemo } = useAuth()
  useStoreVersion()
  const navigate = useNavigate()
  const [body, setBody] = useState('')

  const threads = user ? store.listThreads(user.id) : []
  const active = threadId ? store.getThread(threadId) : undefined
  const messages = active ? store.listMessages(active.id) : []
  const showList = !threadId
  const showThread = Boolean(threadId)

  useEffect(() => {
    if (!user) return
    // Desktop: auto-open first thread when landing on /messages
    if (!threadId && threads[0] && window.matchMedia('(min-width: 768px)').matches) {
      navigate(`/messages/${threads[0].id}`, { replace: true })
    }
  }, [user, threadId, threads, navigate])

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
        <p className="mb-4">Chat benötigt Login.</p>
        <Button onClick={() => loginDemo()}>Demo starten</Button>
      </div>
    )
  }

  const send = (e: React.FormEvent) => {
    e.preventDefault()
    if (!active || !body.trim()) return
    store.sendMessage({
      threadId: active.id,
      senderId: user.id,
      senderName: user.name,
      body: body.trim(),
    })
    setBody('')
  }

  return (
    <div className="grid gap-4 md:grid-cols-[280px_1fr]">
      <aside
        className={`rounded-2xl border border-border bg-surface-2 ${showThread ? 'hidden md:block' : 'block'}`}
      >
        <div className="border-b border-border px-4 py-3 font-semibold">Nachrichten</div>
        <div className="max-h-[70vh] overflow-y-auto">
          {threads.map((t) => (
            <Link
              key={t.id}
              to={`/messages/${t.id}`}
              className={`block min-h-14 border-b border-border/60 px-4 py-3 hover:bg-white/5 ${active?.id === t.id ? 'bg-cyan/10' : ''}`}
            >
              <div className="truncate text-sm font-medium">
                {t.participantNames.filter((n) => n !== user.name).join(', ') || 'Chat'}
              </div>
              <div className="truncate text-xs text-muted">{t.listingTitle}</div>
              <div className="truncate text-xs text-neutral-500">{t.lastMessage}</div>
            </Link>
          ))}
          {threads.length === 0 && (
            <Empty
              title="Noch keine Chats"
              hint="Stelle eine Anfrage oder bewirb dich auf einen Job."
              actionLabel="Jobs öffnen"
              onAction={() => navigate('/jobs')}
            />
          )}
        </div>
      </aside>

      <section
        className={`flex min-h-[60vh] flex-col rounded-2xl border border-border bg-surface-2 md:min-h-[420px] ${showList && !showThread ? 'hidden md:flex' : 'flex'}`}
      >
        {active ? (
          <>
            <div className="flex items-center gap-2 border-b border-border px-3 py-3">
              <button
                type="button"
                className="tap-target flex items-center justify-center rounded-lg text-muted md:hidden"
                onClick={() => navigate('/messages')}
                aria-label="Zurück"
              >
                <ArrowLeft size={20} />
              </button>
              <div className="min-w-0">
                <div className="truncate font-medium">{active.listingTitle ?? 'Konversation'}</div>
                <div className="truncate text-xs text-muted">{active.participantNames.join(' · ')}</div>
              </div>
            </div>
            <div className="flex-1 space-y-3 overflow-y-auto p-4">
              {messages.map((m) => {
                const mine = m.senderId === user.id
                return (
                  <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${mine ? 'bg-cyan text-black' : 'bg-surface-3 text-neutral-200'}`}
                    >
                      {!mine && <div className="mb-0.5 text-[11px] opacity-70">{m.senderName}</div>}
                      <div>{m.body}</div>
                      <div className={`mt-1 text-[10px] ${mine ? 'text-black/60' : 'text-muted'}`}>
                        {formatDateTime(m.createdAt)}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
            <form onSubmit={send} className="border-t border-border p-3 safe-pb">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nachricht schreiben…"
                className="min-h-16"
              />
              <Button type="submit" className="mt-2 w-full sm:w-auto" disabled={!body.trim()}>
                Senden
              </Button>
            </form>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center p-6 text-sm text-muted">
            Wähle einen Chat oder starte eine Anfrage.
          </div>
        )}
      </section>
    </div>
  )
}
