# Orbit 2.4.0 — release notes

Bitcoin-style Credits (21M cap), calmer Home, Orbit Look, Event/DE archive off Mehr. GitHub Pages `base` stays `/eventlogistik-event-os/`. Impressum: Mirco Küßner (unchanged).

## Credits — 21M hard cap

- `MAX_SUPPLY = 21_000_000`. Client ledger **never mints above this** (pools + invariant).
- Early testers: first **50** signups get **1.500** Credits; later welcome **25**. Ordinal in localStorage.
- Rewards, packs, welcome all debit remaining reserve / their pool or fail.
- Packs empty → P2P order-book stub („von Nutzern kaufen“). Gift/sponsoring = peer transfer + 1 Credit burn.
- Honesty: demo is client-side; real 21M needs server/chain later. See [CREDITS.md](./CREDITS.md).

## Home — one glance

Greeting + warm chips + **one** Assist field + **Find dein heutiges Match** (or prefs-first) + one swipeable **Für dich** rail (Top Deals, Matches, News, Look). Chip taps pre-fill Assist. Secondary features stay in Assist results or Mehr.

## Gift / Sponsoring

Wallet **Verschenken / Sponsorn** (EN: Gift / Sponsor): Empfänger (Listing / Firma / Profil) → Betrag → optionale Nachricht. Peer-Transfer, 1 Credit Burn, kein neues Mint. Quick **Sponsern** on Für-dich, listing, profile, Firma. Demo until real payments; local balance still updates.

## Channel linking

Mein **Kanäle verbinden**: Amazon / Netflix / YouTube / Spotify / Instagram toggles. **No OAuth, no scraping.** Connected flags only bias demo ranking (shopping, entertainment, music, look). DE+EN copy never claims Orbit read those accounts.

## Orbit Look / Style

`/look` — selfie, upload or short video → intent (Kleidung, Schuhe, Frisur, Make-up, Brille, Kids). Demo try-on = CSS filters + labels (**no live ML**). Product tiles (Marktplatz + external stubs). Nearby: Friseur, Optiker, Kinderarzt, Läden (prefs radius, seed). Assist: „neue Frisur“, „Sneaker zu meinem Style“. Basic analysis free; extra variants + featured nearby cost Credits from the 21M economy.

## Cleanup

Event/DE Archiv block removed from Mehr. Catalog / Event-OS seed routes redirect home. Channels link-stubs. IA: Assist, Match, Für dich, Wallet/Credits, Social, Travel, Firma, Look, Channels.

## Demo honesty

Wallet banner: Demo, 21M client ledger. Look: Demo/Vision-Stub. Travel/News still labeled demo.
