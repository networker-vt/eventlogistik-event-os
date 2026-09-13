import { LegalLayout } from './LegalLayout'

export function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutzerklärung">
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong>Platzhalter / TODO:</strong> Entwurf für Launch-Vorbereitung. Vor Go-Live durch
        Datenschutzbeauftragte:n / Anwalt finalisieren (DSGVO / TTDSG). Keine finalen Rechtsansprüche.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        TODO: Firmenname, Anschrift, E-Mail — siehe auch Impressum-Seite.
      </p>

      <h2>2. Hosting & Infrastruktur</h2>
      <ul>
        <li>Frontend: GitHub Pages (oder eigener Host) — TODO: Anbieter bestätigen</li>
        <li>Backend / Auth / DB: Supabase (falls produktiv angebunden) — TODO: Region / AVV</li>
        <li>Optional Analytics: TODO (z. B. Plausible / Matomo) — nur mit Consent</li>
      </ul>

      <h2>3. Welche Daten wir verarbeiten (geplant)</h2>
      <ul>
        <li>Account-Daten: Name, E-Mail, Rolle, Stadt, Profilangaben</li>
        <li>Marketplace: Inserate, Bookings, Nachrichten</li>
        <li>Technische Logs: IP (gekürzt), Browser, Fehlerberichte — TODO</li>
        <li>PWA: Service-Worker-Cache lokal auf dem Gerät</li>
      </ul>

      <h2>4. Rechtsgrundlagen</h2>
      <p>
        TODO: Art. 6 Abs. 1 lit. a (Einwilligung), lit. b (Vertrag), lit. f (berechtigtes Interesse)
        — je Verarbeitungszweck zuordnen.
      </p>

      <h2>5. Speicherdauer</h2>
      <p>TODO: Löschkonzept (Account-Löschung, gesetzliche Aufbewahrung).</p>

      <h2>6. Betroffenenrechte</h2>
      <p>
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch,
        Beschwerde bei einer Aufsichtsbehörde — TODO: Kontaktweg.
      </p>

      <h2>7. Cookies / lokale Speicherung</h2>
      <p>
        Die Demo speichert Auth- und Store-Daten in <code>localStorage</code>. Der Service Worker
        cached App-Shell-Assets für Offline. TODO: Consent-Banner falls Tracking hinzukommt.
      </p>

      <p className="text-sm text-muted">Stand: Platzhalter — bitte vor Launch aktualisieren.</p>
    </LegalLayout>
  )
}
