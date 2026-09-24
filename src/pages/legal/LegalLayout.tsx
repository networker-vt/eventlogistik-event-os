import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { copyrightLine } from '../../lib/legal'

export function LegalLayout({ title, children }: { title: string; children: ReactNode }) {
  return (
    <article className="legal-prose mx-auto max-w-2xl space-y-4 pb-8 pb-scroll-chrome">
      <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
      <div className="space-y-4 text-sm leading-relaxed text-neutral-300 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-ink [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-5 [&_a]:text-cyan [&_code]:rounded [&_code]:bg-ink/10 [&_code]:px-1">
        {children}
      </div>
      <nav className="flex flex-wrap gap-3 border-t border-border pt-4 text-sm">
        <Link to="/impressum" className="text-cyan">
          Impressum
        </Link>
        <Link to="/privacy" className="text-cyan">
          Datenschutz / Privacy
        </Link>
        <Link to="/support" className="text-cyan">
          Support
        </Link>
        <Link to="/agb" className="text-cyan">
          AGB
        </Link>
        <Link to="/ranking" className="text-cyan">
          Ranking
        </Link>
        <Link to="/" className="text-muted">
          Zur App
        </Link>
      </nav>
      <p className="text-xs text-muted">{copyrightLine()}</p>
    </article>
  )
}
