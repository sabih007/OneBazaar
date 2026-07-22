-- Saved-search alerts (audit: replaces the generic newsletter with something
-- that actually drives return visits — "notify me when a Corolla under 25
-- lakh is posted in Lahore"). Matching happens at listing-creation time
-- (app/api/listings/notify-saved-searches), not a polling job, so there's no
-- "already notified" state to track here.

create table public.saved_searches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  email text not null,
  category_slug text not null,
  city_slug text not null,
  subcategory_slug text,
  condition text check (condition in ('new', 'used')),
  min_price numeric,
  max_price numeric,
  created_at timestamptz not null default now()
);

create index saved_searches_category_city_idx on public.saved_searches (category_slug, city_slug);

alter table public.saved_searches enable row level security;

create policy "Users can view own saved searches"
  on public.saved_searches for select
  using (auth.uid() = user_id);

create policy "Users can create own saved searches"
  on public.saved_searches for insert
  with check (auth.uid() = user_id);

create policy "Users can delete own saved searches"
  on public.saved_searches for delete
  using (auth.uid() = user_id);
