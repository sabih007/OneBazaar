# Supabase setup

1. Create a project at https://supabase.com/dashboard.
2. In the SQL editor, run each file in `migrations/` in order (0001 → 0021).
3. Run `seed.sql` to seed the promotion packages.
4. Copy `.env.local.example` to `.env.local` and fill in:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` — required as of migration 0008, which locks
     down the promotion columns so only the service-role client
     (`lib/supabase/admin.ts`) can confirm a paid promotion.
   (Project Settings → API in the Supabase dashboard.)
5. Enable Email/Password auth under Authentication → Providers (on by default).
6. For Google Sign-In: create an OAuth Client ID in Google Cloud Console
   (Web application, authorized redirect URI
   `https://<project-ref>.supabase.co/auth/v1/callback`), then paste the
   Client ID/Secret into Authentication → Providers → Google and enable it.
   Also add this app's `/auth/callback` URL to the Redirect URLs allow-list
   under Authentication → URL Configuration for each environment (local + prod).
