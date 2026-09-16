# Orbit Credits (v2.5.0)

Bitcoin-style **hard cap: 21.000.000** Orbit Credits. **Balance = sum(`credit_events.delta`)**. Every write is an append-only intent with an idempotent **`txn_id`**. Duplicate `txn_id` is a no-op.

## Modes (`VITE_APP_MODE=demo|prod`)

| Mode | Ledger | Auth |
|------|--------|------|
| **demo** (default, GitHub Pages) | localStorage `orbit_credit_events_v1` + 21M protocol guardrail | Magic-link UI, no mail server — 1-tap demo link |
| **prod** | Same local cache **plus** read/write intents: RPC `apply_credit_intent` / Edge Function `credit-intent` → table `credit_events` | Supabase `signInWithOtp` when URL + anon key are set |
| prod **without keys** | Graceful fallback to demo localStorage | Graceful demo magic-link |

SQL: `supabase/migrations/20260916_credit_events.sql`. Stub: `supabase/functions/credit-intent/index.ts`. Client: `src/lib/creditLedger.ts`. The 21M protocol in `creditProtocol.ts` remains a **UX guardrail**; prod RPC also refuses mints that would breach the supply row.

`mintFromPoolToWallet` is still two local steps in demo. Prod intents are one RPC (`apply_credit_intent`) so mint + user credit share a `txn_id`.

Invariant: `circulating + remainingReserve + burned === 21_000_000`. Every grant (welcome, early tester, rewards, packs) **debits a pre-allocated pool** or fails.

## Allocation (sums to 21M)

| Pool | Amount | Rule |
|------|--------|------|
| Early Testers (signup **1–50**) | 75.000 | **1.500** Credits each (≥2–3× welcome) **plus −20% boost price forever** |
| Welcome later (signup 51+) | 425.000 | **25** Credits each (17.000 seats) |
| Rewards (performance) | 4.500.000 | Prefs, profile, match, referral, reviews, jobs — transfer from this pool |
| Packs (system mint) | 14.000.000 | While reserve remains. After 0: **P2P only** |
| P2P float (genesis) | 100.000 | Already circulating with simulated peers |
| Treasury (unissued) | 1.900.000 | Ops, no airdrop |
| **Total** | **21.000.000** | |

Signup ordinal is stored in `localStorage` (`orbit_signup_ordinal_v1`) on this device.

When **remainingReserve = 0**: no system minting. Users can (1) **earn** from whatever is left in the pre-allocated rewards pool, or (2) **buy/P2P** from other users (order-book stub). Gift / sponsoring is a **peer transfer** (~2% / min 1 Credit burned as fee) — never a new mint.

## Always free (soft paywall only at money moments)

- Assist ask
- Browse Match + **20 swipes / day**
- **Look analysis (basic)** — photo/video, two demo variants (Look is a **stub**)
- Basic chat (Match / Booking / Support)
- Wallet view
- Social read

Credits are required for: listing boosts, extra swipes, travel deep-scan, featured social, priority interview, Look extras. Pack checkout is a stub (no Stripe/PayPal).

## Welcome / Early testers

| Cohort | Each | Extra |
|--------|------|-------|
| Signup 1–50 | 1.500 | −20% on boost prices forever |
| Signup 51+ | 25 | — |

No extra +100 seed. If a pool is empty, the grant fails.

## Rewards (from the rewards pool)

| Action | Credits | Cap |
|--------|---------|-----|
| Prefs complete | 20 | once |
| Profile mostly complete | 30 | once |
| First successful match | 15 | once |
| Referral demo-signup | 40 | per demo |
| Ideas box | 8 | max 3 |
| Review | 10 | max 5 |
| Search / Match day | 5 | max 7 days |
| Job completed | 25 | max 5 |

## Buy packs (demo checkout)

While the **packs pool** has remainder, packs debit that pool:

| Pack | Credits | Shown price |
|------|---------|-------------|
| Klein | 100 | 9,90 € |
| Mittel | 300 | 24,90 € |
| Groß | 800 | 59,90 € |

**No Stripe, no PayPal.** When the pack reserve is empty, Wallet switches to **„von Nutzern kaufen“** (P2P stub).

## Spend (boosts — no remint into reserve)

| Boost | Credits | Early-50 |
|-------|---------|----------|
| Listing boost | 40 | 32 |
| Extra-Swipes | 25 | 20 |
| Travel deep-scan | 15 | 12 |
| Social featured | 20 | 16 |
| Priority interview | 30 | 24 |
| Look extra try-on variants (today) | 15 | 12 |
| Look nearby shop featured | 20 | 16 |
| Gift / sponsoring | peer transfer, **1 burned** | — |

### Gift / Sponsoring (Demo stub)

Wallet → **Verschenken / Sponsorn** (EN: Gift / Sponsor): pick a listing, company or profile → amount → optional message → confirm.

- Debits **your** demo balance (no new mint, 1 Credit fee burned). Circulating drops by the burn; net goes to the P2P float (honest local ledger, still one device).
- Quick **Sponsern** on Für-dich / Match-suggestion cards, listing detail, public profiles, Firma.
- **No real payout** to the recipient until payments + KYC exist.

DE: Demo-Ledger, kein Stripe. EN: same honesty — no real money.

## Channel linking (Demo stub)

Mein → **Kanäle verbinden**: Amazon, Netflix, YouTube, Spotify, Instagram.

- **Connected flag only.** Toggle only. **No OAuth, no scraping, no real account access.**
- When “connected”, Home Für-dich / Top Deals / News get a **light on-device tag bias** (shopping, entertainment, music, look).
- Copy never claims Orbit read those accounts.

## Public Wert-Index + Burn table

Wallet shows `X / 21M im Umlauf`, remaining reserve, burned, P2P-float, a **Wert-Index** stub, and a **Burn-Tabelle** (gift fees).

`100 × log₁₀(1 + aktive Nutzer) × (1 + Umlauf / 21M)` — labeled Demo-Formel, not a market price.

Indicative rate: 10 Credits ≈ 1 € — not a payout.

## Soft verify

E-Mail (magic link / login) → **phone before offering** → **ID / business before payout**. Stubs, no SMS vendor, no KYC vendor.
