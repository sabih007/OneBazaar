-- Dealer/Business subscriptions (marketplace-packages-pakistan.md §3):
-- recurring billing via three fixed Lemon Squeezy subscription variants,
-- tier-aware active-listing-slot limits, and monthly Featured/Hot/Refresh
-- credit allowances. Idempotent (if-not-exists / or-replace / if-exists
-- drops throughout) per the lesson from 0013/0014.

-- ─────────────────────────────────────────────────────────────────────────
-- subscriptions: one row per user (no row = free tier). active_slot_limit
-- is denormalized from the tier at grant time (lib/subscriptions.ts is the
-- source of truth for what each tier grants) specifically so the trigger
-- below stays a plain lookup instead of re-deriving limits from `tier` in
-- SQL. No client insert/update at all — service-role (the webhook) only,
-- same lockdown posture as ad_promotions (0008).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles (id) on delete cascade,
  tier text not null check (tier in ('shop', 'dealer', 'business_pro')),
  status text not null default 'active' check (status in ('active', 'cancelled', 'expired', 'past_due')),
  ls_subscription_id text,
  active_slot_limit int not null,
  current_period_end timestamptz,
  created_at timestamptz not null default now()
);

alter table public.subscriptions enable row level security;

drop policy if exists "Users can view own subscription" on public.subscriptions;
create policy "Users can view own subscription"
  on public.subscriptions for select
  using (auth.uid() = user_id);

-- ─────────────────────────────────────────────────────────────────────────
-- subscription_credit_grants: idempotency ledger. subscription_payment_success
-- fires for both the first payment and every renewal, and Lemon Squeezy
-- delivers at-least-once — this table's unique constraint on the LS
-- event/invoice id is what stops a retried delivery from double-granting
-- credits (there's no natural pending->paid row to filter on here, unlike
-- markPromotionPaid's one-time-order idempotency).
-- ─────────────────────────────────────────────────────────────────────────
create table if not exists public.subscription_credit_grants (
  id uuid primary key default gen_random_uuid(),
  ls_event_id text not null unique,
  user_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now()
);

alter table public.subscription_credit_grants enable row level security;
-- No policies — this is an internal webhook-processing ledger, not
-- user-facing data. Service-role (webhook) only, same as subscriptions.

-- ─────────────────────────────────────────────────────────────────────────
-- profiles: two more wallet columns alongside refresh_credits (0013).
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists featured_credits int not null default 0 check (featured_credits >= 0);
alter table public.profiles add column if not exists hot_credits int not null default 0 check (hot_credits >= 0);

create or replace function public.protect_profile_credit_column()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.refresh_credits := old.refresh_credits;
    new.featured_credits := old.featured_credits;
    new.hot_credits := old.hot_credits;
  end if;
  return new;
end;
$$;

-- Trigger itself is unchanged (still fires before update on profiles) —
-- only the function body changed, already attached from 0013.

-- ─────────────────────────────────────────────────────────────────────────
-- enforce_active_listing_limit (0012): was a hardcoded `5`. Now looks up
-- the caller's active subscription's slot limit, defaulting to 5 (the free
-- tier) if there isn't one. Cancelling/expiring a subscription (status
-- flips away from 'active') reverts the seller to the free limit
-- automatically — no separate downgrade step needed.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.enforce_active_listing_limit()
returns trigger
language plpgsql
as $$
declare
  active_count int;
  becoming_active boolean;
  user_limit int;
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  becoming_active := new.status = 'active'
    and (TG_OP = 'INSERT' or old.status is distinct from 'active');

  if not becoming_active then
    return new;
  end if;

  select active_slot_limit into user_limit
  from public.subscriptions
  where user_id = new.user_id and status = 'active';

  if user_limit is null then
    user_limit := 5;
  end if;

  select count(*) into active_count
  from public.listings
  where user_id = new.user_id and status = 'active' and id <> new.id;

  if active_count >= user_limit then
    raise exception 'You''ve reached your active ad limit (%). Upgrade your plan or free up a slot.', user_limit;
  end if;

  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Credit grant/spend functions. Deliberately revoked from public/anon/
-- authenticated explicitly at the end of this file — Supabase's project
-- template grants EXECUTE on new functions to anon/authenticated by
-- default (confirmed the hard way in 0013/0014), so omitting a grant is
-- NOT the same as denying one.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.grant_subscription_credits(
  p_user_id uuid, p_featured int, p_hot int, p_refresh int
)
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles
  set featured_credits = featured_credits + p_featured,
      hot_credits = hot_credits + p_hot,
      refresh_credits = refresh_credits + p_refresh
  where id = p_user_id;
$$;

-- Wallet-only spends (unlike spend_refresh_credit, which also bumps the
-- listing directly) — actually applying a Featured/Hot badge needs the
-- rank-comparison / "don't downgrade, take the later expiry" logic that
-- already lives in lib/promotions.ts#applyPackageToListing. Duplicating
-- that in PL/pgSQL risks the two implementations drifting apart, so the
-- API route spends the credit here, then calls the existing TS function.
-- language plpgsql + `found`, not `language sql` + `returning` — a SQL
-- function whose query matches zero rows returns NULL, not false, which
-- would make "no credits available" indistinguishable from an error to
-- the caller. Mirrors spend_refresh_credit's (0013) exact pattern.
create or replace function public.spend_featured_credit_only(p_user_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set featured_credits = featured_credits - 1
  where id = p_user_id and featured_credits > 0;
  return found;
end;
$$;

create or replace function public.spend_hot_credit_only(p_user_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
begin
  update public.profiles
  set hot_credits = hot_credits - 1
  where id = p_user_id and hot_credits > 0;
  return found;
end;
$$;

revoke execute on function public.grant_subscription_credits(uuid, int, int, int) from public, anon, authenticated;
revoke execute on function public.spend_featured_credit_only(uuid) from public, anon, authenticated;
revoke execute on function public.spend_hot_credit_only(uuid) from public, anon, authenticated;
