# BeyondWear — Preloved Shoes

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand · Supabase.
**BeyondWear** (beyondwear.store) — *going beyond fast fashion.* Brand name, tagline, story and contact details live in `src/lib/config.ts`; the logo is `src/components/layout/logo-paths.ts` + `Logo.tsx`.

> **Launch scope: shoes only.** Other categories (jackets, clothing, bags, accessories) are shown as *Coming soon*. To launch a category later, add its id to `LIVE_CATEGORIES` in `src/lib/catalog.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Requires Node 18.18+ (Node 20+ recommended). Copy `.env.example` to `.env.local` and see **Connecting Supabase** below — the site works without it (falls back to a browser-only demo mode with a clear "connect your database" notice in the admin panel), but real orders, accounts, financials and analytics all need it connected.

## What's real vs. what's still a placeholder

| Area | Status |
|---|---|
| Home, Shop, Men / Women / Kids (shoes), New Arrivals, Search | Fully working (URL-driven filters, sort, typo-tolerant search) |
| Product page (gallery, zoom, fullscreen, size guide, condition, measurements) | Fully working |
| Cart, promo codes, delivery options, one-of-one stock + SOLD OUT | Fully working |
| Checkout — Cash on Delivery, Mobile Wallet Transfer, Pay via WhatsApp | Real, persists to Supabase (`orders` table) |
| Order tracking (customer-facing) | Real — looked up server-side (`/api/track`), works across devices, shows the real timestamped status history |
| Admin panel (`/admin`) — orders, products, content editor, traffic, financials | Real, backed by Supabase; password login via `ADMIN_EMAIL` / `ADMIN_PASSWORD` |
| Admin → Orders: status pipeline (placed → confirmed → packed → shipped → out for delivery → delivered/cancelled) | Real, timestamped; revenue only books once an order is Delivered |
| Admin → Financials (Overview, P&L, Balance Sheet, Cash Flow, Inventory, Expenses, Settings) | Real, computed live from orders + cost prices + the expense log — see `src/lib/financials.ts` |
| Admin → Traffic (pageviews, unique visitors, top pages, referrers, device mix) | Real, from the `page_views` table |
| Account (register/login/reset, profile, addresses, orders, wishlist, recently viewed) | Browser-only demo (`src/lib/adapters/auth.ts`) — not yet backed by Supabase auth |
| Newsletter / contact form | Stored via Supabase where connected, falls back to a browser demo adapter otherwise |
| **Online payment ("Pay via WhatsApp")** | There's no real card/wallet gateway wired in — accepting those needs a merchant account (JazzCash, Easypaisa, Safepay, PayFast…) that only the business owner can register. Until then, this option opens a prefilled WhatsApp Business chat so the customer can arrange payment directly. See `src/lib/adapters/payments.ts` to wire in a real gateway later. |
| Product catalogue | Lives in Supabase once connected — built-in seed products have been removed; add real inventory from `/admin/products/new`, edit any listing from `/admin/products` |
| SEO (metadata, Open Graph, Product/Breadcrumb/FAQ/Store JSON-LD, sitemap, robots) | Done |

### Honest limits — read before relying on this in production

- **Auth still runs in the browser only** (`src/lib/adapters/auth.ts`). It won't sync across devices and isn't secure enough for real customer accounts yet — orders don't require an account, so this doesn't block selling, but plan to move it onto Supabase Auth before promoting account creation.
- **Liabilities aren't tracked in Financials** — no supplier credit or loan ledger exists yet, so the Balance Sheet shows liabilities as zero and says so explicitly. Log anything you owe as an expense once paid, or extend `src/lib/financials.ts` if you need real payables tracking.
- **Cost price defaults to a single store-wide number** (editable in Financials → Settings) unless you set a per-product override — good enough for a small catalogue, but it assumes a flat cost per pair rather than per-purchase-batch costing.
- **Policies are drafts, not legal advice.** Have them reviewed.
- Phone, WhatsApp, bank details and address in `src/lib/config.ts` are real values you provided — double-check them if you ever fork this for another store.

## Where to change things

| I want to… | Edit |
|---|---|
| Brand name, tagline, story, contact, socials, delivery fees, promo codes, bank details, counters | `src/lib/config.ts` |
| Which categories are live vs "Coming soon" | `LIVE_CATEGORIES` and `COMING_SOON` in `src/lib/catalog.ts` |
| Logo, favicon, share image | `components/layout/Logo.tsx` + `logo-paths.ts`, `public/favicon.svg`, `public/og.png` |
| Colors, radii, shadows, dark mode | `src/styles/theme.css` (CSS variables) |
| Add / edit products | `/admin/products` (recommended) — or seed defaults in `src/data/products.ts` |
| FAQ / policies / process steps | `src/data/faq.ts`, `policies.ts`, `process.ts` |
| Navigation | `NAV_LINKS` in `config.ts`, footer in `components/layout/Footer.tsx` |
| Financial model (cost basis, statements) | `src/lib/financials.ts` |
| Order status pipeline | `src/lib/types.ts` (`OrderStatus`/`FullOrderStatus`), `src/app/api/admin/orders/[id]/route.ts` |

## Structure

```
src/
  app/            routes (server components; interactive parts are "use client" islands)
    admin/        password-gated admin panel — orders, products, content, traffic, financials
    api/          route handlers (orders, tracking, admin CRUD — all Supabase-backed)
  components/
    ui/           Button, Modal, Toast, Badge, Form fields, Accordion, EmptyState, LoadingState, Reveal …
    product/      ProductCard, ProductGrid, ProductFilter, ProductGallery, ProductView, QuickView …
    layout/       Navbar, MobileMenu, SearchOverlay, Footer, ThemeToggle, AnnouncementBar
    admin/        KpiCard, BreakdownBars, charts, NotConfigured — shared admin dashboard UI
    cart/ checkout/ orders/ account/ contact/ home/ shop/ art/
  lib/            config, catalog access, search, filters, pricing, formatting, financials, adminData, adapters/
  store/          Zustand stores (cart, wishlist, recent, orders, auth, UI)
  data/           seed catalogue + content (admin-added products live in Supabase instead)
supabase/schema.sql   full PostgreSQL schema — orders, page_views, content/product overrides, custom_products, expenses, store_settings, RLS policies
```

## Connecting Supabase

1. Create a project at supabase.com (free tier), then SQL Editor → paste `supabase/schema.sql` → Run. Safe to re-run any time (uses `if not exists` everywhere) — running it again after a code update picks up new tables/columns without touching existing data.
2. In your environment (`.env.local` locally, your host's env vars in production), set:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — server-only, never expose to the client
   - `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET` — see `ADMIN_SETUP.md`
3. Redeploy. The admin panel, checkout, order tracking, traffic analytics and financials all light up automatically once these are set — everywhere they aren't, you'll see an on-screen "connect your database" notice instead of a crash.

Full step-by-step setup (with screenshots-in-words) is in `ADMIN_SETUP.md`.

## Deploy

Works on Vercel, Netlify or any Node host. Set `NEXT_PUBLIC_SITE_URL` to your real domain (`https://beyondwear.store`) so canonical URLs, Open Graph tags and `sitemap.xml` are correct. Product URLs look like `/product/nike-air-max-trainers-black-size-9`.

## Quality notes

Accessible by default (skip link, focus-trapped dialogs, labelled forms, `prefers-reduced-motion` respected, keyboard-usable gallery/filters). Forms validate on the client, sanitise input, use honeypots, and never expose secrets. Security headers are set in `next.config.mjs`.
