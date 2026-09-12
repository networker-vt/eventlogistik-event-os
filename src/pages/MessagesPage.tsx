import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Textarea } from '../components/ui/Input'
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
  const active = threadId ? store.getThread(threadId) : threads[0]
  const messages = active ? store.listMessages(active.id) : []

  useEffect(() => {
    if (!user) return
    if (!threadId && threads[0]) {
      navigate(`/messages/${threads[0].id}`, { replace: true })
    }
  }, [user, threadId, threads, navigate])

  if (!user) {
    return (
      <div className="rounded-2xl border border-border bg-surface-2 p-8 text-center">
        <p className="mb-4">Chat benötigt Login.</p>
        <Button onClick={loginDemo}>Demo starten</Button>
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
      <aside className="rounded-2xl border border-border bg-surface-2">
        <div className="border-b border-border px-4 py-3 font-semibold">Nachrichten</div>
        <div className="max-h-[60vh] overflow-y-auto">
          {threads.map((t) => (
            <Link
              key={t.id}
              to={`/messages/${t.id}`}
              className={`block border-b border-border/60 px-4 py-3 hover:bg-white/5 ${active?.id === t.id ? 'bg-cyan/10' : ''}`}
            >
              <div className="truncate text-sm font-medium">
                {t.participantNames.filter((n) => n !== user.name).join(', ') || 'Chat'}
              </div>
              <div className="truncate text-xs text-muted">{t.lastMessage}</div>
            </Link>
          ))}
          {threads.length === 0 && (
            <p className="p-4 text-sm text-muted">
              Noch keine Threads. Stelle eine Anfrage auf einem Inserat.
            </p>
          )}
        </div>
      </aside>

      <section className="flex min-h-[420px] flex-col rounded-2xl border border-border bg-surface-2">
        {active ? (
          <>
            <div className="border-b border-border px-4 py-3">
              <div className="font-medium">{active.listingTitle ?? 'Konversation'}</div>
              <div className="text-xs text-muted">{active.participantNames.join(' · ')}</div>
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
            <form onSubmit={send} className="border-t border-border p-3">
              <Textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Nachricht schreiben…"
                className="min-h-16"
              />
              <Button type="submit" className="mt-2" disabled={!body.trim()}>
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
