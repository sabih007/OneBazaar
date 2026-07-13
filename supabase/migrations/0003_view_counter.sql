-- Lets any visitor (including guests) bump a listing's view count without
-- granting public UPDATE access to the whole `listings` row (§11).

create function public.increment_listing_views(p_listing_id uuid)
returns void
language sql
security definer set search_path = public
as $$
  update public.listings set views_count = views_count + 1 where id = p_listing_id;
$$;

grant execute on function public.increment_listing_views(uuid) to anon, authenticated;
