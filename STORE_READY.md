# Store-Ready — Orbit 2.6.0 (ehrlich, Stand 2026-09-17)

**Kein Store-Upload ist in diesem Repo passiert und wird hier nicht behauptet.**  
PWA ist installierbar. Native App Store / Play-Einreichung braucht **morgen (und danach)** Klicks **vom Operator** in Apple Developer + Play Console. Dieses Dokument ist die Checkliste dafür — keine Fake-Submission.

Privacy-URL (Pflicht für Stores):  
https://networker-vt.github.io/eventlogistik-event-os/datenschutz

Impressum (unverändert, Mirco Küßner):  
https://networker-vt.github.io/eventlogistik-event-os/impressum

Live PWA: https://networker-vt.github.io/eventlogistik-event-os/  
Pages `base` **muss** `/eventlogistik-event-os/` bleiben. Store-Webview braucht `base: /`.

## Was ihr morgen braucht (Operator, nicht das Repo)

Ohne diese Konten kann **niemand** (auch kein Agent) einreichen:

| Store | Konto | Kosten (indikativ) | Nächster Klick |
|-------|--------|--------------------|----------------|
| Apple | [Apple Developer Program](https://developer.apple.com/programs/) + [App Store Connect](https://appstoreconnect.apple.com/) | ~99 USD/Jahr + Identitätsprüfung | Enroll → Meine Apps → + → Bundle-ID `de.orbit.app` |
| Google | [Play Console](https://play.google.com/console/signup) | ~25 USD einmalig | App erstellen → Name Orbit → Datenschutz-URL |

Keine Signing-Keys, kein Keystore, keine Distribution-Zertifikate im Repo. `android/` und `ios/` sind **absichtlich nicht eingecheckt**.

Schritt-für-Schritt: [`scripts/prepare-capacitor.md`](./scripts/prepare-capacitor.md)  
Config (bricht den Web-Build nicht): [`capacitor.config.json`](./capacitor.config.json)

### Capacitor — morgen auf dem Operator-Rechner

```bash
npx vite build --base=/          # nicht den Pages-Base verwenden
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/android
npx cap add android
npx cap add ios                  # nur macOS
npx cap sync
npx cap open android
npx cap open ios
```

GitHub Pages bleibt `base: /eventlogistik-event-os/`.

## Jugendschutz / Age rating (Orbit Kids in 2.6.0)

In-App: Altersbänder unter13 / 13–15 / 16–17 / 18+, Eltern-Gate (Rechenaufgabe) vor Kids verlassen, Credits-Ausgabe und Social/extern. Kids blendet Adult-SoftPaywall, Abflug-Buchung, offenen Social-Chat und Kabine-Adult-Try-on aus. Content-Flag `safeForKids`.

**Store-Altersfreigabe — ehrlich:**

- **Apple:** wahrscheinlich **12+** (User-generated listings, Chat für 18+, parental gate). **9+** nur, wenn Kids-Mode + parental features in App Store Connect als „Parental Controls“ deklariert werden und der Reviewer das akzeptiert. Nicht 4+ — Jobs/Minijobs und Credits sind im Adult-Pfad.
- **Google Play:** Zielgruppe **nicht** „nur Kinder“, sonst Families Policy. Mixed audience + parental gate. Content rating questionnaire: user-generated, social (optional), simulated purchases (demo credits — **keine** echten IAP bis Stripe).
- Screenshots: **eine** Kids-Gate-Szene + **eine** Campus-Szene + Adult-Home. Keine irreführenden „made for kids“-Claims.

Das ersetzt **kein** Rechtsgutachten. Operator muss die Fragebögen selbst ausfüllen.

## Screenshots — noch zu machen (Blocker)

Stores akzeptieren keine Platzhalter. Benötigt:

- [ ] iPhone 6.7" (1290×2796): Home (gefülltes „Orbit fragen“ + outlined chips), Kids-Gate, Campus, Treffer, Wallet mit Demo-Hinweis
- [ ] iPhone 6.5" / 5.5" (falls Zielgeräte)
- [ ] iPad 13"
- [ ] Android Phone + 7" + 10" Tablet
- [ ] Feature-Grafik Play (1024×500)
- [ ] `public/screenshots/` sind nur PWA-Optik — Stores wollen echte Device-Shots

## Checkliste vor echter Einreichung

- [x] Impressum / Datenschutz / AGB mit echten Kontaktdaten (natürliche Person, Mirco Küßner)
- [x] Privacy Policy URL öffentlich
- [x] PWA installierbar (Service Worker, Manifest, Icons)
- [x] Orbit Kids parental gate + `safeForKids` (2.6.0) — Store-Fragebogen noch offen
- [ ] AGB Marktplatz anwaltlich prüfen
- [ ] Supabase live (Auth + RLS) statt Demo-Store — **nicht** für den ersten TestFlight/Internal-Test zwingend, wohl für Production-Payments
- [ ] Content-Moderation & Melde-Flow
- [ ] Store-Screenshots (siehe oben)
- [ ] Play: Datensicherheit + Zielgruppe
- [ ] Apple: Privacy Nutrition Label + Alter
- [ ] **Apple Developer + Play Console des Operators**
- [ ] Capacitor-Projekte lokal erzeugen, AAB + IPA signieren
- [ ] Keine Fake-„Submitted“-Statusmeldungen

## Was noch nicht Store-fertig ist

- Keine nativen Projekte im Repo
- Keine Push-Notifications
- Keine echten Zahlungen (Wallet = Demo bis Stripe/PayPal/Banking-KYC)
- Operator ist Privatperson — Store-Publisher-Identität muss zum Impressum passen
- Credits sind **kein** fertiges IAP-Produkt

PWA = heute installierbar. Capacitor/TWA = nächster Schritt, **nach** Account-Anlage durch euch. **Wir haben nichts eingereicht.**
