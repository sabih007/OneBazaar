-- Storage bucket for listing images (§2, §11 — client-compressed before upload).

insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do nothing;

create policy "Listing images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  with check (bucket_id = 'listing-images' and auth.role() = 'authenticated');

create policy "Users can update own listing images"
  on storage.objects for update
  using (bucket_id = 'listing-images' and owner = auth.uid());

create policy "Users can delete own listing images"
  on storage.objects for delete
  using (bucket_id = 'listing-images' and owner = auth.uid());
