# Launch-Checkliste — LoadIn

Deutsche Go-Live-Checkliste. Haken setzen, bevor Traffic / Presse / Ads.

## 1. Supabase-Projekt

- [ ] Projekt anlegen (EU-Region empfohlen, z. B. `eu-central-1`)
- [ ] SQL aus `supabase/migrations/20260912_init.sql` ausführen
- [ ] Auth: E-Mail-Provider aktivieren; Redirect-URLs = Pages-URL + Custom Domain
- [ ] RLS Policies reviewen (Starter sind vorhanden)
- [ ] Optional: Seed/Migration für Demo-Daten (nicht die lokalen Seed-IDs)

## 2. Environment-Variablen

Lokal / CI / Hosting:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...   # nur anon/public key — nie service_role im Frontend
VITE_USE_MOCK=false
VITE_APP_NAME=LoadIn
VITE_APP_URL=https://networker-vt.github.io/eventlogistik-event-os/
```

- [ ] `.env` aus `.env.example` (nie committen)
- [ ] Keys nur über sichere Secrets (GitHub Actions / Host)

Die App fällt ohne gültige Keys **graceful** auf den localStorage-Demo-Store zurück.

## 3. Domain & DNS

- [ ] Wunschdomain (z. B. `app.eventlogistik.de`)
- [ ] DNS: CNAME → `networker-vt.github.io` (oder A/AAAA laut Pages-Doku)
- [ ] GitHub → Settings → Pages → Custom domain + HTTPS erzwingen
- [ ] Nach Domain-Wechsel: Auth Redirects & Manifest/`start_url` prüfen

**Hinweis:** Vite `base` ist für dieses Repo `/eventlogistik-event-os/`. Bei Root-Domain-Hosting (`https://app…/`) separat mit `base: '/'` bauen.

## 4. GitHub Pages Deploy

```bash
./scripts/deploy-pages.sh
```

Oder manuell: `npm run build` → `cp dist/index.html dist/404.html` → force-push `gh-pages`.

- [ ] https://networker-vt.github.io/eventlogistik-event-os/ lädt
- [ ] Deep Links (z. B. `/jobs`) über 404.html SPA-Fallback
- [ ] PWA installierbar (HTTPS Pflicht)

## 5. Analytics (optional)

- [ ] Privacy-freundliches Tool (Plausible / Matomo) — **nur mit Consent**, wenn Cookies/Tracker
- [ ] Datenschutz-Text aktualisieren

## 6. Moderation & Trust

- [ ] Melde-Button / Support-Mail für Inserate & Profile
- [ ] Prozess für Sperrungen (Policy)
- [ ] Verifizierungs-Workflow: E-Mail → ID → Business (Badges schon im UI)

## 7. Verifizierung (Workflow)

- [ ] E-Mail-Confirm via Supabase Auth
- [ ] Manuelle ID-/Business-Prüfung (Upload + Admin-Queue) — TODO Produkt
- [ ] Badge nur nach Check setzen

## 8. Rechtliches

- [ ] `/impressum` — echte Firmendaten (TMG)
- [ ] `/datenschutz` — final (DSGVO), AVV mit Supabase/Host
- [ ] `/agb` — anwaltlich geprüft
- [ ] Links in Footer/AppShell sind verdrahtet

## 9. Go-Live Schritte

1. Supabase + Env setzen, Migration laufen lassen  
2. `npm run build` grün  
3. `./scripts/deploy-pages.sh`  
4. Smoke-Test mobil: Login, Job posten, Bewerbung, Chat, Booking → Completed → Rating  
5. Release-ZIP (GitHub Release) für Offline-Verteilung  
6. Soft-Launch mit Pilotkunden (1–2 Agenturen + Crew)  
7. Feedback → Iteration → öffentlicher Launch  

## 10. Nach dem Launch

- Monitoring (Errors, Uptime)
- Backup-Strategie Supabase
- Content: erste echten Jobs/Angebote (keine leere Marketplace-Optik)
- Roadmap: Payments, Push, Capacitor/TWA (siehe `STORE_READY.md`)

## Zahlungen (bewusst Mock)

- Wallet unter `/wallet` ist **Demo-UX**. Keine PayPal-/Stripe-/Krypto-API-Calls.
- Ohne Provider-Keys (und ohne bewussten Live-Schalter) darf kein echtes Geld bewegt werden.
- Disclaimer in DE ist Pflicht in Wallet + Pay-Sheet.
