import { useEffect, useMemo, useState } from 'react'
import { Badge } from '../ui/Badge'
import { Button } from '../ui/Button'
import {
  CHANNEL_DEFS,
  connectChannel,
  disconnectChannel,
  getChannels,
  subscribeChannels,
  visibleChannelDefs,
  type ChannelId,
  type ChannelKind,
} from '../../lib/channels'
import { isKidsMode, subscribeKids } from '../../lib/kids'
import { useI18n } from '../../lib/i18n'
import { cn } from '../../lib/utils'

const KIND_ORDER: ChannelKind[] = ['commerce', 'entertainment', 'social', 'gaming']

export function ChannelLinks() {
  const { t } = useI18n()
  const [state, setState] = useState(getChannels)
  const [kids, setKids] = useState(isKidsMode)
  const [pending, setPending] = useState<ChannelId | null>(null)

  useEffect(() => {
    const u1 = subscribeChannels(() => setState(getChannels()))
    const u2 = subscribeKids(() => setKids(isKidsMode()))
    return () => {
      u1()
      u2()
    }
  }, [])

  const defs = useMemo(() => visibleChannelDefs(kids), [kids])
  const pendingDef = pending ? CHANNEL_DEFS.find((c) => c.id === pending) : null
  const groups = KIND_ORDER.map((kind) => ({
    kind,
    items: defs.filter((c) => c.kind === kind),
  })).filter((g) => g.items.length > 0)

  const onConnect = (id: ChannelId) => {
    connectChannel(id, true)
    setPending(null)
  }

  return (
    <section className="scroll-mt-24 space-y-3 rounded-2xl border border-border bg-surface-2 p-4" id="kanaele">
      <div>
        <h2 className="text-lg font-semibold">{t('channels.linkTitle')}</h2>
        <p className="mt-1 text-sm text-muted">{t('channels.linkLead')}</p>
      </div>
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 px-3 py-2 text-xs text-amber-100">
        {t('channels.flagOnly')}
      </p>
      {kids && (
        <p className="rounded-xl border border-border/80 bg-black/20 px-3 py-2 text-xs text-muted" data-kids-social="hidden">
          {t('channels.kidsSocial')}
        </p>
      )}

      {pendingDef && (
        <div
          className="space-y-3 rounded-xl border border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10 px-3 py-3"
          role="dialog"
          aria-labelledby="channel-consent-title"
          data-channel-consent={pendingDef.id}
        >
          <p id="channel-consent-title" className="text-sm font-semibold text-ink">
            {t('channels.consentTitle')} · {pendingDef.label}
          </p>
          <p className="text-xs text-muted">{t('channels.consentBody')}</p>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" onClick={() => onConnect(pendingDef.id)}>
              {t('channels.consentCta')}
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setPending(null)}>
              {t('channels.consentCancel')}
            </Button>
          </div>
        </div>
      )}

      {groups.map((group) => (
        <div key={group.kind} className="space-y-2">
          <h3 className="text-xs font-medium uppercase tracking-wider text-muted">
            {t(`channels.kind.${group.kind}`)}
          </h3>
          <ul className="space-y-2">
            {group.items.map((ch) => {
              const on = state[ch.id]
              return (
                <li
                  key={ch.id}
                  data-channel-id={ch.id}
                  data-channel-kind={ch.kind}
                  className={cn(
                    'flex items-center gap-3 rounded-xl border px-3 py-2',
                    on ? 'border-[var(--theme-accent)]/40 bg-[var(--theme-accent)]/10' : 'border-border/80',
                  )}
                >
                  <span className="text-lg" aria-hidden>
                    {ch.emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium text-ink">
                      {ch.label}
                      <Badge tone="amber">{t('channels.demo')}</Badge>
                    </p>
                    <p className="text-[11px] text-muted">{t(`channels.benefit.${ch.id}`)}</p>
                  </div>
                  {on ? <Badge tone="green">{t('channels.connected')}</Badge> : <Badge>{t('channels.off')}</Badge>}
                  {on ? (
                    <Button
                      size="sm"
                      variant="ghost"
                      data-channel-action="disconnect"
                      onClick={() => disconnectChannel(ch.id)}
                    >
                      {t('channels.disconnect')}
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="secondary"
                      data-channel-action="connect"
                      onClick={() => setPending(ch.id)}
                    >
                      {t('channels.connect')}
                    </Button>
                  )}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </section>
  )
}
