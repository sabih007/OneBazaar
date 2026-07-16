-- Google OAuth populates raw_user_meta_data.avatar_url on auth.users — pick it
-- up in the same new-profile trigger used for email/password signups (§9) so a
-- Google sign-in gets a profile photo without an extra edit-profile step.

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, phone, city, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data ->> 'full_name',
    new.raw_user_meta_data ->> 'phone',
    new.raw_user_meta_data ->> 'city',
    new.raw_user_meta_data ->> 'avatar_url'
  );
  return new;
end;
$$;
