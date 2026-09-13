import { LegalLayout } from './LegalLayout'

export function AgbPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong>Platzhalter / TODO:</strong> Keine verbindlichen Vertragsbedingungen. Vor
        kommerziellem Betrieb rechtlich prüfen lassen. EventLogistik vermittelt (geplant)
        Kontakte/Bookings — Zahlungsabwicklung ist in v1 out of scope.
      </p>

      <h2>§ 1 Geltungsbereich</h2>
      <p>
        TODO: Anbieter, Nutzerkreis (B2B / Freelancer), Geltung für Nutzung der Plattform
        EventLogistik Event-OS.
      </p>

      <h2>§ 2 Leistungsbeschreibung</h2>
      <p>
        Marketplace für Angebote/Gesuche (Freelancer, Firmen, Material, Transport, Kuriere, Hotels,
        Jobs), Messaging, Booking-Pipeline und Projekte. TODO: verbindliche Leistungsbeschreibung.
      </p>

      <h2>§ 3 Registrierung & Account</h2>
      <p>
        TODO: Wahrheitsgemäße Angaben, Verifizierung, Account-Sperre bei Missbrauch, Altersgrenze.
      </p>

      <h2>§ 4 Inserate & Bookings</h2>
      <p>
        Nutzer stellen Inhalte selbst ein. Verträge über Leistungen kommen ggf. zwischen den
        Parteien zustande — TODO: Klarstellung Vermittlerrolle vs. Vertragspartner.
      </p>

      <h2>§ 5 Entgelte</h2>
      <p>
        TODO: Kostenlose Beta / spätere Provisions- oder Abo-Modelle. Stripe/Payments sind aktuell
        nicht Teil des Produkts.
      </p>

      <h2>§ 6 Haftung</h2>
      <p>TODO: Haftung für eigene Inhalte, Haftungsbeschränkung, Verfügbarkeit der Plattform.</p>

      <h2>§ 7 Schlussbestimmungen</h2>
      <p>TODO: Gerichtsstand, anwendbares Recht (Deutschland), Salvatorische Klausel.</p>

      <p className="text-sm text-muted">
        Diese AGB sind bewusst als Stub gekennzeichnet und begründen keine Rechte oder Pflichten.
      </p>
    </LegalLayout>
  )
}
