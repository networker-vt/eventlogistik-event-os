import { useState } from 'react'
import { Lightbulb } from 'lucide-react'
import { IdeenInbox } from '../components/ideas/IdeenInbox'
import { Button } from '../components/ui/Button'
import { Input, Select, Textarea } from '../components/ui/Input'
import { useIdeas } from '../hooks/useIdeas'
import {
  IDEA_CATEGORY_LABEL,
  addIdea,
  listSafeTweaks,
  type IdeaCategory,
} from '../lib/ideas'

const CATS = Object.keys(IDEA_CATEGORY_LABEL) as IdeaCategory[]

export function IdeenPage() {
  const { ideas } = useIdeas()
  const [category, setCategory] = useState<IdeaCategory>('idee')
  const [text, setText] = useState('')
  const [email, setEmail] = useState('')
  const [flash, setFlash] = useState<string | null>(null)
  const tweaks = listSafeTweaks()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (text.trim().length < 8) {
      setFlash('Bitte etwas genauer beschreiben (mind. 8 Zeichen).')
      return
    }
    const item = addIdea({ category, text, email })
    void import('../lib/rewards').then((m) => m.grantIdeaReward()).catch(() => undefined)
    setText('')
    const extra = item.status === 'geplant' ? ` Als „geplant“ markiert: ${item.plannedReason}.` : ''
    const tweak =
      item.appliedTweaks.length > 0
        ? ' Ein sehr kleiner, sicherer UX-Tweak wurde angewendet (Kontrast).'
        : ' Analyse nur gespeichert — kein stilles Umbauen des Produkts.'
    setFlash(`Danke — in der Ideen-Box gelandet.${extra}${tweak}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-scroll-chrome">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">Feedback</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Lightbulb size={22} className="text-cyan" /> Ideen-Box
        </h1>
        <p className="text-sm text-muted">
          Idee, Bug, UX oder Feature — landet lokal auf diesem Gerät. Der Operator sieht die Inbox
          unter Mein Bereich. Keyword-Tags und Priorität werden automatisch gesetzt.
        </p>
      </header>

      <form
        onSubmit={submit}
        className="card-elevated space-y-3 rounded-2xl border border-cyan/25 p-5"
      >
        <Select
          label="Kategorie"
          value={category}
          onChange={(e) => setCategory(e.target.value as IdeaCategory)}
        >
          {CATS.map((c) => (
            <option key={c} value={c}>
              {IDEA_CATEGORY_LABEL[c]}
            </option>
          ))}
        </Select>
        <Textarea
          label="Dein Hinweis"
          required
          minLength={8}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Was fehlt, was hakt, was wäre stark?"
        />
        <Input
          label="E-Mail (optional, für Rückfragen)"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@example.invalid"
        />
        <Button type="submit" className="w-full">
          In die Ideen-Box
        </Button>
        {flash && (
          <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan">{flash}</p>
        )}
      </form>

      {tweaks.length > 0 && (
        <p className="text-xs text-muted">
          Angewendete sichere Tweaks: {tweaks.map((t) => t.label).join(' · ')}
        </p>
      )}

      <IdeenInbox
        ideas={ideas}
        title="Deine Einträge"
        hint="Alles bleibt in localStorage — kein Server, kein Ticket-System."
      />
    </div>
  )
}
