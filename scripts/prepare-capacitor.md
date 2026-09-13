# Capacitor — iOS & Android (LoadIn)

Die Web-App bleibt die Quelle. Native Hüllen entstehen **lokal auf eurem Rechner** — nicht in diesem Repo-Build. GitHub Pages nutzt weiter `base: /eventlogistik-event-os/`. Store-Builds brauchen `base: /`.

**Blocker:** Ohne eigenen **Apple Developer**- und **Google Play Console**-Account kann niemand die App einreichen. Dieses Repo enthält keine Secrets und keine Store-Binaries.

## 0. Accounts (muss der Operator anlegen)

### Apple (iOS)

1. https://developer.apple.com/programs/ öffnen
2. **Enroll** → Apple-ID von Mirco Küßner (oder später Firma)
3. Zahlung (~99 USD/Jahr) abschließen, Identitätsprüfung
4. Im [App Store Connect](https://appstoreconnect.apple.com/) **Meine Apps → + → Neue App**
5. Bundle-ID `de.loadin.app` reservieren (exakt wie `capacitor.config.json`)

### Google (Android)

1. https://play.google.com/console/signup
2. Einmalige Registrierung (~25 USD)
3. Entwicklerprofil + D-U-N-S später, falls GmbH
4. **App erstellen** → Name `LoadIn` → App (nicht nur Spiel)
5. Datenschutz-URL eintragen:  
   `https://networker-vt.github.io/eventlogistik-event-os/datenschutz`

## 1. Store-Web-Build (root base)

Im Projektroot, **nicht** den Pages-Base verwenden:

```bash
npx vite build --base=/
# oder: BASE=/ npm run build   (falls ihr das Script ergänzt)
```

`capacitor.config.json` zeigt auf `webDir: "dist"`.

## 2. Capacitor einmalig einhängen

```bash
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap init LoadIn de.loadin.app --web-dir dist
# capacitor.config.json liegt schon im Repo — bei Nachfrage nicht überschreiben
npx cap add android
npx cap add ios          # nur auf macOS
npm run build -- --base=/   # siehe oben
npx cap sync
```

`android/` und `ios/` bewusst **nicht** eingecheckt, damit der Web-Build nicht bricht.

## 3. Android → Play Console (nächste Klicks)

1. `npx cap open android` (Android Studio)
2. **Build → Generate Signed App Bundle / APK** → Android App Bundle (`.aab`)
3. Keystore **einmal** erzeugen und offline sichern (nicht committen)
4. Play Console → App → **Produktion** oder **Interner Test**
5. **App-Version erstellen** → AAB hochladen
6. Store-Listing: Kurz/Langtext, Grafiken (siehe Checkliste unten)
7. **Datensicherheit**-Formular, Zielgruppe, Inhalt
8. **Zur Prüfung einreichen** — erst möglich nach ausgefülltem Listing + Datenschutz-URL

## 4. iOS → App Store Connect (nächste Klicks)

1. macOS + Xcode (aktuell) + bezahlter Developer-Account
2. `npx cap open ios`
3. Signing & Capabilities: Team = euer Apple-Team, Bundle `de.loadin.app`
4. **Product → Archive** → Organizer → **Distribute App → App Store Connect**
5. App Store Connect → die neue Version wählen → Screenshots, Privacy Nutrition Label
6. Privacy Policy URL: dieselbe wie oben
7. **Zur Prüfung hinzufügen → Einreichen**

PWA allein reicht für den App Store **nicht**.

## 5. Screenshots-Checkliste (Store)

| Slot | Größe (typisch) | Inhalt |
|------|-----------------|--------|
| Phone 6.7" | 1290×2796 | Home + Jobs + Wallet-Hinweis „Demo“ |
| Phone 6.5" | 1284×2778 | Ideen-Box / Empfehlen |
| Phone 5.5" | 1242×2208 | optional |
| Tablet 13" | 2048×2732 | Desktop-Nav + Katalog |
| Android Phone | 1080×1920+ | dieselben Flows |
| Android 7"/10" | Tablet | Marktplatz + Integrationen |

Vorhanden in `public/screenshots/` (PWA): `wide.png`, `narrow.png`. Für Stores **echte Geräte-Screenshots** der Live-Pages-URL nachziehen.

Splash-Assets: `public/icons/splash-1290x2796.png`, `splash-750x1334.png`.

## 6. Privacy / Impressum URLs

- Datenschutz: `https://networker-vt.github.io/eventlogistik-event-os/datenschutz`
- Impressum: `https://networker-vt.github.io/eventlogistik-event-os/impressum`
- AGB: `https://networker-vt.github.io/eventlogistik-event-os/agb`

Ohne diese URLs lehnen beide Stores die Einreichung ab.

## 7. Was dieses Repo nicht tun kann

- Kein Apple-/Google-Login des Operators
- Kein Signing-Key
- Keine Einreichung
- Kein TestFlight / Interner Track ohne die Konten oben
