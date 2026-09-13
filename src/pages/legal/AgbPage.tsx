import { LEGAL } from '../../lib/legal'
import { LegalLayout } from './LegalLayout'

export function AgbPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong>Startklar, aber nicht anwaltlich geprüft.</strong> Für einen Marktplatz
        (Vermittlung von Crew, Material, Transport, Bookings) braucht es vor kommerziellem Betrieb
        eine fachliche AGB-Prüfung — Haftungs-, Vermittlungs- und Provisionsregeln sind hier bewusst
        vorsichtig formuliert und können sich ändern.
      </p>

      <h2>§ 1 Geltungsbereich</h2>
      <p>
        Diese Bedingungen gelten für die Nutzung der Plattform {LEGAL.brand} (Web-App / PWA),
        betrieben von {LEGAL.operatorName}, {LEGAL.street}, {LEGAL.zip} {LEGAL.city} ({LEGAL.form}).
        Abweichende Bedingungen der Nutzer gelten nicht.
      </p>

      <h2>§ 2 Leistungsbeschreibung</h2>
      <p>
        {LEGAL.brand} stellt ein Event-OS bereit: Marktplatz (Angebot/Gesuch), Jobs, Katalog,
        Messaging, Booking-Pipeline, Demo-Wallet, Integrationen-Stubs und Community-Funktionen
        (Ideen-Box, Empfehlen). Die aktuelle öffentliche Version ist eine funktionsfähige Demo mit
        lokalem Speicher. Verbindliche Verfügbarkeit, SLA oder Live-Zahlungen sind nicht geschuldet.
      </p>

      <h2>§ 3 Registrierung</h2>
      <p>
        Angaben müssen wahrheitsgemäß sein. Die Demo-Anmeldung speichert Daten lokal. Ein Live-Account
        (geplant via Supabase) kann gesperrt werden bei Missbrauch, gesetzeswidrigen Inhalten oder
        Täuschung. Nutzung ab 18 Jahren.
      </p>

      <h2>§ 4 Inserate, Bookings, Vermittlerrolle</h2>
      <p>
        Nutzer stellen Inhalte selbst ein. Verträge über Crew-, Miet- oder Transportleistungen kommen
        — soweit überhaupt — zwischen den jeweiligen Parteien zustande. {LEGAL.brand} ist
        Plattformbetreiber und nicht automatisch Vertragspartner der vermittelten Leistung. Für einen
        echten Marktplatz muss diese Rolle anwaltlich geschärft werden (inkl. Haftung für fremde
        Inhalte, § 7 ff. DDG).
      </p>

      <h2>§ 5 Entgelte & Zahlungen</h2>
      <p>
        Die Nutzung der Demo ist kostenlos. Wallet, Featured-Credits, FX-Anzeige, IBAN- und
        Krypto-Formulare bewegen <strong>kein echtes Geld</strong>. Erst nach Anbindung von
        Stripe/PayPal/Banking-Partner inklusive KYC können Entgelte oder Treuhandzahlungen entstehen —
        dann mit gesonderter Preisangabe.
      </p>

      <h2>§ 6 Haftung</h2>
      <p>
        Für Vorsatz und grobe Fahrlässigkeit unbeschränkt. Für leichte Fahrlässigkeit nur bei
        Verletzung wesentlicher Pflichten, begrenzt auf den vorhersehbaren Schaden. Unberührt bleiben
        Ansprüche aus Verletzung von Leben, Körper, Gesundheit und dem Produkthaftungsgesetz.
        Inhalte Dritter und die Erreichbarkeit der Demo-Instanz ohne Gewähr.
      </p>

      <h2>§ 7 Schlussbestimmungen</h2>
      <p>
        Es gilt das Recht der Bundesrepublik Deutschland. Ist der Nutzer Kaufmann oder hat keinen
        allgemeinen Gerichtsstand in Deutschland, ist Gerichtsstand Köln. Sollten einzelne Klauseln
        unwirksam sein, bleibt der Rest wirksam.
      </p>

      <p className="text-sm text-muted">
        Entwurf {LEGAL.year} · {LEGAL.operatorName} / {LEGAL.brand} · Keine Rechtsberatung.
      </p>
    </LegalLayout>
  )
}
