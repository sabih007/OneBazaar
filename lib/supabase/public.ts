import { createClient as createSupabaseClient } from "@supabase/supabase-js";

/**
 * Anon, cookie-free client for public read-only data (e.g. sitemap generation).
 * Unlike lib/supabase/server.ts this doesn't call cookies(), so routes using it
 * stay eligible for time-based (ISR) caching instead of being forced fully dynamic.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { auth: { persistSession: false } }
  );
}
