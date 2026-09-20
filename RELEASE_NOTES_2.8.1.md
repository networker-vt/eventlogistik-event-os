# Orbit 2.8.1 — release notes

Home discover vs Mein account split + tile emojis + channel opt-in stubs. GitHub Pages `base` stays `/eventlogistik-event-os/`. Impressum: Mirco Küßner (unchanged). **Do not merge until Super veto is satisfied.**

## Super veto (HARD)

1. **Home „Mehr entdecken“** is discover-only: Abflug, Campus, Entdecker, Kabine, Firma/Crew (and Mehr overflow). **Mein, Social, Wallet are not** on Home discover — they already live in the bottom nav / Mein.
2. **Mein hub** is account-only: Wallet (adult via `kidsHideWallet`), Prefs, Verify, Erstellen/Anbieten stubs, Ideen-Box, Channels, personal tools. Tiles sorted money → identity → create → connect → tools.
3. **Every tip tile** shows a visible emoji (or a small thematic image).
4. **Kanäle** expand opt-in stubs: Meta, X/Twitter, gaming (Steam / PlayStation / Xbox) plus existing commerce/entertainment. Explicit **Connect & consent**, clear **Disconnect**, Demo labels. No OAuth, no scraping, no silent harvest. **Kids: no social connects.**
5. **Assist-first.** One filled primary remains **Orbit fragen**. Cap / Ledger / SoftPaywall **UNTOUCHED**. Kids: 0 Credits.

## Keep

Light default. Kabine / Abflug / Treffer naming. Kids 0 credits. 21M / ledger untouched. DE+EN i18n. Pages base `/eventlogistik-event-os/`. Impressum Mirco Küßner.

## Next (not this PR)

Full vision / translator / WhatsApp-style calling / Kids overhaul. Real OAuth for channels later — not this stub.
