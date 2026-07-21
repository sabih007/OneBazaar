-- Harden increment_refresh_credits/spend_refresh_credit (0013).
--
-- Revoking from PUBLIC (first attempt at this migration) wasn't enough —
-- confirmed via has_function_privilege() that anon/authenticated still had
-- EXECUTE afterward. Supabase's project template applies
-- `alter default privileges in schema public grant execute on functions to
-- anon, authenticated, service_role` at the schema level, so every new
-- function gets EXECUTE granted directly to those roles regardless of
-- PUBLIC's privileges — revoking from PUBLIC only undoes the PUBLIC-level
-- grant, not this separate direct one. Must revoke from anon/authenticated
-- explicitly.
revoke execute on function public.increment_refresh_credits(uuid, int) from public, anon, authenticated;
revoke execute on function public.spend_refresh_credit(uuid, uuid) from public, anon, authenticated;
