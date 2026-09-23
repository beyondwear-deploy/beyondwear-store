# Sequel Closet — Preloved Shoes

Next.js 15 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion · Zustand.
**Sequel Closet** — *Preloved shoes. Second chapter.* Brand name, tagline, story and contact details live in `src/lib/config.ts`; the logo is `src/components/layout/logo-paths.ts` + `Logo.tsx`.

> **Launch scope: shoes only.** Other categories (jackets, clothing, bags, accessories) are shown as *Coming soon*. Their demo products stay in `src/data/products.ts` but are hidden. To launch a category later, add its id to `LIVE_CATEGORIES` in `src/lib/catalog.ts`.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
npm run build && npm start
```

Requires Node 18.18+ (Node 20+ recommended). Copy `.env.example` to `.env.local` if you want to change the site URL or payment mode.

## What works today (demo mode)

The whole storefront runs with **no backend**. Data that would normally live on a server (accounts, orders, newsletter, contact messages) is stored in the visitor's browser through small **adapters**, so every flow can be clicked through end to end:

| Area | Status |
|---|---|
| Home, Shop, Men / Women / Kids (shoes), New Arrivals, Search | Fully working (URL-driven filters, sort, typo-tolerant search) |
| Coming Soon page + notify form, "Coming soon" tiles, coming-soon messages for clothing/bags searches and URLs | Working (email stored in the browser demo adapter) |
| Product page (gallery, zoom, fullscreen, size guide, condition, measurements) | Fully working |
| Cart, promo codes, delivery options, one-of-one stock + SOLD OUT | Fully working |
| Checkout (COD, bank transfer, online), order confirmation, order tracking | Working (demo adapters) |
| Account (register/login/reset, profile, addresses, orders, wishlist, recently viewed) | Working (browser-only demo accounts) |
| About (incl. what "Sequel" means), Our Work, Services, Sustainability, Contact, FAQ, Shoe size guide, 5 policies | Fully working |
| SEO (metadata, Open Graph, Product/Breadcrumb/FAQ/Store JSON-LD, sitemap, robots) | Done |

Try it: promo codes `WELCOME10`, `SECONDLIFE`, `FREESHIP`; track order `SEQ-DEMO01` with `demo@example.com`.

### Honest limits — read before launch

- **Product photos are generated SVG art** (placeholders). Add real photos per product in `src/data/products.ts` via `images[].src`; the art disappears automatically for any image that has a `src`.
- **Auth, orders, payments, newsletter and contact run in the browser only** (`src/lib/adapters/*`). They will not sync across devices and are not secure enough for real customers. Replace them with Supabase (see below) before taking real orders.
- **Online payment is a simulated gateway.** Wire a real provider (e.g. a Pakistani gateway) in `src/lib/adapters/payments.ts` — the interface is already defined. Never put gateway secrets in `NEXT_PUBLIC_*` variables.
- **Testimonials and the Instagram grid are clearly marked demo.** Replace with real customer content or remove them. No environmental statistics are invented; the counters are configurable in `config.ts`.
- **Policies are drafts, not legal advice.** Have them reviewed.
- Phone, WhatsApp, bank details and address are placeholders in `src/lib/config.ts`. The email (`hello@sequelcloset.pk`) and social handles (`@sequelcloset`) are *planned* — confirm the domain and each handle are yours before launch.
- Shoe photos are generated art; the Sequel Closet name has not been trademark-checked (see the launch checklist you were given).

## Where to change things

| I want to… | Edit |
|---|---|
| Brand name, tagline, "what Sequel means", story, contact, socials, delivery fees, promo codes, bank details, counters | `src/lib/config.ts` |
| Which categories are live vs "Coming soon" | `LIVE_CATEGORIES` and `COMING_SOON` in `src/lib/catalog.ts` |
| Logo, favicon, share image | `components/layout/Logo.tsx` + `logo-paths.ts`, `public/favicon.svg`, `public/og.png` |
| Colors, radii, shadows, dark mode | `src/styles/theme.css` (CSS variables) |
| Add / edit products | `src/data/products.ts` (or Supabase — see below) |
| FAQ / policies / process steps | `src/data/faq.ts`, `policies.ts`, `process.ts` |
| Navigation | `NAV_LINKS` in `config.ts`, footer in `components/layout/Footer.tsx` |

## Structure

```
src/
  app/            routes (server components; interactive parts are "use client" islands)
  components/
    ui/           Button, Modal, Toast, Badge, Form fields, Accordion, EmptyState, LoadingState, Reveal …
    product/      ProductCard, ProductGrid, ProductFilter, ProductGallery, ProductView, QuickView …
    layout/       Navbar, MobileMenu, SearchOverlay, Footer, ThemeToggle, AnnouncementBar
    cart/ checkout/ orders/ account/ contact/ home/ shop/ art/
  lib/            config, catalog access, search, filters, pricing, formatting, adapters/
  store/          Zustand stores (cart, wishlist, recent, orders, auth, UI)
  data/           demo catalogue + content
supabase/schema.sql   full PostgreSQL schema, atomic place_order(), RLS policies
```

## Connecting Supabase (recommended production path)

1. Create a project, run `supabase/schema.sql` in the SQL editor, create a public `product-images` storage bucket.
2. Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` (and in your host). Keep `SUPABASE_SERVICE_ROLE_KEY` server-side only.
3. Re-implement the adapters — signatures already match:
   - `lib/catalog.ts` → `select` from `products` + `product_images` (server components can `await` it)
   - `lib/adapters/auth.ts` → `supabase.auth.signUp / signInWithPassword / resetPasswordForEmail`
   - `lib/adapters/orders.ts` → `supabase.rpc("place_order")` and `rpc("track_order")`
   - `lib/adapters/forms.ts` → inserts into `contact_messages` / `newsletter_subscribers`
4. `place_order` decrements stock inside a locked transaction so a one-of-one piece can never be sold twice. **Before going live, recompute discount and delivery fee inside that function** (marked in the SQL) instead of trusting the values sent by the browser.
5. The schema is admin-ready (`is_admin()` policy using `app_metadata.role = 'admin'`) — a Supabase Studio or a small `/admin` app can manage products, orders and coupons.

## Deploy

Works on Vercel, Netlify or any Node host. Set `NEXT_PUBLIC_SITE_URL` to your real domain so canonical URLs, Open Graph tags and `sitemap.xml` are correct. Product URLs look like `/product/nike-air-max-trainers-black-size-9`.

## Quality notes

Accessible by default (skip link, focus-trapped dialogs, labelled forms, `prefers-reduced-motion` respected, keyboard-usable gallery/filters). Forms validate on the client, sanitise input, use honeypots, and never expose secrets. Security headers are set in `next.config.mjs`.
