-- Storage bucket for profile avatars (§14 — /me/profile).

insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Users can update own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and owner = auth.uid());

create policy "Users can delete own avatar"
  on storage.objects for delete
  using (bucket_id = 'avatars' and owner = auth.uid());
