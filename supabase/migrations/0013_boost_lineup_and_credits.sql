-- New boost lineup (marketplace-packages-pakistan.md §2): Refresh, Featured,
-- Hot, Super Hot, and a 10-credit refresh bundle. Replaces the old
-- Featured(x3)/Urgent/Top(x2)/Bump lineup from 0001_init.sql's seed.
--
-- Written idempotently (drop-if-exists-then-add, add-column-if-not-exists,
-- create-or-replace, guarded inserts) so it's safe to re-run in full if an
-- earlier attempt failed partway through.

-- ─────────────────────────────────────────────────────────────────────────
-- Widen the badge/key taxonomy. Additive, not narrowing — every existing row
-- already satisfies the wider constraint, so unlike 0008/0011 there's
-- nothing to skip-validate; a plain drop/recreate is enough. 'urgent' and
-- 'top' stay valid permanently (historical listings/packages still use
-- them) — they're just stopped from being sold further down via is_active.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.packages drop constraint if exists packages_key_check;
alter table public.packages
  add constraint packages_key_check
  check (key in ('featured', 'urgent', 'top', 'bump', 'hot', 'super_hot'));

alter table public.packages drop constraint if exists packages_badge_check;
alter table public.packages
  add constraint packages_badge_check
  check (badge in ('featured', 'urgent', 'top', 'hot', 'super_hot'));

alter table public.listings drop constraint if exists listings_badge_check;
alter table public.listings
  add constraint listings_badge_check
  check (badge in ('featured', 'urgent', 'top', 'hot', 'super_hot'));

-- ─────────────────────────────────────────────────────────────────────────
-- packages.credits: how many refresh credits a purchase grants. 1 (default)
-- means "apply immediately to the listing being promoted" (every package
-- today). >1 means "credit the buyer's wallet instead" (the new bundle) —
-- see markPromotionPaid (lib/promotions.ts), which branches on this.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.packages add column if not exists credits int not null default 1 check (credits >= 1);

-- ─────────────────────────────────────────────────────────────────────────
-- A credit-bundle purchase isn't promoting any particular listing.
-- (DROP NOT NULL on an already-nullable column is a no-op, not an error.)
-- ─────────────────────────────────────────────────────────────────────────
alter table public.ad_promotions alter column listing_id drop not null;

-- ─────────────────────────────────────────────────────────────────────────
-- profiles.refresh_credits: wallet balance for paid refreshes beyond the one
-- free refresh each listing gets (0012_free_tier_limits.sql). Same trust
-- model as the promotion-derived columns on `listings` — RLS's
-- "Users can update own profile" (0001_init.sql) has no column-level
-- guard, so without this trigger any user could grant themselves free
-- credits via a direct client update.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.profiles add column if not exists refresh_credits int not null default 0 check (refresh_credits >= 0);

create or replace function public.protect_profile_credit_column()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.refresh_credits := old.refresh_credits;
  end if;
  return new;
end;
$$;

drop trigger if exists protect_profile_credit_column on public.profiles;
create trigger protect_profile_credit_column
  before update on public.profiles
  for each row execute procedure public.protect_profile_credit_column();

-- ─────────────────────────────────────────────────────────────────────────
-- increment_refresh_credits: grants credits after a paid bundle purchase.
-- spend_refresh_credit: atomically spends one credit and bumps a listing —
-- single transaction so a crash between "deduct" and "bump" can't happen,
-- and the `where refresh_credits > 0` guard means two concurrent spends
-- can't both succeed against a balance of 1.
--
-- Deliberately NOT granted to anon/authenticated, unlike
-- increment_listing_views (which is a free-to-call view counter with no
-- monetary value). These move real money-equivalent balances and must only
-- ever be invoked via the service-role admin client — do not "fix" this
-- inconsistency by adding a grant.
-- ─────────────────────────────────────────────────────────────────────────
create or replace function public.increment_refresh_credits(p_user_id uuid, p_amount int)
returns void
language sql
security definer set search_path = public
as $$
  update public.profiles set refresh_credits = refresh_credits + p_amount where id = p_user_id;
$$;

create or replace function public.spend_refresh_credit(p_listing_id uuid, p_user_id uuid)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  spent boolean;
begin
  update public.profiles
  set refresh_credits = refresh_credits - 1
  where id = p_user_id and refresh_credits > 0;

  spent := found;

  if spent then
    update public.listings
    set bumped_at = now()
    where id = p_listing_id and user_id = p_user_id;
  end if;

  return spent;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- Catalog DML. Reprice two rows in place (preserves package_id continuity
-- for historical ad_promotions rows), soft-retire the rows the new lineup
-- drops (is_active=false, never delete — package_id is a live FK target),
-- add the three new rows (guarded so re-running this script doesn't insert
-- duplicates).
-- ─────────────────────────────────────────────────────────────────────────
-- Doc prices this at PKR 99, but Lemon Squeezy enforces a minimum checkout
-- amount (~PKR 139, drifts with FX) confirmed earlier — same issue already
-- hit and fixed for the old Bump Up package. 149 keeps real headroom.
update public.packages set name = 'Refresh', price = 149
where key = 'bump' and duration_days = 0 and credits = 1;

update public.packages set name = 'Featured', price = 1499
where key = 'featured' and duration_days = 7;

update public.packages set is_active = false
where key = 'urgent'
   or key = 'top'
   or (key = 'featured' and duration_days in (15, 30));

insert into public.packages (key, name, badge, promotion_rank, duration_days, price, credits, is_active)
select 'hot', 'Hot', 'hot', 40, 15, 2999, 1, true
where not exists (select 1 from public.packages where key = 'hot');

insert into public.packages (key, name, badge, promotion_rank, duration_days, price, credits, is_active)
select 'super_hot', 'Super Hot', 'super_hot', 60, 30, 9999, 1, true
where not exists (select 1 from public.packages where key = 'super_hot');

insert into public.packages (key, name, badge, promotion_rank, duration_days, price, credits, is_active)
select 'bump', 'Bump bundle (10 credits)', null, 0, 0, 799, 10, true
where not exists (select 1 from public.packages where key = 'bump' and credits = 10);
