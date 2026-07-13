-- OneBazaar — seed data for the packages store (§6). Cities and categories are
-- kept as static config in lib/cities.ts and lib/categories.ts, not DB tables.

insert into public.packages (key, name, badge, promotion_rank, duration_days, price, is_active) values
  ('featured', 'Featured (7 days)', 'featured', 20, 7, 500, true),
  ('featured', 'Featured (15 days)', 'featured', 20, 15, 900, true),
  ('featured', 'Featured (30 days)', 'featured', 20, 30, 1600, true),
  ('urgent', 'Urgent (7 days)', 'urgent', 5, 7, 250, true),
  ('top', 'Top Ad / Spotlight (3 days)', 'top', 30, 3, 1200, true),
  ('top', 'Top Ad / Spotlight (7 days)', 'top', 30, 7, 2200, true),
  ('bump', 'Bump Up', null, 0, 0, 100, true);
