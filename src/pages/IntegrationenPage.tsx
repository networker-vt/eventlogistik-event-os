import { useState } from 'react'
import { Cable, ExternalLink, Link2, Link2Off, Loader2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { Empty } from '../components/ui/Empty'
import { useIntegrations } from '../hooks/useIntegrations'
import {
  INTEGRATIONS,
  isConnected,
  mockConnect,
  mockDisconnect,
  syncLabel,
} from '../lib/integrations'

export function IntegrationenPage() {
  const { state } = useIntegrations()
  const [busy, setBusy] = useState<string | null>(null)

  const run = (id: string, next: boolean) => {
    setBusy(id)
    window.setTimeout(() => {
      if (next) mockConnect(id)
      else mockDisconnect(id)
      setBusy(null)
    }, 550)
  }

  const connectedCount = INTEGRATIONS.filter((i) => state.connected[i.id]).length

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-scroll-chrome">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">Netzwerk</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Cable size={22} className="text-cyan" /> Integrationen
        </h1>
        <p className="text-sm text-muted">
          ERP, Rental und Crew — Connect ist ein Stub (OAuth / API-Key). Keine echten Credentials,
          kein Live-Sync. {connectedCount} verbunden.
        </p>
      </header>

      <div className="grid gap-3">
        {INTEGRATIONS.map((item) => {
          const on = isConnected(item.id)
          const planned = item.availability === 'planned'
          const linkout = item.connect === 'linkout'
          return (
            <article
              key={item.id}
              className={`card-elevated rounded-2xl border p-4 ${on ? 'border-cyan/35' : 'border-border'}`}
            >
              <div className="flex flex-wrap items-start gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-base font-semibold">{item.name}</h2>
                    {on && <Badge tone="green">verbunden</Badge>}
                    {!on && !planned && !linkout && <Badge>nicht verbunden</Badge>}
                    {planned && <Badge tone="amber">geplant</Badge>}
                    {linkout && <Badge tone="teal">Link-out</Badge>}
                    <Badge tone="cyan">{item.connect}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-neutral-300">{item.blurb}</p>
                  <p className="mt-1 text-xs text-muted">{item.vendor} · {item.notes}</p>
                  <div className="mt-3 flex flex-wrap gap-1.5 text-xs">
                    <span className="chip">Projekte {syncLabel(item.sync.projects)}</span>
                    <span className="chip">Jobs {syncLabel(item.sync.jobs)}</span>
                    <span className="chip">Crew {syncLabel(item.sync.crew)}</span>
                  </div>
                </div>
                <div className="flex shrink-0 flex-col gap-2">
                  <a
                    href={item.docs}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-10 items-center justify-center gap-1 rounded-lg border border-border px-3 text-xs text-neutral-300 hover:border-cyan/40 hover:text-cyan"
                  >
                    Docs <ExternalLink size={12} />
                  </a>
                  {linkout ? (
                    <span className="text-center text-xs text-muted">Kein Connect</span>
                  ) : planned ? (
                    <Button size="sm" variant="ghost" disabled>
                      Bald
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant={on ? 'ghost' : 'secondary'}
                      disabled={busy === item.id}
                      onClick={() => run(item.id, !on)}
                    >
                      {busy === item.id ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : on ? (
                        <>
                          <Link2Off size={14} /> Trennen
                        </>
                      ) : (
                        <>
                          <Link2 size={14} /> Verbinden
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </div>
            </article>
          )
        })}
      </div>

      {INTEGRATIONS.length === 0 && (
        <Empty emoji="🔌" title="Keine Integrationen" hint="Katalog folgt." />
      )}
    </div>
  )
}
