# Tervana

A terpene-focused cannabis education and lookup platform for NY consumers. Scan the QR
code on a Metrc-tracked product's packaging and see a branded terpene/cannabinoid
profile instead of raw compliance data. A Duolingo-style **Learn** path (`/learn`)
teaches the underlying science in bite-size quiz lessons.

## Stack

- **Frontend:** React 19 + Vite + TypeScript, Tailwind CSS v4
- **Backend/DB:** Supabase (Postgres + Auth + RLS)
- **Hosting:** Vercel

## Getting started

```bash
npm install
cp .env.example .env   # fill in your Supabase project URL + anon key
npm run dev
```

### Supabase setup

1. Create a Supabase project.
2. Run the migration(s) in `supabase/migrations/` against it, in order — either via the
   Supabase CLI (`supabase link` then `supabase db push`) or by pasting each file into
   the SQL editor in the Supabase dashboard.
3. Copy **Project Settings → API → Project URL / anon public key** into `.env`.

### Creating the first admin user

There's intentionally no self-serve sign-up for admin access. To create one:

1. Add a user via **Supabase dashboard → Authentication → Add user** (or have them sign
   up through Supabase Auth some other way). This auto-creates a matching row in
   `public.profiles` with `role = 'user'`.
2. Promote them: `update public.profiles set role = 'admin' where email = '...';`
3. They can now sign in at `/admin/login`.

## Schema

All tables live in `public`, defined in
[`supabase/migrations/20260707120000_init_schema.sql`](supabase/migrations/20260707120000_init_schema.sql).
Reference data — 20 terpenes and the 6 major cannabinoids — is seeded separately in
[`supabase/migrations/20260708090000_seed_reference_data.sql`](supabase/migrations/20260708090000_seed_reference_data.sql),
after review (see that file's header comment for what got corrected and why).

| Table | Purpose |
|---|---|
| `profiles` | Extends `auth.users` with `role` (`user`/`admin`) and `subscription_tier` (`free`/`plus`, reserved for a future paywall). Auto-created via trigger on signup. |
| `brands` | Brand records. `is_sponsored` / `sponsorship_tier` back sponsored placement. |
| `dispensaries` | Dispensary records. `is_white_label_partner` flags a licensed white-label lookup page; `owner_user_id` is reserved for a future dispensary-portal login (unused today). |
| `products` | Core product record — name, brand, category, strain type, and `metrc_reference` (the code parsed from the scanned QR, unique, indexed — see "Scan resolution logic" below). |
| `terpenes` | Reference/educational data: aroma, reported effects, boiling point, "also found in" examples. Not product-specific. |
| `cannabinoids` | Same idea for the six major cannabinoids. |
| `product_terpene_profile` | Join table: product ↔ terpene ↔ percentage. |
| `product_cannabinoid_profile` | Join table: product ↔ cannabinoid ↔ percentage. |
| `lab_results` | COA records per product. `is_verified_partner` is the "verified lab" badge. |
| `scans` | One row per scan-to-lookup attempt, hit or miss (see below). |

**Monetization hooks modeled now, with UI deferred:** `brands.is_sponsored` /
`sponsorship_tier`, `lab_results.is_verified_partner`, `dispensaries.is_white_label_partner`,
`profiles.subscription_tier`. A future B2B API layer can sit on top of the existing public
read policies without a schema rework; a `dispensaries.owner_user_id` column is reserved
for a future dispensary-owner portal.

**A modeling nuance worth knowing:** `products.metrc_reference` is unique per row, and a
scanned code corresponds to a specific scanned package/listing, not necessarily a
platonic "this brand's Blue Dream flower." If the same nominal product is sold as
multiple batches/listings, you'll get multiple `products` rows for what a person would
call "one product." That matches the schema as specified; if that turns out to be
noisy in practice, splitting into a `product_lines` (conceptual product) +
`products` (batch/listing) model is the natural next step.

### Row Level Security

- **Public reference/catalog data** (`brands`, `dispensaries`, `products`, `terpenes`,
  `cannabinoids`, both profile join tables, `lab_results`) — readable by anyone
  (`anon` + `authenticated`), writable only by admins.
- **`profiles`** — a user can read/update their own row, but a database-level check
  blocks changing your own `role` or `subscription_tier` through the API (only an admin,
  or a service-role process such as a future billing webhook, can change those).
- **`scans`** — anyone (including anonymous) can insert a scan record, so logging works
  without requiring login. Reads are limited to your own scans or an admin.
- Admin checks go through a `public.is_admin()` `security definer` function rather than
  inlining a subquery on `profiles` in every policy, which avoids RLS recursion.

## Scan resolution logic

**Confirmed against real physical packaging** (2026-07-14) — the QR code encodes a short
URL:

```
https://1a4.com/{code}
e.g. https://1a4.com/5LO1I9DSO0DPBE65C2DC
```

`code` has no fixed length or prefix (real samples seen so far are 20–22 alphanumeric
characters). This replaced an earlier, incorrect assumption
(`https://app.1a4.com/landingpage/{retailId}/{index}`, a 24-char id starting with `1a4`) —
that longer form turns out to be what the *phone's native camera app* shows after 1a4.com
server-side redirects the short URL, not what the QR itself encodes. Parsing
([`src/lib/metrc.ts`](src/lib/metrc.ts)) is intentionally lenient on the code's exact
shape and still tolerant of the original app./landingpage//index variant too, in case
some packaging uses that form directly. **Tervana never fetches or scrapes the 1a4.com
page** — it's a client-side app with nothing meaningful to scrape server-side, and we
only ever parse the QR/URL text itself, never follow the redirect.

1. The QR resolves into the app at `/scan/:retailId/:index?`
   ([`src/App.tsx`](src/App.tsx)) — camera-based scanning on the home page
   ([`QrScanner`](src/components/scan/QrScanner.tsx), via `@yudiel/react-qr-scanner`)
   reads the code directly off the QR and routes here; manual paste works the same way.
2. [`ScanResultPage`](src/pages/ScanResultPage.tsx) validates the code shape
   (via [`isValidRetailId`](src/lib/metrc.ts)) and queries
   `products` where `metrc_reference = retailId`, embedding its brand, terpene profile,
   cannabinoid profile, and lab results in one request.
3. **Found:** renders the branded profile page.
4. **Not found:** shows a "not yet in our database" state with a link to reconstruct the
   original `https://1a4.com/...` URL (a plain outbound link, not a fetch) so the user can
   still reach the official compliance page.
5. Either way, a row is written to `scans` (`metrc_reference_scanned`, `found`,
   `product_id` nullable on a miss) so misses are a queryable worklist for what to add
   to the admin next. Malformed input (doesn't match the code shape at all) is
   shown its own state and isn't logged, since there's nothing actionable to add for it.

The home page also accepts a manually pasted 1a4.com URL or bare code
([`parseScanInput`](src/lib/metrc.ts)), for testing and for anyone who lands on the site
without having scanned anything. The admin product form has its own "Scan" button (same
`QrScanner` component) that fills the Metrc reference field directly from the QR, so
whoever's entering product data doesn't need to manually type or copy the code.

## Learn (education path)

`/learn` is a Duolingo-style lesson path: 4 units / 13 lessons / ~93 exercises
(multiple-choice and match-pairs), with sequential unlocking, wrong answers re-queued
until answered correctly, XP (10 per lesson, +5 perfect, 5 on replay), and a daily
streak.

- **Content** is hand-authored in [`src/data/learnContent.ts`](src/data/learnContent.ts)
  and deliberately mirrors the seeded reference data (aromas, sources, boiling points,
  psychoactivity) plus NY OCM adult-use rules — keep the two in sync if either changes.
  Effects language stays in the same non-clinical register as the rest of the app; the
  footer disclaimer applies.
- **Progress** lives in localStorage ([`src/lib/learnProgress.ts`](src/lib/learnProgress.ts),
  key `tervana.learn.v1`) because consumer users are anonymous. That module is the seam
  to swap for Supabase-backed progress if learner accounts ever exist. Streaks use the
  device's local calendar day, with a one-day grace period before display resets to 0.

## Admin

`/admin/login` → `/admin/products`, gated by [`RequireAdmin`](src/pages/admin/RequireAdmin.tsx).
Covers create/edit/delete for products (plus their terpene and cannabinoid percentage
rows) and brands (`/admin/brands`), including slug auto-generation from the name.
Dispensaries and lab results don't have a dedicated admin UI yet in this MVP — manage
those directly in the Supabase Studio table editor for now.

## Project structure

```
src/
  lib/            Supabase client, Metrc QR parsing, Learn progress store
  data/           Learn lesson content (units → lessons → exercises)
  types/          Hand-written DB types (mirrors the migration; see note in database.ts
                   about regenerating via `supabase gen types typescript`)
  context/         Auth context (session, profile, isAdmin)
  components/
    ui/            Button, Badge, Card, Spinner
    layout/        Header, Footer (legal disclaimer), Layout
    scan/           ProfileMeter (terpene/cannabinoid percentage bar)
    learn/          Inline SVG icons for the Learn feature
  pages/
    HomePage, ScanResultPage, NotFoundPage
    LearnPage (lesson path), LessonPage (quiz player)
    admin/          Login, layout, guard, products list + form
supabase/
  migrations/       Schema + RLS (seed data migration added once confirmed)
```
