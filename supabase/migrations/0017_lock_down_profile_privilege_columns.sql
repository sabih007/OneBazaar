-- Critical: "Users can update own profile" (0001_init.sql) has no
-- column-level restriction, so any authenticated user can currently
-- self-promote via the anon-key client:
--
--   supabase.from('profiles').update({ role: 'admin' })
--
-- `role = 'admin'` is what public.is_admin() checks (0001_init.sql
-- §"admin override policies"), which lets admins bypass RLS ownership
-- checks on listings/packages/reports — so this is a full privilege
-- escalation, not just cosmetic. `is_verified` (the "Verified seller"
-- badge) has the same gap.
--
-- Fix: extend the trigger 0016_email_otp.sql already attached to
-- public.profiles (protect_profile_verification_columns) to guard these
-- two columns as well — only the service-role client may change them now.
create or replace function public.protect_profile_verification_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.email_verified := old.email_verified;
    new.is_verified := old.is_verified;
    new.role := old.role;
  end if;
  return new;
end;
$$;
