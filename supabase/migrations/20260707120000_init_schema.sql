-- Tervana initial schema
-- Tables, relationships, indexes, triggers, and RLS policies.
-- Reference data (terpenes/cannabinoids) is seeded in a separate migration
-- once the seed values have been reviewed.

create extension if not exists pgcrypto;

-- ============================================================================
-- Helper: updated_at trigger
-- ============================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ============================================================================
-- profiles — extends auth.users
-- Supabase convention: auth.users is owned by the auth schema, so app-level
-- profile fields live in public.profiles (id = auth.users.id), not a table
-- literally named "users".
-- ============================================================================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  role text not null default 'user' check (role in ('user', 'admin')),
  -- Monetization hook: consumer subscription tier (future paywalled content).
  subscription_tier text not null default 'free' check (subscription_tier in ('free', 'plus')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'App-level profile data for each auth.users row.';

create trigger set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Auto-create a profile row whenever a new auth user signs up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Admin check used by RLS policies. security definer avoids RLS recursion
-- when a policy on `profiles` itself needs to know if the caller is an admin.
create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- ============================================================================
-- brands
-- ============================================================================
create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  logo_url text,
  website text,
  -- Monetization hook: sponsored brand / terpene education placement.
  is_sponsored boolean not null default false,
  sponsorship_tier text not null default 'none' check (sponsorship_tier in ('none', 'featured', 'premium')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.brands
  for each row execute function public.set_updated_at();

-- ============================================================================
-- dispensaries
-- ============================================================================
create table public.dispensaries (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  license_number text not null unique,
  address text,
  region text,
  website text,
  -- Monetization hook: licensed white-label lookup pages for a dispensary.
  is_white_label_partner boolean not null default false,
  -- Reserved for a future dispensary-owner portal; not used by the app yet.
  owner_user_id uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger set_updated_at
  before update on public.dispensaries
  for each row execute function public.set_updated_at();

-- ============================================================================
-- products
-- ============================================================================
create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  brand_id uuid references public.brands (id) on delete set null,
  dispensary_id uuid references public.dispensaries (id) on delete set null,
  category text not null check (
    category in ('flower', 'pre_roll', 'vape', 'concentrate', 'edible', 'tincture', 'topical', 'other')
  ),
  strain_type text check (strain_type in ('sativa', 'indica', 'hybrid')),
  -- The retailId parsed from the scanned Metrc/1a4 QR code, e.g.
  -- "1a4120300000c1f000005534" from https://app.1a4.com/landingpage/{retailId}/{index}.
  metrc_reference text not null unique,
  description text,
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on column public.products.metrc_reference is
  'retailId segment parsed from the scanned 1a4.com QR URL. Looked up directly -- see /scan route.';

create index products_brand_id_idx on public.products (brand_id);
create index products_dispensary_id_idx on public.products (dispensary_id);

create trigger set_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- ============================================================================
-- terpenes (reference table)
-- ============================================================================
create table public.terpenes (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  aroma_profile text[] not null default '{}',
  reported_effects text[] not null default '{}',
  boiling_point_c numeric(6, 2),
  also_found_in text[] not null default '{}',
  description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.terpenes is 'Reference/educational data, not product-specific.';
comment on column public.terpenes.reported_effects is
  'Commonly-cited, non-clinical effect associations for consumer education -- not medical claims.';

create trigger set_updated_at
  before update on public.terpenes
  for each row execute function public.set_updated_at();

-- ============================================================================
-- cannabinoids (reference table)
-- ============================================================================
create table public.cannabinoids (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  abbreviation text not null unique,
  slug text not null unique,
  description text,
  reported_effects text[] not null default '{}',
  is_psychoactive boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.cannabinoids is 'Reference/educational data, not product-specific.';

create trigger set_updated_at
  before update on public.cannabinoids
  for each row execute function public.set_updated_at();

-- ============================================================================
-- product_terpene_profile (join table)
-- ============================================================================
create table public.product_terpene_profile (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  terpene_id uuid not null references public.terpenes (id) on delete restrict,
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  created_at timestamptz not null default now(),
  unique (product_id, terpene_id)
);

-- No separate product_id index: the unique (product_id, terpene_id) constraint
-- above already covers product_id-only lookups via the leftmost-prefix rule.
create index product_terpene_profile_terpene_id_idx on public.product_terpene_profile (terpene_id);

-- ============================================================================
-- product_cannabinoid_profile (join table)
-- ============================================================================
create table public.product_cannabinoid_profile (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  cannabinoid_id uuid not null references public.cannabinoids (id) on delete restrict,
  percentage numeric(5, 2) not null check (percentage >= 0 and percentage <= 100),
  created_at timestamptz not null default now(),
  unique (product_id, cannabinoid_id)
);

-- No separate product_id index: the unique (product_id, cannabinoid_id) constraint
-- above already covers product_id-only lookups via the leftmost-prefix rule.
create index product_cannabinoid_profile_cannabinoid_id_idx on public.product_cannabinoid_profile (cannabinoid_id);

-- ============================================================================
-- lab_results
-- ============================================================================
create table public.lab_results (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  lab_name text not null,
  test_date date,
  coa_url text,
  -- Monetization hook: verified lab partner badge shown on the product page.
  is_verified_partner boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index lab_results_product_id_idx on public.lab_results (product_id);

create trigger set_updated_at
  before update on public.lab_results
  for each row execute function public.set_updated_at();

-- ============================================================================
-- scans — scan-to-lookup analytics, including misses
-- ============================================================================
create table public.scans (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  product_id uuid references public.products (id) on delete set null,
  -- Raw retailId as scanned, kept even on a miss so we know what to add next.
  metrc_reference_scanned text not null,
  found boolean not null default false,
  source text not null default 'qr_scan' check (source in ('qr_scan', 'manual_search', 'admin_preview')),
  scanned_at timestamptz not null default now()
);

comment on table public.scans is
  'One row per scan-to-lookup attempt. product_id is null on a miss; metrc_reference_scanned is always populated so misses are actionable.';

create index scans_product_id_idx on public.scans (product_id);
create index scans_user_id_idx on public.scans (user_id);
create index scans_metrc_reference_scanned_idx on public.scans (metrc_reference_scanned);
create index scans_found_idx on public.scans (found) where found = false;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.brands enable row level security;
alter table public.dispensaries enable row level security;
alter table public.products enable row level security;
alter table public.terpenes enable row level security;
alter table public.cannabinoids enable row level security;
alter table public.product_terpene_profile enable row level security;
alter table public.product_cannabinoid_profile enable row level security;
alter table public.lab_results enable row level security;
alter table public.scans enable row level security;

-- ---- profiles ----
create policy "profiles_select_own_or_admin" on public.profiles
  for select
  to authenticated
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own" on public.profiles
  for update
  to authenticated
  using (auth.uid() = id)
  with check (
    auth.uid() = id
    and role = (select p.role from public.profiles p where p.id = auth.uid())
    and subscription_tier = (select p.subscription_tier from public.profiles p where p.id = auth.uid())
  );

create policy "profiles_admin_all" on public.profiles
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- public reference / catalog data: readable by anyone, writable by admins ----
create policy "brands_public_read" on public.brands
  for select
  to anon, authenticated
  using (true);

create policy "brands_admin_write" on public.brands
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "dispensaries_public_read" on public.dispensaries
  for select
  to anon, authenticated
  using (true);

create policy "dispensaries_admin_write" on public.dispensaries
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "products_public_read" on public.products
  for select
  to anon, authenticated
  using (true);

create policy "products_admin_write" on public.products
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "terpenes_public_read" on public.terpenes
  for select
  to anon, authenticated
  using (true);

create policy "terpenes_admin_write" on public.terpenes
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "cannabinoids_public_read" on public.cannabinoids
  for select
  to anon, authenticated
  using (true);

create policy "cannabinoids_admin_write" on public.cannabinoids
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_terpene_profile_public_read" on public.product_terpene_profile
  for select
  to anon, authenticated
  using (true);

create policy "product_terpene_profile_admin_write" on public.product_terpene_profile
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "product_cannabinoid_profile_public_read" on public.product_cannabinoid_profile
  for select
  to anon, authenticated
  using (true);

create policy "product_cannabinoid_profile_admin_write" on public.product_cannabinoid_profile
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "lab_results_public_read" on public.lab_results
  for select
  to anon, authenticated
  using (true);

create policy "lab_results_admin_write" on public.lab_results
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- ---- scans: anyone can log a scan (including anon), reads are limited ----
create policy "scans_insert_anyone" on public.scans
  for insert
  to anon, authenticated
  with check (user_id is null or user_id = auth.uid());

create policy "scans_select_own_or_admin" on public.scans
  for select
  to authenticated
  using (auth.uid() = user_id or public.is_admin());

create policy "scans_admin_write" on public.scans
  for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());
