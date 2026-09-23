# Orbit — iOS / TestFlight

Native shell only. The site stays on GitHub Pages. This repo has **no** Google Play / `android/` project.

| | |
|---|---|
| App name | Orbit |
| Bundle ID | `app.orbit.companion` |
| Operator | Mirco Küßner, private person (see Impressum) |
| Web dir | `dist` (Vite) |
| Pages base | `/eventlogistik-event-os/` (`npm run build`, `npm run deploy:pages`) |
| Native base | `/` (`npm run build:ios`, `npm run cap:sync`) |

`app.orbit.companion` does not claim a company. Register that exact id in the Apple Developer portal before the first upload. To use another id you control, change it in `capacitor.config.json` **and** the Xcode target together, then `npm run cap:sync`, before Archive.

## Deutsch

- Mac mit aktuellem Xcode und ein bezahltes **Apple Developer Program** auf Mirco Küßners Apple-ID.
- Im Projektroot: `npm ci`, danach `npm run cap:sync`. Das baut mit Vite-Base `/` und kopiert `dist` nach `ios/`. Ohne diesen Schritt ist die WebView leer.
- Xcode: `ios/App/App.xcodeproj` öffnen, oder `npx cap open ios` (nur macOS).
- **Signing & Capabilities:** Team = Mircos Apple-Team. Automatically manage signing an. Bundle-ID `app.orbit.companion` lassen, solange sie im Developer-Portal angelegt ist.
- **General:** Display Name `Orbit`. Version an `package.json` halten (aktuell 2.9.0). **Build** bei jedem Upload um 1 erhöhen. Gleicher Build darf nicht zweimal hochgeladen werden.
- **Product → Archive**. Im Organizer: **Distribute App → App Store Connect → Upload**.
- [App Store Connect](https://appstoreconnect.apple.com/): App anlegen (Bundle-ID oben), dann **TestFlight → Internal Testing**. Interne Tester sind das Team; kein Beta-Review.
- Privacy-URL: https://networker-vt.github.io/eventlogistik-event-os/privacy
- Support-URL: https://networker-vt.github.io/eventlogistik-event-os/support
- Impressum (nicht die Support-URL): https://networker-vt.github.io/eventlogistik-event-os/impressum
- `Info.plist` enthält nur `NSCameraUsageDescription`. Die Web-App öffnet die Kamera (Foto-Upload, Kabine, Entdecker, Interview-Vorschau). Kein Mikrofon, kein Standort, kein Tracking.
- Store-Text: Marktplatz. Keine ORB-, Token- oder Krypto-Claims.
- Kein Play Store in diesem Stand. `npm run build` bleibt der Pages-Build.

### Icons und Splash (Xcode Asset Catalog)

- App-Icon kommt aus `public/icons/icon-1024.png` (1024×1024, RGB, ohne Alpha) in `ios/App/App/Assets.xcassets/AppIcon.appiconset`.
- Wenn Xcode einen leeren 1024-Slot zeigt: dieselbe PNG auf den **App Store / iOS** Slot ziehen.
- Splash: `ios/App/App/Assets.xcassets/Splash.imageset` nutzt `public/icons/splash-1290x2796.png` auf Hintergrund `#F7F6F3`. Das ist ein iPhone-Portrait, keine komplette Geräte-Matrix.
- Anderes Launch-Bild: in Xcode **Assets.xcassets → Splash** ersetzen. `public/icons/splash-750x1334.png` und `splash-1290x2796.png` bleiben die PWA-Startup-Bilder und werden vom Asset-Catalog nicht automatisch in jede Größe geschnitten.
- `apple-touch-icon.png` (180×180) ist das Web-Icon. Für den Store zählt der 1024er Slot.

### Nur mit Apple-Login von Mirco

- Developer-Programm, Zertifikate und Provisioning (Xcode legt sie an, sobald das Team gesetzt ist).
- App in App Store Connect anlegen, Agreements / Tax / Banking, falls Apple sie verlangt.
- Export-Compliance: die App setzt `ITSAppUsesNonExemptEncryption = false` (nur HTTPS). Beim ersten Upload kurz prüfen.
- Interne Tester einladen. Ein öffentlicher TestFlight-Link braucht zusätzlich Beta App Review — nicht Teil dieses Scaffolds.

## English

- Mac, current Xcode, paid Apple Developer Program on Mirco Küßner’s Apple ID.
- From the repo root: `npm ci`, then `npm run cap:sync`. That builds with Vite base `/` and copies `dist` into `ios/`. Skip it and the WebView is empty.
- Open `ios/App/App.xcodeproj`, or `npx cap open ios` on macOS.
- **Signing & Capabilities:** Team = Mirco’s Apple team, automatically manage signing. Keep bundle id `app.orbit.companion` once it exists in the developer portal.
- **General:** display name Orbit. Keep the marketing version aligned with `package.json` (currently 2.9.0). Bump **Build** by 1 on every upload.
- **Product → Archive**, then Organizer → **Distribute App → App Store Connect → Upload**.
- In App Store Connect, create the app with that bundle id, then **TestFlight → Internal Testing**.
- Privacy URL: https://networker-vt.github.io/eventlogistik-event-os/privacy
- Support URL: https://networker-vt.github.io/eventlogistik-event-os/support
- Impressum: https://networker-vt.github.io/eventlogistik-event-os/impressum
- `Info.plist` has `NSCameraUsageDescription` only, because the web app already opens the camera. No microphone, location, or tracking usage strings.
- Store copy is a marketplace. No ORB, token, or crypto claims.
- No Play Store in this change. `npm run build` is still the GitHub Pages build.

### Icons and splash

- The app icon is `public/icons/icon-1024.png` in `AppIcon.appiconset`. If the 1024 slot is empty, drop that PNG onto it.
- Splash uses `public/icons/splash-1290x2796.png` on `#F7F6F3`. It is one phone portrait, not every device size. Replace **Assets.xcassets → Splash** in Xcode if you want a different launch image.
- `apple-touch-icon.png` stays the web icon. The store uses the 1024 slot.

### Still needs Mirco’s Apple login

- Certificates and provisioning (Xcode creates them after the Team is set).
- The App Store Connect record, plus any tax or banking prompts Apple shows.
- Confirm export compliance on the first upload (`ITSAppUsesNonExemptEncryption` is already false).
- Invite internal testers. A public TestFlight link needs Beta App Review and is out of scope here.
