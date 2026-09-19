-- ============================================================
-- asnangy. — database schema
-- Run this once against a fresh Supabase project (SQL editor
-- or `supabase db push` with this file as a migration).
-- ============================================================

create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- Enums
-- ------------------------------------------------------------
create type tooth_condition as enum ('sound', 'semi_sound', 'caries');
create type tooth_type as enum ('anterior', 'premolar', 'molar');
create type order_status as enum (
  'new', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled'
);

-- ------------------------------------------------------------
-- admin_users
-- Mirrors auth.users for admins. A row here (linked to a
-- Supabase Auth user id) is what RLS policies check for
-- write access — plain sign-up does NOT grant admin rights.
-- ------------------------------------------------------------
create table admin_users (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------
-- categories
-- Kept as a real table (rather than hardcoding the 3x3 grid)
-- so labels, ordering, and enable/disable can change from the
-- dashboard without a code deploy. condition/tooth_type enums
-- still constrain products to the flow the storefront expects.
-- ------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  condition tooth_condition not null,
  tooth_type tooth_type not null,
  label text not null,
  description text,
  sort_order int not null default 0,
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  unique (condition, tooth_type)
);

-- ------------------------------------------------------------
-- products
-- ------------------------------------------------------------
create table products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  sku text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  condition tooth_condition not null,
  tooth_type tooth_type not null,
  description text,
  notes text,
  stock_quantity int not null default 0 check (stock_quantity >= 0),
  available boolean not null default true,
  image_urls text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index products_condition_type_idx on products (condition, tooth_type);
create index products_sku_idx on products (sku);

create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_set_updated_at
  before update on products
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- shipping_zones
-- ------------------------------------------------------------
create table shipping_zones (
  id uuid primary key default gen_random_uuid(),
  governorate text not null unique,
  price numeric(10, 2) not null check (price >= 0),
  enabled boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger shipping_zones_set_updated_at
  before update on shipping_zones
  for each row execute function set_updated_at();

-- ------------------------------------------------------------
-- orders / order_items
-- Prices and SKUs are copied onto order_items at checkout time
-- so historical orders stay accurate even if a product's price
-- or SKU changes later.
-- ------------------------------------------------------------
create table orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  phone text not null,
  phone2 text,
  governorate text not null,
  address text not null,
  shipping_zone_id uuid references shipping_zones (id),
  shipping_cost numeric(10, 2) not null default 0,
  subtotal numeric(10, 2) not null default 0,
  total numeric(10, 2) not null default 0,
  status order_status not null default 'new',
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Migration for a database created before phone2 existed — safe to
-- run against a fresh install too (no-op, since the column above
-- already covers it).
alter table orders add column if not exists phone2 text;

create trigger orders_set_updated_at
  before update on orders
  for each row execute function set_updated_at();

create table order_items (
  id uuid primary key default gen_random_uuid(),
  order_id uuid not null references orders (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  sku text not null,
  unit_price numeric(10, 2) not null,
  quantity int not null check (quantity > 0),
  line_total numeric(10, 2) not null
);

create index order_items_order_id_idx on order_items (order_id);

-- ============================================================
-- Row Level Security
-- ============================================================
alter table admin_users enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table shipping_zones enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- Helper: is the current auth session an admin?
create or replace function is_admin()
returns boolean as $$
  select exists (
    select 1 from admin_users where id = auth.uid()
  );
$$ language sql stable security definer;

-- admin_users: admins can read the list; nobody else can read/write
-- (rows are inserted via the Supabase dashboard or a service-role
-- script, not through the app).
create policy "admins can read admin_users"
  on admin_users for select
  using (is_admin());

-- categories: public read of enabled rows, admin full access
create policy "public can read enabled categories"
  on categories for select
  using (enabled = true or is_admin());

create policy "admins can manage categories"
  on categories for all
  using (is_admin())
  with check (is_admin());

-- products: public read of available rows, admin full access
create policy "public can read available products"
  on products for select
  using (available = true or is_admin());

create policy "admins can manage products"
  on products for all
  using (is_admin())
  with check (is_admin());

-- shipping_zones: public read of enabled rows (needed at checkout
-- to compute shipping cost), admin full access
create policy "public can read enabled shipping zones"
  on shipping_zones for select
  using (enabled = true or is_admin());

create policy "admins can manage shipping zones"
  on shipping_zones for all
  using (is_admin())
  with check (is_admin());

-- orders: customers can create an order (checkout) and read only
-- what they just created is handled at the application layer via
-- a server action using the service role, so no public select
-- policy is needed here. Admins get full access.
create policy "admins can read orders"
  on orders for select
  using (is_admin());

create policy "admins can update orders"
  on orders for update
  using (is_admin())
  with check (is_admin());

create policy "admins can delete orders"
  on orders for delete
  using (is_admin());

create policy "admins can read order_items"
  on order_items for select
  using (is_admin());

-- Note: order + order_item INSERT at checkout, and any stock
-- decrement, are performed server-side (checkout server action)
-- using the service-role key after validating the cart against
-- current prices/stock in the database — never trusting client
-- input for price or availability. This keeps checkout working
-- for anonymous customers without opening public INSERT policies
-- on orders/order_items.

-- ------------------------------------------------------------
-- Storage: product images
-- The "products" bucket itself must still be created manually
-- (Storage → New bucket → name it "products" → Public bucket),
-- since bucket creation isn't part of a SQL migration. These
-- policies then control who can read/write objects inside it:
-- anyone can view images (needed for the public storefront),
-- only signed-in admins can upload, replace, or delete them.
-- ------------------------------------------------------------
create policy "public can view product images"
  on storage.objects for select
  using (bucket_id = 'products');

create policy "admins can upload product images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'products' and is_admin());

create policy "admins can update product images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'products' and is_admin())
  with check (bucket_id = 'products' and is_admin());

create policy "admins can delete product images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'products' and is_admin());
