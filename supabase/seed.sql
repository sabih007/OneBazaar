-- Buysellox.com — seed data for the packages store (§6). Cities and categories are
-- kept as static config in lib/cities.ts and lib/categories.ts, not DB tables.
--
-- Boost lineup per marketplace-packages-pakistan.md §2. "Refresh" is priced
-- at 149, not the doc's 99 — Lemon Squeezy enforces a minimum checkout
-- amount (~PKR 139, drifts with FX) confirmed against the live API.

insert into public.packages (key, name, badge, promotion_rank, duration_days, price, credits, is_active) values
  ('super_hot', 'Super Hot', 'super_hot', 60, 30, 9999, 1, true),
  ('hot', 'Hot', 'hot', 40, 15, 2999, 1, true),
  ('featured', 'Featured', 'featured', 20, 7, 1499, 1, true),
  ('bump', 'Refresh', null, 0, 0, 149, 1, true),
  ('bump', 'Bump bundle (10 credits)', null, 0, 0, 799, 10, true);
