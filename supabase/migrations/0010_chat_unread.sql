-- Chat list: last-message preview + unread badge (inboxuiandfeaturesupdates.md §1).
--
-- Adds the ability for a conversation participant to mark messages as read,
-- and two RPCs the inbox list / nav badge use to get unread counts and last-
-- message previews without an N+1 query per conversation.

-- ─────────────────────────────────────────────────────────────────────────
-- messages: allow the recipient (not the sender) to mark a message read
-- ─────────────────────────────────────────────────────────────────────────
create policy "Recipients can mark messages as read"
  on public.messages for update
  using (
    auth.uid() <> sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  )
  with check (
    auth.uid() <> sender_id
    and exists (
      select 1 from public.conversations c
      where c.id = conversation_id
        and (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    )
  );

-- The policy above only guards which *rows* are updatable, not which
-- *columns* change. Without this, a participant could rewrite another
-- user's message body/sender while "marking it read". Same lockdown
-- pattern as protect_listing_promotion_columns (migration 0008): force
-- every column except read_at back to its old value, and make read_at
-- itself first-write-wins on the server clock (can't be forged or unset).
create function public.protect_message_columns()
returns trigger
language plpgsql
as $$
begin
  if auth.role() <> 'service_role' then
    new.conversation_id := old.conversation_id;
    new.sender_id := old.sender_id;
    new.body := old.body;
    new.created_at := old.created_at;
    new.read_at := coalesce(old.read_at, now());
  end if;
  return new;
end;
$$;

create trigger protect_message_columns
  before update on public.messages
  for each row execute procedure public.protect_message_columns();

-- ─────────────────────────────────────────────────────────────────────────
-- conversation_summaries: one row per conversation the caller is in, with
-- its last message and unread count. security invoker + auth.uid() means
-- visibility is still fully governed by the conversations/messages RLS
-- policies above, regardless of what a caller might pass in.
-- ─────────────────────────────────────────────────────────────────────────
create function public.conversation_summaries()
returns table (
  id uuid,
  listing_id uuid,
  buyer_id uuid,
  seller_id uuid,
  created_at timestamptz,
  last_message_body text,
  last_message_sender_id uuid,
  last_message_created_at timestamptz,
  unread_count bigint
)
language sql
security invoker
stable
set search_path = public
as $$
  select
    c.id,
    c.listing_id,
    c.buyer_id,
    c.seller_id,
    c.created_at,
    lm.body,
    lm.sender_id,
    lm.created_at,
    coalesce(uc.cnt, 0)
  from public.conversations c
  left join lateral (
    select m.body, m.sender_id, m.created_at
    from public.messages m
    where m.conversation_id = c.id
    order by m.created_at desc
    limit 1
  ) lm on true
  left join lateral (
    select count(*) as cnt
    from public.messages m
    where m.conversation_id = c.id
      and m.sender_id <> auth.uid()
      and m.read_at is null
  ) uc on true
  where c.buyer_id = auth.uid() or c.seller_id = auth.uid()
  order by coalesce(lm.created_at, c.created_at) desc;
$$;

grant execute on function public.conversation_summaries() to authenticated;

-- ─────────────────────────────────────────────────────────────────────────
-- unread_message_count: total unread across all of the caller's
-- conversations, for the header nav badge.
-- ─────────────────────────────────────────────────────────────────────────
create function public.unread_message_count()
returns bigint
language sql
security invoker
stable
set search_path = public
as $$
  select count(*)
  from public.messages m
  join public.conversations c on c.id = m.conversation_id
  where (c.buyer_id = auth.uid() or c.seller_id = auth.uid())
    and m.sender_id <> auth.uid()
    and m.read_at is null;
$$;

grant execute on function public.unread_message_count() to authenticated;
