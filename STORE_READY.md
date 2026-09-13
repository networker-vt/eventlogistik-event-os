# Store-Ready — LoadIn als installierbare App

Kurzüberblick (Deutsch): Was **jetzt** bereit ist und wie ihr später den **Play Store** (und optional App Store) erreicht.

## Jetzt bereit: PWA installieren

Die Web-App ist eine echte Progressive Web App:

- Service Worker (Workbox via `vite-plugin-pwa`)
- Offline-Shell (App-Shell gecacht)
- Web App Manifest (`name`, Icons, `start_url`/`scope` mit Base `/eventlogistik-event-os/`)
- Install-Prompt (Android/Chrome) + iOS-Hinweis („Zum Home-Bildschirm“)

### Handy installieren

**Android (Chrome):** Seite öffnen → Banner „LoadIn installieren“ oder Menü ⋮ → „App installieren“ / „Zum Startbildschirm“.

**iPhone/iPad (Safari):** Teilen-Symbol → **Zum Home-Bildschirm** → Hinzufügen.

**Desktop (Chrome/Edge):** Install-Icon in der Adressleiste oder Banner.

Live: https://networker-vt.github.io/eventlogistik-event-os/

Downloadbarer Build (ZIP): siehe GitHub Releases (`eventlogistik-event-os-web.zip`).

## Später: Google Play (TWA / Capacitor)

### Option A — Trusted Web Activity (TWA, Bubblewrap)

1. Production-URL mit HTTPS (Pages oder Custom Domain).
2. Digital Asset Links: `/.well-known/assetlinks.json` auf der Domain.
3. Mit [Bubblewrap](https://github.com/GoogleChromeLabs/bubblewrap) ein Android-Projekt erzeugen, das die PWA im Chrome Custom Tab / TWA öffnet.
4. Signing Key + Play Console Listing (Screenshots, Datenschutz-URL, Impressum).

**Vorteil:** Eine Codebasis (Web). **Nachteil:** Abhängigkeit von Web-Features; begrenzte Native-APIs.

### Option B — Capacitor (empfohlen für mehr Native)

```bash
npm install @capacitor/core @capacitor/cli
npx cap init LoadIn com.eventlogistik.app --web-dir dist
npm run build
npx cap add android
npx cap sync
npx cap open android
```

- `vite` `base` für Store-Builds ggf. auf `/` umstellen **oder** Capacitor `server.hostname` / `appId` konfigurieren.
- Für GitHub Pages bleibt `base: '/eventlogistik-event-os/'` — Store-Build separat (z. B. `vite build --base=/`).
- Plugins nach Bedarf: Push, Camera, Filesystem, StatusBar.

### Apple App Store

Capacitor + Xcode (`npx cap add ios`) auf macOS. PWA allein reicht für App Store **nicht**.

## Checkliste vor Store-Einreichung

- [ ] Impressum / Datenschutz / AGB mit echten Firmendaten
- [ ] Supabase live (Auth + RLS) statt Demo-Store
- [ ] Privacy Policy URL öffentlich erreichbar
- [ ] Content-Moderation & Melde-Flow
- [ ] Store-Screenshots (Phone + 7" / 10" Tablet)
- [ ] Altersfreigabe / Daten-Sicherheitsformular (Play)

## Was noch nicht Store-fertig ist

- Keine nativen Android/iOS-Projekte im Repo
- Keine Push-Notifications
- Keine In-App-Käufe / Stripe
- Rechtstexte sind **Platzhalter**

PWA = heute installierbar & downloadbar. TWA/Capacitor = nächster Schritt zum Play Store.
