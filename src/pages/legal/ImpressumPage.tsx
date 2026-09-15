import { LEGAL, LEGAL_ADDRESS_LINE, copyrightLine } from '../../lib/legal'
import { LegalLayout } from './LegalLayout'

export function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
        Angaben einer <strong>natürlichen Person</strong> ({LEGAL.form}). Es besteht{' '}
        <strong>kein Handelsregistereintrag</strong> und keine GmbH. Stand: {LEGAL.year}.
      </p>

      <h2>Angaben gemäß § 5 DDG (ehem. TMG)</h2>
      <p>
        <strong>{LEGAL.operatorName}</strong>
        <br />
        {LEGAL.brand} — Job-Matching (privat betrieben)
        <br />
        {LEGAL.street}
        <br />
        {LEGAL.zip} {LEGAL.city}
        <br />
        {LEGAL.country}
      </p>

      <h2>Kontakt</h2>
      <p>
        E-Mail:{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
        <br />
        Anschrift: {LEGAL_ADDRESS_LINE}
      </p>

      <h2>Register & Umsatzsteuer</h2>
      <p>
        Kein Eintrag im Handelsregister (keine Kaufmannseigenschaft nach HGB / keine Kapitalgesellschaft).
        Eine Umsatzsteuer-Identifikationsnummer wurde nicht mitgeteilt. Soweit umsatzsteuerpflichtige
        Leistungen angeboten werden, gelten die gesetzlichen Vorschriften.
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>
        {LEGAL.operatorName}, {LEGAL_ADDRESS_LINE}
      </p>

      <h2>EU-Streitschlichtung</h2>
      <p>
        Die Europäische Kommission stellt eine Plattform zur Online-Streitbeilegung (OS) bereit:{' '}
        <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">
          https://ec.europa.eu/consumers/odr
        </a>
        . Wir sind nicht verpflichtet und nicht bereit, an Streitbeilegungsverfahren vor einer
        Verbraucherschlichtungsstelle teilzunehmen.
      </p>

      <p className="text-sm text-muted">{copyrightLine()}</p>
    </LegalLayout>
  )
}
