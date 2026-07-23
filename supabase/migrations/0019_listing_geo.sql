-- "Near me first" listings — city-level lat/lng on listings plus a
-- distance-ordered RPC. There's no true per-listing GPS capture yet (posting
-- a listing still only asks for city/area), so coordinates are derived from
-- city_slug via the same table as lib/cities.ts. Distance is real great-circle
-- km via earthdistance, not a coarse same-city/other-city bucket.

create extension if not exists "cube";
create extension if not exists "earthdistance";

alter table public.listings add column lat double precision;
alter table public.listings add column lng double precision;

-- Mirrors lib/cities.ts — keep the two in sync if a city is added/removed.
create function public.set_listing_geo()
returns trigger
language plpgsql
as $$
begin
  new.lat := case new.city_slug
    when 'karachi' then 24.8607
    when 'lahore' then 31.5497
    when 'islamabad' then 33.6844
    when 'rawalpindi' then 33.5651
    when 'faisalabad' then 31.4504
    when 'multan' then 30.1575
    when 'gujranwala' then 32.1877
    when 'peshawar' then 34.0151
    when 'quetta' then 30.1798
    when 'sialkot' then 32.4945
    when 'bahawalpur' then 29.3956
    when 'sargodha' then 32.0836
    when 'hyderabad' then 25.396
    when 'sukkur' then 27.7052
    when 'abbottabad' then 34.1688
    when 'sahiwal' then 30.6682
    when 'rahim-yar-khan' then 28.4212
    when 'sheikhupura' then 31.7131
    when 'gujrat' then 32.5738
    when 'mardan' then 34.1989
    else null
  end;
  new.lng := case new.city_slug
    when 'karachi' then 67.0011
    when 'lahore' then 74.3436
    when 'islamabad' then 73.0479
    when 'rawalpindi' then 73.0169
    when 'faisalabad' then 73.135
    when 'multan' then 71.5249
    when 'gujranwala' then 74.1945
    when 'peshawar' then 71.5249
    when 'quetta' then 66.975
    when 'sialkot' then 74.5229
    when 'bahawalpur' then 71.6836
    when 'sargodha' then 72.6711
    when 'hyderabad' then 68.3578
    when 'sukkur' then 68.8574
    when 'abbottabad' then 73.2215
    when 'sahiwal' then 73.1114
    when 'rahim-yar-khan' then 70.2989
    when 'sheikhupura' then 73.9783
    when 'gujrat' then 74.0789
    when 'mardan' then 72.0404
    else null
  end;
  return new;
end;
$$;

create trigger listings_set_geo
  before insert or update of city_slug on public.listings
  for each row execute procedure public.set_listing_geo();

-- Backfill existing rows through the same trigger (re-sets city_slug to
-- itself purely to fire the "update of city_slug" trigger above).
update public.listings set city_slug = city_slug;

-- Read-only distance-ordered feed for cross-city pages (homepage, /search).
-- security invoker (the default) — RLS's "Active listings are publicly
-- readable" policy still applies to whichever role calls this.
create function public.listings_nearby(
  origin_lat double precision,
  origin_lng double precision,
  p_category_slug text default null,
  p_subcategory_slug text default null,
  p_condition text default null,
  p_min_price numeric default null,
  p_max_price numeric default null,
  p_query text default null,
  p_featured boolean default null,
  p_limit int default 24,
  p_offset int default 0
)
returns setof public.listings
language sql
stable
as $$
  select l.*
  from public.listings l
  where l.status = 'active'
    and l.lat is not null and l.lng is not null
    and (p_category_slug is null or l.category_slug = p_category_slug)
    and (p_subcategory_slug is null or l.subcategory = p_subcategory_slug)
    and (p_condition is null or l.condition = p_condition)
    and (p_min_price is null or l.price >= p_min_price)
    and (p_max_price is null or l.price <= p_max_price)
    and (p_query is null or l.title ilike '%' || p_query || '%')
    and (p_featured is not true or l.badge in ('featured', 'top', 'hot', 'super_hot'))
  order by earth_distance(ll_to_earth(origin_lat, origin_lng), ll_to_earth(l.lat, l.lng)) asc,
           l.promotion_rank desc,
           l.bumped_at desc nulls last,
           l.created_at desc
  limit p_limit offset p_offset;
$$;

grant execute on function public.listings_nearby(
  double precision, double precision, text, text, text, numeric, numeric, text, boolean, int, int
) to anon, authenticated;
