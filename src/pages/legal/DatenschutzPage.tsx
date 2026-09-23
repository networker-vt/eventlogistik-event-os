import { LEGAL, LEGAL_ADDRESS_LINE } from '../../lib/legal'
import { LegalLayout } from './LegalLayout'

export function DatenschutzPage() {
  return (
    <LegalLayout title="Datenschutz / Privacy">
      <p className="rounded-xl border border-cyan/30 bg-cyan/10 px-4 py-3 text-sm text-cyan">
        Startklar für die öffentliche Demo. Kein Tracking, keine Bezahldaten. Vor einem kommerziellen
        Live-Betrieb mit echten Nutzerkonten sollten AV-Verträge (z. B. Supabase) und diese Erklärung
        noch einmal fachlich geprüft werden.
      </p>

      <h2>1. Verantwortlicher</h2>
      <p>
        {LEGAL.operatorName} ({LEGAL.form})
        <br />
        {LEGAL.street}, {LEGAL.zip} {LEGAL.city}, {LEGAL.country}
        <br />
        E-Mail: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>

      <h2>2. Hosting</h2>
      <ul>
        <li>
          Frontend: GitHub Pages (GitHub, Inc., USA). Beim Abruf fallen technisch notwendige
          Server-Logs beim Host an (IP, User-Agent, Zeitpunkt).
        </li>
        <li>
          Optional später: Supabase (EU-Projekt empfohlen) für Auth/DB — nur wenn in der Umgebung
          konfiguriert. Ohne Keys bleibt alles lokal im Browser.
        </li>
        <li>Kein Analytics-Tool ist aktiv. Kein Consent-Banner nötig, solange kein Tracking dazukommt.</li>
      </ul>

      <h2>3. Welche Daten wir verarbeiten</h2>
      <ul>
        <li>
          <strong>Lokal (localStorage):</strong> Demo-Account, Inserate, Wallet-Stubs, Ideen-Box,
          Referral-Code, Integrations-Status, Favoriten. Diese Daten verlassen das Gerät nicht, solange
          kein Backend angebunden ist.
        </li>
        <li>
          <strong>Ideen-Box:</strong> Kategorie, Freitext, optionale E-Mail — nur lokal. Die optionale
          E-Mail dient Rückfragen und wird nicht an Dritte weitergegeben.
        </li>
        <li>
          <strong>Account (geplant / optional Supabase):</strong> Name, E-Mail, Rolle, Stadt,
          Profilangaben, Inserate, Nachrichten.
        </li>
        <li>PWA: Service-Worker cached die App-Shell auf dem Gerät.</li>
      </ul>

      <h2>4. Rechtsgrundlagen</h2>
      <p>
        Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung/-erfüllung bei Registrierung), lit. f
        (berechtigtes Interesse an sicherem Hosting und Missbrauchsabwehr), lit. a soweit eine
        Einwilligung eingeholt wird (derzeit nicht für Tracking).
      </p>

      <h2>5. Speicherdauer</h2>
      <p>
        Lokale Demo-Daten bleiben, bis der Browser-Speicher geleert oder die Funktion „reset“ genutzt
        wird. Hosting-Logs richtet der Anbieter. Bei einem späteren Live-Account: Löschung auf
        Anfrage an {LEGAL.email}, gesetzliche Aufbewahrung bleibt vorbehalten.
      </p>

      <h2>6. Betroffenenrechte</h2>
      <p>
        Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit, Widerspruch sowie
        Beschwerde bei einer Aufsichtsbehörde (in NRW: LDI NRW). Kontakt: {LEGAL.email},{' '}
        {LEGAL_ADDRESS_LINE}.
      </p>

      <h2>7. Drittlandtransfer</h2>
      <p>
        GitHub Pages kann eine Übermittlung in die USA bedeuten (Standardvertragsklauseln des
        Anbieters). Keine eigenen Tracking-Cookies.
      </p>

      <h2>8. Zahlungen</h2>
      <p>
        Wallet, IBAN- und Krypto-Formulare sind Demonstrations-UI. Es werden keine Zahlungsdaten an
        Stripe, PayPal, Banken oder Blockchains übermittelt.
      </p>

      <h2>Privacy (English)</h2>
      <p>
        Controller: {LEGAL.operatorName}, a private individual ({LEGAL.form}), {LEGAL_ADDRESS_LINE},{' '}
        {LEGAL.country}. Email: <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>. Orbit is not a
        company and has no trade-register entry.
      </p>
      <ul>
        <li>The public app is hosted on GitHub Pages. The host may keep technical logs (IP, user agent, time).</li>
        <li>No analytics tool is active. No tracking cookies are set by Orbit.</li>
        <li>
          Demo data (account stub, listings, ideas, favorites) stays in this browser until you clear
          site data. It is not uploaded unless an optional Supabase project is configured later.
        </li>
        <li>Wallet and travel forms do not send card, bank, or booking data to a payment or airline system.</li>
        <li>
          You can ask for access, correction, or deletion at {LEGAL.email}. You may also complain to
          the supervisory authority in North Rhine-Westphalia (LDI NRW).
        </li>
      </ul>
      <p>
        This is a plain-language notice for the demo, not a law-firm opinion. Before a commercial
        service with real accounts, the text should be reviewed again.
      </p>

      <p className="text-sm text-muted">
        Stand: {LEGAL.year} · {LEGAL.operatorName} ·{' '}
        <a href={`mailto:${LEGAL.email}`}>{LEGAL.email}</a>
      </p>
    </LegalLayout>
  )
}
