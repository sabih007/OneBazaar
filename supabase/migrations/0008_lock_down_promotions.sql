-- Close the free-promotion bypass (§6). Two independent holes let an
-- authenticated user grant themselves a paid promotion for free using only
-- the anon-key browser client, with no gateway involved:
--
--   1. `listings` had no column-level guard on UPDATE, so a user could set
--      badge/promotion_rank/promoted_until/is_featured on their own row directly.
--   2. `ad_promotions` allowed a user to UPDATE their own row (migration 0007,
--      needed so the Safepay callback could flip pending -> paid), which also
--      let a user flip it themselves without ever paying.
--
-- Fix: a trigger backstops the promotion columns on `listings` regardless of
-- RLS, and `ad_promotions` no longer allows client-side updates at all — only
-- the service-role client (lib/supabase/admin.ts) can confirm a payment now.

-- ─────────────────────────────────────────────────────────────────────────
-- listings: protect promotion-derived columns from direct client writes
-- ─────────────────────────────────────────────────────────────────────────
create function public.protect_listing_promotion_columns()
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
  end if;
  return new;
end;
$$;

create trigger protect_listing_promotion_columns
  before update on public.listings
  for each row execute procedure public.protect_listing_promotion_columns();

-- ─────────────────────────────────────────────────────────────────────────
-- ad_promotions: only the service role may confirm/fail a payment now
-- ─────────────────────────────────────────────────────────────────────────
drop policy if exists "Users can update own promotions" on public.ad_promotions;

drop policy if exists "Users can create own promotions" on public.ad_promotions;

create policy "Users can create own pending promotions"
  on public.ad_promotions for insert
  with check (auth.uid() = user_id and payment_status = 'pending');

-- Drop the mock payment method — real Safepay card payments are live, and the
-- mock path was the easiest way to trigger the bypass above (client-callable,
-- settled instantly with no verification). `not valid` so any historical rows
-- with payment_method = 'mock' (from dev testing) don't block the migration —
-- only new inserts are checked against it.
alter table public.ad_promotions drop constraint ad_promotions_payment_method_check;
alter table public.ad_promotions
  add constraint ad_promotions_payment_method_check
  check (payment_method in ('jazzcash', 'easypaisa', 'card')) not valid;
