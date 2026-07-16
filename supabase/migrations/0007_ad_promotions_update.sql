-- Buysellox.com — allow a user to update their own ad_promotions rows (§6).
-- Needed so the Safepay callback route (running as the authenticated buyer)
-- can flip a `pending` promotion to `paid`/`failed` after checkout.

create policy "Users can update own promotions"
  on public.ad_promotions for update
  using (auth.uid() = user_id);
