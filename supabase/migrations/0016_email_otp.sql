-- Custom email OTP verification. Replaces Supabase Auth's built-in
-- "Confirm signup" email/link with our own 6-digit code sent through
-- lib/email.ts (Resend), while still using Supabase's own token/session
-- machinery under the hood (generateLink + verifyOtp with a token_hash) so a
-- session still can't exist before the code is entered.
--
-- `channel` is generic ('email' | 'phone') so phone OTP (planned separately,
-- per OneBazaar-Spec.md §"Verified seller program") can reuse this table
-- later without a schema change.

alter table public.profiles
  add column email_verified boolean not null default false;

-- Mirror 0008's protect_listing_promotion_columns: block direct client
-- writes to email_verified. Only the service-role client (used by the
-- /api/auth/email-otp/verify route, after the code actually checks out) may
-- flip it — the existing "Users can update own profile" policy has no
-- column-level restriction, so without this trigger a user could just
-- PATCH their own row to email_verified: true via the anon-key client.
create function public.protect_profile_verification_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.email_verified := old.email_verified;
  end if;
  return new;
end;
$$;

create trigger protect_profile_verification_columns
  before update on public.profiles
  for each row execute procedure public.protect_profile_verification_columns();

create table public.otp_codes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  channel text not null check (channel in ('email', 'phone')),
  destination text not null,
  code_hash text not null,
  -- token_hash from supabase.auth.admin.generateLink(); verifyOtp with this
  -- (type: 'magiclink') is what actually issues the session once our code
  -- matches. Only populated for channel = 'email'.
  supabase_token_hash text,
  expires_at timestamptz not null,
  attempts int not null default 0,
  consumed_at timestamptz,
  created_at timestamptz not null default now()
);

create index otp_codes_active_idx
  on public.otp_codes (user_id, channel, consumed_at, created_at desc);

alter table public.otp_codes enable row level security;
-- No policies: this table is only ever touched by the service-role client
-- (lib/supabase/admin.ts) from the /api/auth/email-otp/* and /api/auth/signup
-- routes. RLS enabled with zero policies denies anon/authenticated entirely.
