-- Free-tier limits for individual sellers (marketplace-packages-pakistan.md §1):
-- max 5 active ads at a time, 30-day listing life (already the insert default,
-- just never enforced), and 1 free refresh per ad.

-- ─────────────────────────────────────────────────────────────────────────
-- free_refresh_used_at: null until the seller uses their one free bump.
-- Guarded by the same server-role-only trigger as the other promotion-
-- derived columns (0008_lock_down_promotions.sql) so a user can't reset
-- their own eligibility via a direct client update.
-- ─────────────────────────────────────────────────────────────────────────
alter table public.listings add column free_refresh_used_at timestamptz;

create or replace function public.protect_listing_promotion_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.badge := old.badge;
    new.promotion_rank := old.promotion_rank;
    new.promoted_until := old.promoted_until;
    new.is_featured := old.is_featured;
    new.bumped_at := old.bumped_at;
    new.free_refresh_used_at := old.free_refresh_used_at;
  end if;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- expire_listings: check-on-read expiry, same pattern as expire_promotions
-- (0006_promotion_expiry.sql) since this project has no scheduled job runner.
-- Called from lib/listings-server.ts on the same read paths.
-- ─────────────────────────────────────────────────────────────────────────
create function public.expire_listings()
returns void
language sql
security definer set search_path = public
as $$
  update public.listings
  set status = 'expired'
  where status = 'active' and expires_at < now();
$$;

grant execute on function public.expire_listings() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- enforce_active_listing_limit: caps a user at 5 active listings. Fires only
-- when a row is newly becoming active (a fresh post, or a repost bringing an
-- expired listing back) — not on every edit of an already-active listing,
-- which would otherwise always see its own row pushing the count to the
-- limit. Service-role writes (admin tooling) are exempt, same as every
-- other trigger here.
-- ─────────────────────────────────────────────────────────────────────────
create function public.enforce_active_listing_limit()
returns trigger
language plpgsql
as $$
declare
  active_count int;
  becoming_active boolean;
begin
  if auth.role() = 'service_role' then
    return new;
  end if;

  becoming_active := new.status = 'active'
    and (TG_OP = 'INSERT' or old.status is distinct from 'active');

  if not becoming_active then
    return new;
  end if;

  select count(*) into active_count
  from public.listings
  where user_id = new.user_id and status = 'active' and id <> new.id;

  if active_count >= 5 then
    raise exception 'Free accounts can have up to 5 active ads at a time. Delete or mark one as sold to post a new one.';
  end if;

  return new;
end;
$$;

create trigger enforce_active_listing_limit
  before insert or update on public.listings
  for each row execute procedure public.enforce_active_listing_limit();
