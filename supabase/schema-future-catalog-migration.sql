-- =====================================================================
-- NOT CURRENTLY USED — kept for reference only.
--
-- This is an earlier, more ambitious schema drafted for a full future
-- migration of the product catalogue itself into Postgres (products,
-- brands, categories, a normalized orders/order_items design, an atomic
-- place_order() stock-decrement RPC, auth.users-based customer accounts,
-- etc.) It predates the current BeyondWear branding and does not match
-- how the site works today (the catalogue in src/lib/catalog.ts is still
-- static/local, not database-backed).
--
-- The schema actually in use today — orders, page_views and
-- content_overrides, backing the admin dashboard and inline editor — is
-- in supabase/schema.sql. Don't run this file unless/until you decide to
-- do that bigger catalogue migration; if you do, you'll want to reconcile
-- its `orders` table with the simpler one in schema.sql first.
-- =====================================================================

-- =====================================================================
-- BeyondWear (preloved shoe store) — Supabase / PostgreSQL schema
-- Run in the Supabase SQL editor. Shapes match src/lib/types.ts so the
-- local adapters can be swapped for these tables one at a time.
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------- enums ----------
create type condition_grade as enum ('new', 'like-new', 'excellent', 'good', 'fair');
create type gender_t        as enum ('men', 'women', 'kids', 'unisex');
create type product_status  as enum ('active', 'draft', 'archived');
create type order_status    as enum ('placed', 'confirmed', 'packed', 'shipped', 'out-for-delivery', 'delivered', 'cancelled');
create type payment_method  as enum ('cod', 'bank-transfer', 'online');
create type payment_status  as enum ('pending', 'awaiting-verification', 'paid', 'refunded');
create type image_view      as enum ('front', 'back', 'side', 'detail', 'label', 'wear');

-- ---------- catalogue ----------
create table categories (
  id          text primary key,             -- 'shoes', 'jackets' …
  label       text not null,
  blurb       text,
  sort_order  int  not null default 0
);

create table brands (
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique
);

create table products (
  id              uuid primary key default gen_random_uuid(),
  sku             text not null unique,
  slug            text not null unique,      -- e.g. nike-air-max-trainers-black-size-9
  name            text not null,
  brand_id        uuid not null references brands(id),
  category_id     text not null references categories(id),
  gender          gender_t not null,
  type            text not null,
  size            text not null,
  color           text not null,
  color_hex       text,
  condition       condition_grade not null,
  price           integer not null check (price >= 0),        -- PKR, whole rupees
  original_price  integer check (original_price is null or original_price >= price),
  description     text not null,
  condition_notes text[] not null default '{}',
  wear_note       text,
  measurements    jsonb not null default '[]',                -- [{label, value}]
  material        text,
  authenticity_checked boolean not null default false,
  authenticity_note    text,
  stock           integer not null default 1 check (stock >= 0), -- one-of-one by default
  status          product_status not null default 'draft',
  popularity      integer not null default 0,
  keywords        text[] not null default '{}',
  added_at        timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
create index products_listing_idx on products (status, category_id, gender, added_at desc);
create index products_search_idx  on products using gin (to_tsvector('simple', name || ' ' || coalesce(description, '') || ' ' || array_to_string(keywords, ' ')));

create table product_images (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  view        image_view not null,
  url         text not null,                 -- Supabase Storage public URL
  alt         text not null,
  caption     text,
  sort_order  int not null default 0
);
create index product_images_product_idx on product_images (product_id, sort_order);

-- ---------- merchandising ----------
create table featured_products (
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid not null references products(id) on delete cascade,
  placement   text not null check (placement in ('hero', 'trending', 'new-arrivals', 'department-men', 'department-women', 'department-kids')),
  sort_order  int not null default 0,
  unique (product_id, placement)
);

create table banners (
  id          uuid primary key default gen_random_uuid(),
  placement   text not null,
  title       text not null,
  subtitle    text,
  image_url   text,
  href        text,
  active      boolean not null default true,
  starts_at   timestamptz,
  ends_at     timestamptz
);

create table coupons (
  code          text primary key,
  type          text not null check (type in ('percent', 'fixed', 'shipping')),
  value         integer not null default 0,
  min_subtotal  integer not null default 0,
  description   text,
  active        boolean not null default true,
  expires_at    timestamptz,
  max_uses      integer,
  used_count    integer not null default 0
);

-- ---------- customers & orders ----------
create table customers (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text not null,
  phone      text,
  created_at timestamptz not null default now()
);

create table addresses (
  id           uuid primary key default gen_random_uuid(),
  customer_id  uuid not null references customers(id) on delete cascade,
  label        text not null default 'Home',
  full_name    text not null,
  phone        text not null,
  address      text not null,
  city         text not null,
  province     text not null,
  postal_code  text not null
);

create table orders (
  id               text primary key,                 -- 'BW-XXXXXX'
  customer_id      uuid references customers(id),    -- null for guest checkout
  placed_at        timestamptz not null default now(),
  status           order_status not null default 'placed',
  payment_method   payment_method not null,
  payment_status   payment_status not null default 'pending',
  delivery_method  text not null,
  contact_name     text not null,
  contact_email    text not null,
  contact_phone    text not null,
  ship_name        text not null,
  ship_phone       text not null,
  ship_address     text not null,
  ship_city        text not null,
  ship_province    text not null,
  ship_postal_code text not null,
  promo_code       text references coupons(code),
  subtotal         integer not null,
  discount         integer not null default 0,
  delivery_fee     integer not null default 0,
  total            integer not null,
  notes            text
);
create index orders_customer_idx on orders (customer_id, placed_at desc);
create index orders_lookup_idx   on orders (lower(contact_email));

create table order_items (
  id          uuid primary key default gen_random_uuid(),
  order_id    text not null references orders(id) on delete cascade,
  product_id  uuid not null references products(id),
  name        text not null,         -- snapshot at purchase time
  brand       text not null,
  size        text not null,
  color       text not null,
  condition   condition_grade not null,
  price       integer not null,
  qty         integer not null default 1 check (qty > 0)
);

create table order_events (           -- powers the tracking timeline
  id          uuid primary key default gen_random_uuid(),
  order_id    text not null references orders(id) on delete cascade,
  status      order_status not null,
  note        text,
  created_at  timestamptz not null default now()
);

create table wishlists (
  customer_id uuid not null references customers(id) on delete cascade,
  product_id  uuid not null references products(id) on delete cascade,
  added_at    timestamptz not null default now(),
  primary key (customer_id, product_id)
);

-- ---------- inbound forms ----------
create table contact_messages (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  email       text not null,
  phone       text,
  subject     text not null,
  message     text not null check (char_length(message) <= 2000),
  product_sku text,
  created_at  timestamptz not null default now(),
  handled     boolean not null default false
);

create table newsletter_subscribers (
  email       text primary key,
  subscribed_at timestamptz not null default now(),
  active      boolean not null default true
);

create table reviews (               -- only verified buyers; moderated
  id          uuid primary key default gen_random_uuid(),
  product_id  uuid references products(id) on delete set null,
  order_id    text references orders(id),
  author_name text not null,
  rating      int not null check (rating between 1 and 5),
  body        text not null,
  approved    boolean not null default false,
  created_at  timestamptz not null default now()
);

-- =====================================================================
-- ATOMIC ORDER PLACEMENT
-- Decrements stock and creates the order in ONE transaction so two shoppers
-- can never buy the same one-of-one piece. Call from a server action / edge
-- function:  supabase.rpc('place_order', { payload })
-- =====================================================================
create or replace function place_order(payload jsonb)
returns text
language plpgsql
security definer
set search_path = public
as $$
declare
  v_order_id text := 'BW-' || upper(substr(md5(random()::text || clock_timestamp()::text), 1, 6));
  v_item     jsonb;
  v_product  products%rowtype;
  v_subtotal integer := 0;
begin
  for v_item in select * from jsonb_array_elements(payload->'items') loop
    -- lock the row so concurrent checkouts serialise
    select * into v_product from products
      where id = (v_item->>'product_id')::uuid and status = 'active' for update;
    if not found or v_product.stock < (v_item->>'qty')::int then
      raise exception 'OUT_OF_STOCK:%', v_item->>'product_id';
    end if;
    update products set stock = stock - (v_item->>'qty')::int, updated_at = now() where id = v_product.id;
    v_subtotal := v_subtotal + v_product.price * (v_item->>'qty')::int;
  end loop;

  -- NOTE: recompute discount / delivery fee here from `coupons` + delivery rules.
  -- Never trust totals sent by the browser.
  insert into orders (id, customer_id, payment_method, payment_status, delivery_method,
    contact_name, contact_email, contact_phone, ship_name, ship_phone, ship_address, ship_city, ship_province, ship_postal_code,
    promo_code, subtotal, discount, delivery_fee, total)
  values (v_order_id, nullif(payload->>'customer_id','')::uuid, (payload->>'payment_method')::payment_method,
    coalesce((payload->>'payment_status')::payment_status, 'pending'), payload->>'delivery_method',
    payload#>>'{customer,fullName}', payload#>>'{customer,email}', payload#>>'{customer,phone}',
    payload#>>'{shipping,fullName}', payload#>>'{shipping,phone}', payload#>>'{shipping,address}',
    payload#>>'{shipping,city}', payload#>>'{shipping,province}', payload#>>'{shipping,postalCode}',
    nullif(payload->>'promo_code',''), v_subtotal,
    coalesce((payload->>'discount')::int, 0), coalesce((payload->>'delivery_fee')::int, 0),
    v_subtotal - coalesce((payload->>'discount')::int, 0) + coalesce((payload->>'delivery_fee')::int, 0));

  insert into order_items (order_id, product_id, name, brand, size, color, condition, price, qty)
  select v_order_id, p.id, p.name, b.name, p.size, p.color, p.condition, p.price, (i->>'qty')::int
  from jsonb_array_elements(payload->'items') i
  join products p on p.id = (i->>'product_id')::uuid
  join brands b on b.id = p.brand_id;

  insert into order_events (order_id, status, note) values (v_order_id, 'placed', 'Order received');
  return v_order_id;
end;
$$;

-- Public, privacy-safe order tracking: needs order id + matching email/phone digits.
create or replace function track_order(p_id text, p_contact text)
returns table (id text, status order_status, placed_at timestamptz, events jsonb)
language sql
security definer
set search_path = public
as $$
  select o.id, o.status, o.placed_at,
         coalesce((select jsonb_agg(jsonb_build_object('status', e.status, 'at', e.created_at, 'note', e.note) order by e.created_at)
                   from order_events e where e.order_id = o.id), '[]'::jsonb)
  from orders o
  where upper(o.id) = upper(p_id)
    and (lower(o.contact_email) = lower(p_contact)
         or right(regexp_replace(o.contact_phone, '\D', '', 'g'), 7) = right(regexp_replace(p_contact, '\D', '', 'g'), 7));
$$;

-- =====================================================================
-- ROW LEVEL SECURITY
-- =====================================================================
alter table categories             enable row level security;
alter table brands                 enable row level security;
alter table products               enable row level security;
alter table product_images         enable row level security;
alter table featured_products      enable row level security;
alter table banners                enable row level security;
alter table coupons                enable row level security;
alter table customers              enable row level security;
alter table addresses              enable row level security;
alter table orders                 enable row level security;
alter table order_items            enable row level security;
alter table order_events           enable row level security;
alter table wishlists              enable row level security;
alter table contact_messages       enable row level security;
alter table newsletter_subscribers enable row level security;
alter table reviews                enable row level security;

-- helper: admins are users whose JWT app_metadata.role = 'admin' (set via the dashboard, never client-side)
create or replace function is_admin() returns boolean language sql stable as
$$ select coalesce(auth.jwt() -> 'app_metadata' ->> 'role', '') = 'admin' $$;

-- public read of the storefront catalogue
create policy "public read categories" on categories for select using (true);
create policy "public read brands"     on brands     for select using (true);
create policy "public read active products" on products for select using (status = 'active');
create policy "public read images of active products" on product_images for select
  using (exists (select 1 from products p where p.id = product_id and p.status = 'active'));
create policy "public read featured"   on featured_products for select using (true);
create policy "public read active banners" on banners for select using (active);
create policy "public read approved reviews" on reviews for select using (approved);

-- customers manage only their own data
create policy "own profile"   on customers for all using (id = auth.uid()) with check (id = auth.uid());
create policy "own addresses" on addresses for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "own wishlist"  on wishlists for all using (customer_id = auth.uid()) with check (customer_id = auth.uid());
create policy "own orders"        on orders       for select using (customer_id = auth.uid());
create policy "own order items"   on order_items  for select using (exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid()));
create policy "own order events"  on order_events for select using (exists (select 1 from orders o where o.id = order_id and o.customer_id = auth.uid()));

-- anonymous visitors may only INSERT into inbound forms (no reads)
create policy "anyone can send a message" on contact_messages for insert with check (true);
create policy "anyone can subscribe"      on newsletter_subscribers for insert with check (true);

-- admins can do everything (admin panel)
do $$
declare t text;
begin
  foreach t in array array['categories','brands','products','product_images','featured_products','banners','coupons','customers','addresses','orders','order_items','order_events','wishlists','contact_messages','newsletter_subscribers','reviews']
  loop
    execute format('create policy "admin all %1$s" on %1$I for all using (is_admin()) with check (is_admin())', t);
  end loop;
end $$;

-- Orders are created ONLY through place_order(); tracking ONLY through track_order().
revoke insert, update, delete on orders, order_items, order_events from anon, authenticated;
grant execute on function place_order(jsonb) to anon, authenticated;
grant execute on function track_order(text, text) to anon, authenticated;

-- Storage: create a public bucket named "product-images" in the dashboard;
-- allow uploads only for admins (policy: is_admin()).
