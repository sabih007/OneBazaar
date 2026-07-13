# Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. In the SQL editor, run `migrations/0001_init.sql` then `migrations/0002_storage.sql`.
3. Run `seed.sql` to seed the promotion packages.
4. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   (Project Settings → API in the Supabase dashboard.)
5. Enable Email/Password auth under Authentication → Providers (on by default).
