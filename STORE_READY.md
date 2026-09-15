# Store-Ready — Orbit als installierbare App

Kurzüberblick (Deutsch): Was **jetzt** bereit ist, was **ihr** noch klicken müsst, und warum wir **nicht** einreichen können.

Privacy-URL (Pflicht für Stores):  
https://networker-vt.github.io/eventlogistik-event-os/datenschutz

Impressum:  
https://networker-vt.github.io/eventlogistik-event-os/impressum

## Jetzt bereit: PWA installieren

- Service Worker (Workbox via `vite-plugin-pwa`)
- Offline-Shell
- Manifest: Name **Orbit**, Icons (192 / 512 / 1024), Wordmark, Splash (`public/icons/`)
- Install-Prompt (Android/Chrome) + iOS „Zum Home-Bildschirm“
- Apple-Touch-Icon + Startup-Images

### Handy

**Android (Chrome):** Seite öffnen → Banner oder Menü ⋮ → App installieren.

**iPhone/iPad (Safari):** Teilen → **Zum Home-Bildschirm**.

**Desktop:** Install-Icon in der Adressleiste.

Live: https://networker-vt.github.io/eventlogistik-event-os/

ZIP: GitHub Releases (`eventlogistik-event-os-web.zip`).

## Native Stores — Blocker auf eurer Seite

Wir können **weder App Store noch Play Store** einreichen:

1. **Kein Apple Developer Program** des Operators (Enrollment + 99 USD/Jahr + App Store Connect)
2. **Kein Google Play Console-Konto** (25 USD einmalig)
3. Kein Signing-Keystore / keine Distribution-Zertifikate im Repo
4. `android/` und `ios/` sind absichtlich nicht eingecheckt (Web-Build bleibt sauber)

Schritt-für-Schritt inkl. nächster Klicks: [`scripts/prepare-capacitor.md`](./scripts/prepare-capacitor.md)  
Config (bricht den Web-Build nicht): [`capacitor.config.json`](./capacitor.config.json)

### Capacitor — Kurz

```bash
npx vite build --base=/
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap add android
npx cap add ios    # nur macOS
npx cap sync
npx cap open android
npx cap open ios
```

Pages-Hosting bleibt `base: /eventlogistik-event-os/`. Store-Webview braucht `base: /`.

### TWA (Alternative Android)

Bubblewrap + Digital Asset Links auf der Production-Domain. Weniger Native-APIs.

## Screenshots-Checkliste

- [ ] iPhone 6.7" (1290×2796): Home, Jobs, Wallet mit Demo-Hinweis
- [ ] iPhone 6.5" / 5.5" (falls Zielgeräte)
- [ ] iPad 13"
- [ ] Android Phone + 7" + 10" Tablet
- [ ] Feature-Grafik Play (1024×500)
- [ ] PWA-Assets in `public/screenshots/` sind nur Platzhalter-Optik — Stores wollen echte UI-Shots

## Checkliste vor Einreichung

- [x] Impressum / Datenschutz / AGB mit echten Kontaktdaten (natürliche Person)
- [ ] AGB Marktplatz anwaltlich prüfen (Vermittlung, Haftung, Entgelte)
- [ ] Supabase live (Auth + RLS) statt Demo-Store
- [x] Privacy Policy URL öffentlich
- [ ] Content-Moderation & Melde-Flow
- [ ] Store-Screenshots (siehe oben)
- [ ] Play: Datensicherheit + Zielgruppe
- [ ] Apple: Privacy Nutrition Label + Alter
- [ ] Apple Developer + Play Console **des Operators**

## Was noch nicht Store-fertig ist

- Keine nativen Projekte im Repo
- Keine Push-Notifications
- Keine echten Zahlungen (Wallet = Demo bis Stripe/PayPal/Banking-KYC)
- Operator ist Privatperson — Store-Publisher-Identität muss zu Impressum passen

PWA = heute installierbar. Capacitor/TWA = nächster Schritt, **nach** Account-Anlage durch euch.
