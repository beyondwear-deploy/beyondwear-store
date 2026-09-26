# Admin dashboard & editor — setup

Your site now has a private admin area at **`/admin`** with:

- **Overview** — revenue, orders, average order value, visitor and pageview totals, with trend charts.
- **Orders** — every real order placed on the site (a proper database record — no longer just an email).
- **Traffic** — pageviews, unique visitors, top pages, referrers and devices, similar to a lightweight Google Analytics / YouTube Studio.
- **Edit content** — click **"Edit page"** on any page of the live site to change text and photos directly, with a Save button. No code, no redeploy needed.

Everything is free — no paid plans, no credit card. It takes about 10 minutes to connect. Until you finish these steps, the site works exactly as before; the dashboard will just show a "connect your database" notice.

## 1. Create a free Supabase project

Supabase gives you a free Postgres database, file storage (for uploaded photos), all on one free plan.

1. Go to **supabase.com** → Sign up (you can use your GitHub account) → **New project**.
2. Pick any name and a strong database password (you won't need to remember this password day-to-day — Supabase stores it).
3. Choose the region closest to your customers (e.g. Singapore for Pakistan) and click **Create project**. Wait ~2 minutes for it to spin up.

## 2. Get your API keys

In your new Supabase project: **Project Settings → API**.

Copy three values:
- **Project URL** → this is `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key (click "Reveal") → this is `SUPABASE_SERVICE_ROLE_KEY` — keep this one secret, never share it or put it in the browser

## 3. Create the database tables

In Supabase: **SQL Editor → New query**. Open `supabase/schema.sql` from this project, paste its entire contents in, and click **Run**. This creates the `orders`, `page_views` and `content_overrides` tables, plus a `site-content` storage bucket for uploaded photos.

## 4. Set your admin login

Pick the email and password you'll use to sign in at `/admin/login`, and make up a long random string for the session secret (or run `openssl rand -hex 32` in a terminal if you have one).

## 5. Add the environment variables in Vercel

In Vercel: your project → **Settings → Environment Variables**, add:

| Name | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | from step 2 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | from step 2 |
| `SUPABASE_SERVICE_ROLE_KEY` | from step 2 |
| `ADMIN_EMAIL` | your chosen admin email |
| `ADMIN_PASSWORD` | your chosen admin password |
| `ADMIN_SESSION_SECRET` | your random string |

Then **redeploy** (Vercel → Deployments → ⋯ → Redeploy), or just push any commit — it'll pick these up automatically.

## 6. Sign in

Visit **beyondwear.store/admin/login** and sign in with the email/password from step 4.

## Using it day to day

- **Orders & Traffic** just work — every checkout and every page visit is now recorded automatically.
- **Editing content**: while signed in, open any page on the real site (Home, About, Contact for now) and click the orange **"Edit page"** button bottom-right. Text and photos with a dashed orange outline can be edited — hover and click the pencil, change it, click Save. Click it again on a photo to upload a replacement. The **Edit content** tab in the dashboard lists everything you've changed and lets you reset any single item back to the original.
- Want more of the site made editable this way (product descriptions, other pages, etc.)? Just ask — the underlying `<EditableText>` / `<EditableImage>` components can be added to any text or photo on the site.

## Notes

- Local dev (`npm run dev`) needs the same variables in a `.env.local` file (see `.env.example`).
- If you ever want to move off Supabase, the app only touches it through `src/lib/supabase.ts`, `src/lib/adminData.ts` and `src/lib/content.ts` — everything else is unaffected.
- The whole site now renders per-request (server-side) instead of some pages being pre-built static files, because every page checks whether you're signed in as admin. On Vercel's free Hobby plan this is still comfortably covered by the free usage allowance for a store this size.
