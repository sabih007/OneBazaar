-- Add 'lemonsqueezy' as a valid ad_promotions.payment_method now that Lemon
-- Squeezy replaces Safepay as the promotion payment gateway. `not valid` so
-- historical 'card' rows (from Safepay) don't need to be re-validated
-- against the new constraint — only new inserts are checked, same pattern
-- as migration 0008.
alter table public.ad_promotions drop constraint ad_promotions_payment_method_check;
alter table public.ad_promotions
  add constraint ad_promotions_payment_method_check
  check (payment_method in ('jazzcash', 'easypaisa', 'card', 'lemonsqueezy')) not valid;
