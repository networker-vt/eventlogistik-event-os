import { Link } from 'react-router-dom'
import { LegalLayout } from './LegalLayout'

export function RankingPage() {
  return (
    <LegalLayout title="Ranking">
      <p>
        So entsteht die Reihenfolge in der öffentlichen Version. Es gibt keine bezahlte Platzierung
        und kein verstecktes Entgelt.
      </p>
      <h2>Suche</h2>
      <p>
        Treffer richten sich nach dem Text in Titel, Beschreibung, Stadt und Gewerk. Filter für
        Stadt, Art und Preis schränken die Liste ein. Sie sortieren nicht nach Geld.
      </p>
      <h2>Match</h2>
      <p>
        Karten, die zu deinen Angaben passen (Branche, Jobtyp, Ort, Angebot oder Gesuch), stehen
        weiter vorn. Karten, die du überspringst, rutschen nach hinten. Ein früherer „Featured“-Schalter
        ist aus und ändert die Reihenfolge nicht.
      </p>
      <h2>Startseite</h2>
      <p>
        Bereiche, die du auf diesem Gerät zuletzt geöffnet hast, können nach oben rücken. Das
        passiert nur lokal und nur für wenige Kacheln.
      </p>
      <p>
        <Link to="/support">Kontaktstelle für Meldungen</Link>
      </p>
    </LegalLayout>
  )
}
