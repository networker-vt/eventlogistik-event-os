import { Link } from 'react-router-dom'
import { LEGAL, LEGAL_ADDRESS_LINE } from '../../lib/legal'
import { LegalLayout } from './LegalLayout'

/** Store support URL. Both languages on one page so the link does not depend on locale. */
export function SupportPage() {
  return (
    <LegalLayout title="Support">
      <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
        {LEGAL.operatorName} betreibt Orbit als <strong>natürliche Person</strong>. Es gibt keine Firma,
        kein Support-Team und keine zugesagte Antwortzeit.
      </p>

      <h2>Kontakt</h2>
      <p>
        {LEGAL.operatorName}
        <br />
        {LEGAL_ADDRESS_LINE}, {LEGAL.country}
        <br />
        E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>

      <h2>Wobei diese Adresse hilft</h2>
      <ul>
        <li>Fragen zur Demo-App Orbit (PWA).</li>
        <li>Fehlermeldungen: was du getippt hast, welche Seite, was stattdessen passiert ist.</li>
        <li>
          Datenschutz: Auskunft oder Löschung. Lokale Demo-Daten liegen im Browser — Speicher leeren
          entfernt sie auf dem Gerät. Eine Kopie auf einem Server gibt es nur, wenn du selbst ein
          optionales Konto anbindest.
        </li>
      </ul>

      <h2>Was Support nicht ist</h2>
      <ul>
        <li>Kein Reisebüro, keine Airline, keine Bahn, kein Hotel.</li>
        <li>Keine Zahlungsstelle. Orbit bewegt kein echtes Geld.</li>
        <li>Kein Anspruch auf eine Frist. Antwort nach Kapazität einer Privatperson.</li>
      </ul>

      <h2>English</h2>
      <p>
        {LEGAL.operatorName} runs Orbit as a <strong>private individual</strong>, not a company. There
        is no support team and no promised reply time.
      </p>
      <p>
        Write to <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a> ({LEGAL_ADDRESS_LINE}, Germany)
        about the demo app, a bug, or a privacy request. Local demo data stays in the browser until
        you clear site data. Orbit does not sell tickets and does not take payment.
      </p>

      <nav className="flex flex-wrap gap-3 text-sm">
        <Link to="/impressum">Impressum</Link>
        <Link to="/privacy">Datenschutz / Privacy</Link>
        <Link to="/">Zur App</Link>
      </nav>
    </LegalLayout>
  )
}
