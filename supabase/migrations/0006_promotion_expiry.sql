-- Buysellox.com — expiry for promotions (§6). Called as a check-on-read RPC from
-- the listing read paths (lib/promotions.ts#expireStalePromotions) since this
-- project has no scheduled job runner.

create function public.expire_promotions()
returns void
language sql
security definer set search_path = public
as $$
  update public.listings
  set badge = null, promotion_rank = 0, is_featured = false, promoted_until = null
  where promoted_until is not null and promoted_until < now();
$$;

grant execute on function public.expire_promotions() to anon, authenticated;
