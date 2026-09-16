# Orbit 2.5.0 — release notes

SUPER-APP sprint on live 2.4.0. GitHub Pages `base` stays `/eventlogistik-event-os/`. Impressum: Mirco Küßner (unchanged). PWA first — **no App Store / Play submission this sprint**.

## 90-day focus

DE Freelancer/KMU: **Jobs finden oder anbieten** (not everything-equal). Look, Gift/Sponsor, Channels stay **stubs**. Channel = connected flag only.

## Home IA

Assist-first. Top-3 chips: **Suchen / Anbieten / Weitermachen**. One filled primary CTA (Orbit fragen). Match remains a secondary text link (prefs-first). Opt-in reminders: max 1–2/week, 1-tap action.

## Credits P0 — append-only ledger

- Schema `credit_events` (SQL migration) + Edge Function stub `credit-intent`.
- Idempotent `txn_id`. **Balance = sum(delta)**. Cap never exceeded (client + RPC).
- `VITE_APP_MODE=demo|prod` — demo keeps localStorage; prod writes intents only after server `ok:true`. Missing keys in prod **hard-fail** credit mutations (no silent local mint).
- Follow-up (Tech-Gate R1–R4): kind allowlist + service_role mint, atomic mint rollback, hydrate replaces local cache. See [CREDITS.md](./CREDITS.md).
- Early-50: **2.000** Credits (10× welcome) **plus −20% boosts forever**. Normal welcome **200** (17.000 seats). Packs pool 11M after moving 3M into Early + Welcome. Cap still 21M.
- Soft paywall only at money moments. Public Wert-Index + Burn table in Wallet.
- See [CREDITS.md](./CREDITS.md).

## Auth

Magic link / email. Supabase `signInWithOtp` when configured; demo 1-tap link if keys are missing.

## Trust & catalogue

- Soft verify: email → phone to offer → ID/business before payout (stubs).
- Categories: 6–10 filled industries live; empty chips hidden.

## Demo honesty

No Stripe/PayPal. No real magic-email without keys. No OAuth on channels. Look is filters, not ML. Travel/News still labeled demo.
