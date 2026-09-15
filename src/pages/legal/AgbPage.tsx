import { LEGAL } from '../../lib/legal'
import { LegalLayout } from './LegalLayout'

export function AgbPage() {
  return (
    <LegalLayout title="Allgemeine Geschäftsbedingungen (AGB)">
      <p className="rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-100">
        <strong>Startklar, aber nicht anwaltlich geprüft.</strong> Für Job-Matching
        (Vermittlung zwischen Suchenden und Anbietenden) braucht es vor kommerziellem Betrieb
        eine fachliche AGB-Prüfung — Haftungs-, Vermittlungs- und Entgeltregeln sind hier bewusst
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
        {LEGAL.brand} stellt eine Demo-PWA für einen ruhigen Marktplatz bereit: duales Matching
        (Suchende und Firmen — B2B, Dienstleistungen, Partnerschaften, Jobs), Orbit Assist
        (lokaler Planer / Demo-Recherche), Reise-Suche mit Mock-Preisen, In-App-Checkout-Stubs,
        Tickets in der Wallet und ein lokaler Social-Feed. Die aktuelle öffentliche Version ist
        eine funktionsfähige Demo mit lokalem Speicher. Verbindliche Verfügbarkeit, SLA,
        Live-Zahlungen oder echte GDS-/Airline-/Hotel-Buchungen sind nicht geschuldet.
      </p>

      <h2>§ 3 Registrierung</h2>
      <p>
        Angaben müssen wahrheitsgemäß sein. Die Demo-Anmeldung speichert Daten lokal. Ein Live-Account
        (geplant via Supabase) kann gesperrt werden bei Missbrauch, gesetzeswidrigen Inhalten oder
        Täuschung. Nutzung ab 18 Jahren.
      </p>

      <h2>§ 4 Inserate und Vermittlerrolle</h2>
      <p>
        Nutzer stellen Inhalte selbst ein. Arbeitsverhältnisse oder ähnliche Vereinbarungen kommen
        — soweit überhaupt — zwischen den jeweiligen Parteien zustande. {LEGAL.brand} ist
        Plattformbetreiber und nicht automatisch Vertragspartner einer vermittelten Stelle. Vor einem
        kommerziellen Betrieb muss diese Rolle anwaltlich geschärft werden (inkl. Haftung für fremde
        Inhalte, § 7 ff. DDG).
      </p>

      <h2>§ 5 Entgelte & Zahlungen</h2>
      <p>
        Die Nutzung der Demo ist kostenlos. Wallet, Featured-Credits, FX-Anzeige, IBAN- und
        Krypto-Formulare sowie Reise-Checkout bewegen <strong>kein echtes Geld</strong>.
        Angezeigte Flüge, Hotels, Bahn- und Mietwagenpreise sind Mock-Daten — keine
        GDS-/OTA-Buchung. Social-Funktionen laufen nur lokal auf dem Gerät. Erst nach Anbindung
        von Stripe/PayPal/Banking-Partner inklusive KYC und Reise-Partner-APIs können Entgelte
        oder echte Buchungen entstehen — dann mit gesonderter Preisangabe.
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
