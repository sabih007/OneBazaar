-- Voice messages in chat: record-in-browser, upload, playback (feature
-- request). Messages become either text (body) or voice (audio_url +
-- audio_duration_ms), never both/neither.

-- ─────────────────────────────────────────────────────────────────────────
-- messages: allow a null body, add audio columns
-- ─────────────────────────────────────────────────────────────────────────
alter table public.messages alter column body drop not null;
alter table public.messages add column audio_url text;
alter table public.messages add column audio_duration_ms integer;

alter table public.messages
  add constraint messages_body_xor_audio
  check (num_nonnulls(body, audio_url) = 1);

-- protect_message_columns (0010_chat_unread.sql) pinned conversation_id/
-- sender_id/body/created_at back to their old values on update so a
-- participant can't rewrite another user's message while "marking it read".
-- Extend the same lockdown to the new audio columns.
create or replace function public.protect_message_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.conversation_id := old.conversation_id;
    new.sender_id := old.sender_id;
    new.body := old.body;
    new.audio_url := old.audio_url;
    new.audio_duration_ms := old.audio_duration_ms;
    new.created_at := old.created_at;
    new.read_at := coalesce(old.read_at, now());
  end if;
  return new;
end;
$$;

-- ─────────────────────────────────────────────────────────────────────────
-- storage bucket for voice message audio (same public/owner-scoped template
-- as listing-images (0002) and avatars (0005))
-- ─────────────────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
values ('voice-messages', 'voice-messages', true)
on conflict (id) do nothing;

create policy "Voice messages are publicly readable"
  on storage.objects for select
  using (bucket_id = 'voice-messages');

create policy "Authenticated users can upload voice messages"
  on storage.objects for insert
  with check (bucket_id = 'voice-messages' and auth.role() = 'authenticated');

create policy "Users can update own voice messages"
  on storage.objects for update
  using (bucket_id = 'voice-messages' and owner = auth.uid());

create policy "Users can delete own voice messages"
  on storage.objects for delete
  using (bucket_id = 'voice-messages' and owner = auth.uid());
