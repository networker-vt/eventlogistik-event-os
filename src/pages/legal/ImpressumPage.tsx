import { LegalLayout } from './LegalLayout'

export function ImpressumPage() {
  return (
    <LegalLayout title="Impressum">
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong>Platzhalter / TODO:</strong> Dies ist noch kein fertiges Impressum. Bitte vor dem
        produktiven Go-Live mit echten Firmendaten ersetzen (TMG / DDV).
      </p>

      <h2>Angaben gemäß § 5 TMG</h2>
      <p>
        <strong>TODO: Firmenname / Rechtsform</strong>
        <br />
        TODO: Straße Hausnummer
        <br />
        TODO: PLZ Ort
        <br />
        Deutschland
      </p>

      <h2>Vertreten durch</h2>
      <p>TODO: Geschäftsführung / vertretungsberechtigte Person(en)</p>

      <h2>Kontakt</h2>
      <p>
        Telefon: TODO
        <br />
        E-Mail: TODO@example.de
      </p>

      <h2>Registereintrag</h2>
      <p>
        Registergericht: TODO
        <br />
        Registernummer: TODO (z. B. HRB …)
      </p>

      <h2>Umsatzsteuer-ID</h2>
      <p>
        Umsatzsteuer-Identifikationsnummer gemäß § 27 a Umsatzsteuergesetz:
        <br />
        TODO: DE…
      </p>

      <h2>Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h2>
      <p>TODO: Name und Anschrift</p>

      <p className="text-sm text-muted">
        Keine Rechtsberatung. Diese Seite ersetzt kein anwaltlich geprüftes Impressum.
      </p>
    </LegalLayout>
  )
}
