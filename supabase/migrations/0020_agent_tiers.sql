-- Real-estate Agent/Agency subscription tiers (marketplace-packages-pakistan.md
-- §4, prelaunch review §1.5 — /partner had no public pricing at all). These
-- reuse the exact same subscriptions/credit-grant/checkout machinery as the
-- general Shop/Dealer/Business Pro tiers (0015) — TIER_INFO in
-- lib/subscriptions.ts is the source of truth for what each tier grants, this
-- migration only widens the allowed tier values.

alter table public.subscriptions drop constraint subscriptions_tier_check;
alter table public.subscriptions add constraint subscriptions_tier_check
  check (tier in ('shop', 'dealer', 'business_pro', 'agent_starter', 'agency', 'agency_premium'));
