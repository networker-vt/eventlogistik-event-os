import { useEffect, useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
  CHANNEL_DEFS,
  CHANNELS_DISCLAIMER_DE,
  getChannels,
  subscribeChannels,
  toggleChannel,
} from '../../lib/channels'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

export function ChannelLinks() {
  const { t } = useI18n()
  const [state, setState] = useState(getChannels)

  useEffect(() => subscribeChannels(() => setState(getChannels())), [])

  return (
    <section className="space-y-3 rounded-2xl border border-border bg-surface-2 p-4" id="kanäle">
      <div>
        <h2 className="text-lg font-semibold">{t('channels.linkTitle')}</h2>
        <p className="mt-1 text-sm text-muted">{t('channels.linkLead')}</p>
      </div>
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        {CHANNELS_DISCLAIMER_DE}
      </p>
      <ul className="space-y-2">
        {CHANNEL_DEFS.map((ch) => {
          const on = state[ch.id]
          return (
            <li
              key={ch.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border px-3 py-2',
                on ? 'border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10' : 'border-border/80',
              )}
            >
              <span className="text-lg" aria-hidden>
                {ch.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-white">{ch.label}</p>
                <p className="text-[11px] text-muted">{ch.benefitDe}</p>
              </div>
              {on ? <Badge tone="green">{t('channels.connected')}</Badge> : <Badge>{t('channels.off')}</Badge>}
              <Button size="sm" variant={on ? 'ghost' : 'secondary'} onClick={() => toggleChannel(ch.id)}>
                {on ? t('channels.disconnect') : t('channels.connect')}
              </Button>
            </li>
          )
        })}
      </ul>
    </section>
  )
}
