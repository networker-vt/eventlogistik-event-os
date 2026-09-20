# Orbit 2.8.0 — release notes

Nav rename + Mehr/Mein tappable tiles + cleanup. GitHub Pages `base` stays `/eventlogistik-event-os/`. Impressum: Mirco Küßner (unchanged). **Do not merge until Super veto is satisfied.**

## Super veto (HARD)

1. **Bottom nav = Start · Match · Social · Mein only.** Four tabs. Mehr is a page (tiles), not a tab.
2. **Mehr + Mein = Tip-Kacheln** with icon + soft color. No text lists. Meta copy („ruhig“, „quiet“, „zwei Kacheln“, „Discover-Liste“) is OUT.
3. **Home Assist-first.** One filled primary remains **Orbit fragen**. Entdecker / Übersetzer / Telefon / Kids-Ausbau are **not** on the Home start surface. Stubs only under Mehr or Mein, labeled **Demo**.
4. **Match** is algorithmic (prefs + recent search/behavior stubs) — not jobs-only. `/treffer` and `/crew` keep Treffer / Crew naming.
5. **Social hub** (posts, like, share, vernetzen). **Chat is a sub-route** (`/social/chat`). `/messages` redirects.
6. **Mein hub tiles** include Wallet (adult), Kabine, Channels, Prefs, Verify, Campus, Kids, Entdecker (Demo). Kids: 0 Credits, no Wallet.
7. **Cap / Ledger / SoftPaywall UNTOUCHED** this PR.
8. **Do not** ship full Entdecker / Translator / WhatsApp / Kids overhaul here — document as next.

## Keep

Light default. Kabine / Abflug / Treffer naming where still used. Kids 0 credits. 21M / ledger untouched. DE+EN i18n. Pages base `/eventlogistik-event-os/`. Impressum Mirco Küßner.

## Next (not this PR)

Full vision / translator / WhatsApp-style calling / Kids overhaul.
