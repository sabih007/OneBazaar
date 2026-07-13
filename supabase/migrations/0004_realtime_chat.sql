-- Enables Supabase Realtime change feeds for the chat thread (§11 — realtime messages).

alter publication supabase_realtime add table public.messages;
