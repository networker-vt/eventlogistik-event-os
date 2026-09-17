import { useEffect, useMemo, useState } from 'react'
import { Gift } from 'lucide-react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { Input, Textarea } from '../ui/Input'
import { getCredits, subscribeCredits } from '../../lib/credits'
import {
  findGiftTarget,
  listGiftRecipients,
  listGifts,
  sendGift,
  subscribeGifts,
  type GiftKind,
  type GiftTarget,
} from '../../lib/gift'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

const KINDS: { id: GiftKind | 'all'; key: string }[] = [
  { id: 'all', key: 'gift.filterAll' },
  { id: 'listing', key: 'gift.filterListing' },
  { id: 'company', key: 'gift.filterCompany' },
  { id: 'profile', key: 'gift.filterProfile' },
]

export function GiftSheet({
  presetKind,
  presetId,
  presetLabel,
}: {
  presetKind?: string | null
  presetId?: string | null
  presetLabel?: string | null
}) {
  const { t } = useI18n()
  const [credits, setCredits] = useState(getCredits)
  const [gifts, setGifts] = useState(listGifts)
  const [q, setQ] = useState('')
  const [filter, setFilter] = useState<GiftKind | 'all'>('all')
  const [picked, setPicked] = useState<GiftTarget | null>(null)
  const [amount, setAmount] = useState('25')
  const [message, setMessage] = useState('')
  const [flash, setFlash] = useState<string | null>(null)

  useEffect(() => subscribeCredits(() => setCredits(getCredits())), [])
  useEffect(() => subscribeGifts(() => setGifts(listGifts())), [])

  useEffect(() => {
    if (!presetKind || !presetId) return
    const hit = findGiftTarget(presetKind, presetId, presetLabel || undefined)
    if (hit) setPicked(hit)
  }, [presetKind, presetId, presetLabel])

  const recipients = useMemo(() => {
    const all = listGiftRecipients()
    const needle = q.trim().toLowerCase()
    return all.filter((r) => {
      if (filter !== 'all' && r.kind !== filter) return false
      if (!needle) return true
      return `${r.label} ${r.hint || ''}`.toLowerCase().includes(needle)
    })
  }, [q, filter, gifts.length])

  const confirm = () => {
    if (!picked) {
      setFlash(t('gift.needTarget'))
      return
    }
    const n = Number(amount) || 0
    void sendGift({ target: picked, amount: n, message }).then((rec) => {
      if (!rec) {
        setFlash(t('credits.notEnough'))
        return
      }
      setFlash(t('gift.ok'))
      setMessage('')
    })
  }

  return (
    <section id="gift" className="scroll-mt-24 space-y-3 rounded-2xl border border-violet-400/30 bg-violet-500/10 p-5">
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-violet-100">
          <Gift size={18} /> {t('gift.title')}
        </h2>
        <Badge tone="amber">Demo</Badge>
      </div>
      <p className="text-xs text-violet-100/85">{t('gift.lead')}</p>
      <p className="text-[11px] text-muted">{t('gift.stub')}</p>

      {flash && (
        <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan">{flash}</p>
      )}

      {picked && (
        <p className="text-sm text-ink">
          {t('gift.to')}: <span className="font-semibold">{picked.label}</span>
          {picked.hint && <span className="text-muted"> · {picked.hint}</span>}
        </p>
      )}

      <div className="flex flex-wrap gap-1.5">
        {KINDS.map((k) => (
          <button
            key={k.id}
            type="button"
            onClick={() => setFilter(k.id)}
            className={cn(
              'rounded-full border px-3 py-1 text-xs',
              filter === k.id
                ? 'border-violet-300 bg-violet-500/20 text-ink'
                : 'border-border text-muted',
            )}
          >
            {t(k.key)}
          </button>
        ))}
      </div>
      <Input
        label={t('gift.search')}
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder={t('gift.searchPh')}
      />
      <ul className="max-h-40 space-y-1 overflow-y-auto">
        {recipients.slice(0, 12).map((r) => (
          <li key={`${r.kind}-${r.id}`}>
            <button
              type="button"
              onClick={() => setPicked(r)}
              className={cn(
                'w-full rounded-xl border px-3 py-2 text-left text-sm',
                picked?.id === r.id && picked.kind === r.kind
                  ? 'border-violet-300 bg-violet-500/20'
                  : 'border-border/70 bg-black/20 hover:border-violet-300/50',
              )}
            >
              <span className="font-medium text-ink">{r.label}</span>
              <span className="mt-0.5 block text-[11px] text-muted">
                {t(`gift.kind.${r.kind}`)}
                {r.hint ? ` · ${r.hint}` : ''}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="grid gap-2 sm:grid-cols-2">
        <Input
          label={t('gift.amount')}
          type="number"
          min={1}
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
        />
        <div className="flex items-end">
          <p className="text-[11px] text-muted">
            {t('gift.balance')}: {credits.balance}
          </p>
        </div>
      </div>
      <Textarea
        label={t('gift.message')}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder={t('gift.messagePh')}
      />
      <Button onClick={confirm} disabled={!picked}>
        {t('gift.confirm')}
      </Button>

      {gifts.length > 0 && (
        <ul className="space-y-1 border-t border-violet-500/20 pt-3 text-[11px] text-neutral-300">
          {gifts.slice(0, 4).map((g) => (
            <li key={g.id} className="flex justify-between gap-2">
              <span className="truncate">
                → {g.target.label}
                {g.message ? ` · ${g.message}` : ''}
              </span>
              <span className="tabular-nums shrink-0">−{g.amount}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
