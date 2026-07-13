-- OneBazaar — initial schema (§7 of OneBazaar-Spec.md)
-- Run in the Supabase SQL editor, or via `supabase db push` once the project is linked.

create extension if not exists "pgcrypto";

-- ─────────────────────────────────────────────────────────────────────────
-- profiles
-- ─────────────────────────────────────────────────────────────────────────
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text,
  phone text,
  avatar_url text,
  city text,
  is_verified boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- The base table (which holds `phone`) is NOT publicly readable — phone stays
-- hidden until a logged-in buyer taps "Show number" (§11), which goes through
-- the get_seller_phone() function below instead of a direct table read.
create policy "Users can view own full profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- Auto-create a profile row when a new auth user signs up.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, city)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city'
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Public, phone-free view of a profile — used for seller cards, listing
-- authorship, etc. Anyone can read this even though the base table is locked
-- down to the owner.
create view public.profiles_public as
  select id, full_name, avatar_url, city, is_verified, created_at
  from public.profiles;

grant select on public.profiles_public to anon, authenticated;

-- Returns a seller's phone number only to logged-in callers, and only for a
-- listing that actually belongs to that seller. This is the sole path the
-- "Show number" button (§11) uses, so phone numbers can't be scraped by
-- querying public.profiles directly with the anon key.
create function public.get_seller_phone(p_listing_id uuid)
returns text
language plpgsql
security definer set search_path = public
as $$
declare
  v_phone text;
begin
  if auth.uid() is null then
    return null;
  end if;

  select p.phone into v_phone
  from public.listings l
  join public.profiles p on p.id = l.user_id
  where l.id = p_listing_id;

  return v_phone;
end;
$$;

grant execute on function public.get_seller_phone(uuid) to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- listings
-- ─────────────────────────────────────────────────────────────────────────
create table public.listings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text not null default '',
  price numeric not null default 0,
  currency text not null default 'PKR',
  category text not null,
  category_slug text not null,
  subcategory text,
  condition text check (condition in ('new', 'used')),
  attributes jsonb not null default '{}'::jsonb,
  city text not null,
  city_slug text not null,
  area text,
  images text[] not null default '{}',
  status text not null default 'active' check (status in ('active', 'sold', 'pending', 'expired')),
  badge text check (badge in ('featured', 'urgent', 'top')),
  promotion_rank int not null default 0,
  promoted_until timestamptz,
  bumped_at timestamptz,
  is_featured boolean not null default false,
  views_count int not null default 0,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '30 days')
);

create index listings_category_city_idx on public.listings (category_slug, city_slug, status);
create index listings_ranking_idx on public.listings (status, promotion_rank desc, bumped_at desc, created_at desc);
create index listings_user_idx on public.listings (user_id);

alter table public.listings enable row level security;

create policy "Active listings are publicly readable"
  on public.listings for select
  using (status = 'active' or auth.uid() = user_id);

create policy "Users can insert own listings"
  on public.listings for insert
  with check (auth.uid() = user_id);

create policy "Users can update own listings"
  on public.listings for update
  using (auth.uid() = user_id);

create policy "Users can delete own listings"
  on public.listings for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- packages (admin-editable promotion products)
-- ─────────────────────────────────────────────────────────────────────────
create table public.packages (
  id uuid primary key default gen_random_uuid(),
  key text not null check (key in ('featured', 'urgent', 'top', 'bump')),
  name text not null,
  badge text check (badge in ('featured', 'urgent', 'top')),
  promotion_rank int not null default 0,
  duration_days int not null default 0,
  price numeric not null,
  is_active boolean not null default true
);

alter table public.packages enable row level security;

create policy "Active packages are publicly readable"
  on public.packages for select
  using (is_active = true);

-- ─────────────────────────────────────────────────────────────────────────
-- ad_promotions
-- ─────────────────────────────────────────────────────────────────────────
create table public.ad_promotions (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  user_id uuid not null references public.profiles (id) on delete cascade,
  package_id uuid not null references public.packages (id),
  starts_at timestamptz not null default now(),
  expires_at timestamptz not null,
  amount numeric not null,
  payment_method text not null check (payment_method in ('jazzcash', 'easypaisa', 'card', 'mock')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  payment_ref text,
  created_at timestamptz not null default now()
);

alter table public.ad_promotions enable row level security;

create policy "Users can view own promotions"
  on public.ad_promotions for select
  using (auth.uid() = user_id);

create policy "Users can create own promotions"
  on public.ad_promotions for insert
  with check (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- favorites
-- ─────────────────────────────────────────────────────────────────────────
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  listing_id uuid not null references public.listings (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, listing_id)
);

alter table public.favorites enable row level security;

create policy "Users can view own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "Users can manage own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- conversations
-- ─────────────────────────────────────────────────────────────────────────
create table public.conversations (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (listing_id, buyer_id)
);

alter table public.conversations enable row level security;

create policy "Participants can view own conversations"
  on public.conversations for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "Buyers can start conversations"
  on public.conversations for insert
  with check (auth.uid() = buyer_id);

-- ─────────────────────────────────────────────────────────────────────────
-- messages
-- ─────────────────────────────────────────────────────────────────────────
create table public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.conversations (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  read_at timestamptz
);

create index messages_conversation_idx on public.messages (conversation_id, created_at);

alter table public.messages enable row level security;

create policy "Participants can view messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- ─────────────────────────────────────────────────────────────────────────
-- reports
-- ─────────────────────────────────────────────────────────────────────────
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  listing_id uuid not null references public.listings (id) on delete cascade,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  reason text not null check (reason in ('spam', 'scam', 'prohibited', 'other')),
  details text,
  status text not null default 'open' check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

alter table public.reports enable row level security;

create policy "Users can view own reports"
  on public.reports for select
  using (auth.uid() = reporter_id);

create policy "Users can create reports"
  on public.reports for insert
  with check (auth.uid() = reporter_id);

-- ─────────────────────────────────────────────────────────────────────────
-- admin override policies (role = 'admin' bypasses ownership checks)
-- ─────────────────────────────────────────────────────────────────────────
create function public.is_admin()
returns boolean
language sql
security definer set search_path = public
as $$
  select exists (
    select 1 from public.profiles where id = auth.uid() and role = 'admin'
  );
$$;

create policy "Admins can update any listing"
  on public.listings for update
  using (public.is_admin());

create policy "Admins can delete any listing"
  on public.listings for delete
  using (public.is_admin());

create policy "Admins can manage packages"
  on public.packages for all
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can view all reports"
  on public.reports for select
  using (public.is_admin());

create policy "Admins can update reports"
  on public.reports for update
  using (public.is_admin());
