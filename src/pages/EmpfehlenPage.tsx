import { useState } from 'react'
import { Copy, Gift, Share2 } from 'lucide-react'
import { Badge } from '../components/ui/Badge'
import { Button } from '../components/ui/Button'
import { useReferral } from '../hooks/useReferral'
import { REFERRAL_RULES_DE, shareUrl, simulateReferralSignup, spendFeaturedCredits } from '../lib/referral'
import { formatDateTime } from '../lib/utils'

export function EmpfehlenPage() {
  const { referral } = useReferral()
  const [copied, setCopied] = useState(false)
  const [flash, setFlash] = useState<string | null>(null)
  const url = shareUrl()

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1800)
    } catch {
      setFlash('Kopieren nicht möglich — Link manuell teilen.')
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-scroll-chrome">
      <header className="space-y-2">
        <p className="text-xs font-medium uppercase tracking-wider text-cyan">Netzwerk</p>
        <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
          <Gift size={22} className="text-cyan" /> Orbit empfehlen
        </h1>
        <p className="text-sm text-muted">
          Persönlicher Code, Share-Link, Credits für Featured-Listings — alles Demo, lokal auf
          diesem Gerät.
        </p>
      </header>

      <section className="relative overflow-hidden rounded-3xl border border-cyan/30 bg-gradient-to-br from-cyan/15 via-surface-2 to-black p-5">
        <p className="text-[11px] uppercase tracking-wider text-cyan">Dein Code</p>
        <div className="mt-1 font-mono text-3xl font-bold tracking-widest text-white">{referral.code}</div>
        <p className="mt-2 break-all text-xs text-neutral-300">{url}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button size="sm" onClick={() => void copy()}>
            <Copy size={14} /> {copied ? 'Kopiert' : 'Link kopieren'}
          </Button>
          {'share' in navigator && (
            <Button
              size="sm"
              variant="secondary"
              onClick={() =>
                void navigator.share?.({
                  title: 'Orbit',
                  text: 'Orbit — Matching statt Spam. Dein persönlicher Job-Orbit.',
                  url,
                })
              }
            >
              <Share2 size={14} /> Teilen
            </Button>
          )}
        </div>
      </section>

      <section className="card-elevated rounded-2xl border border-border p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wider text-muted">Featured-Credits (Demo)</p>
            <p className="text-3xl font-bold tabular-nums text-cyan">{referral.featuredCredits}</p>
          </div>
          <Button
            size="sm"
            variant="secondary"
            disabled={referral.featuredCredits < 25}
            onClick={() => {
              spendFeaturedCredits(25)
              setFlash('25 Credits für ein Featured-Listing eingelöst (nur Anzeige).')
            }}
          >
            25 für Featured einlösen
          </Button>
        </div>
        {referral.referredBy && (
          <p className="mt-3 text-xs text-neutral-300">
            Geworben über <span className="font-mono text-cyan">{referral.referredBy}</span>
          </p>
        )}
        {referral.capturedRef && !referral.referredBy && (
          <p className="mt-3 text-xs text-amber-200">
            Ref <span className="font-mono">{referral.capturedRef}</span> erkannt — gilt beim
            nächsten Signup / Demo-Login.
          </p>
        )}
      </section>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="secondary"
          onClick={() => {
            simulateReferralSignup()
            setFlash('Demo-Freund geworben — +25 Featured-Credits.')
          }}
        >
          Demo-Signup simulieren
        </Button>
      </div>
      {flash && (
        <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-3 py-2 text-xs text-cyan">{flash}</p>
      )}

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Aktivität</h2>
        {referral.signups.length === 0 ? (
          <p className="text-sm text-muted">Noch keine Demo-Signups über deinen Code.</p>
        ) : (
          <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface-2">
            {referral.signups.map((s, i) => (
              <li key={`${s.at}-${i}`} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-mono text-sm text-cyan">{s.ref}</span>
                <span className="text-[11px] text-muted">{formatDateTime(s.at)}</span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="space-y-2">
        <h2 className="text-lg font-semibold">Kurzregeln</h2>
        <ol className="list-decimal space-y-1.5 pl-5 text-sm text-neutral-300">
          {REFERRAL_RULES_DE.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ol>
        <Badge tone="amber">Kein echtes Geld · kein Auszahlungsanspruch</Badge>
      </section>
    </div>
  )
}
