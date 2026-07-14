import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";

/**
 * Check-on-read expiry (§6): clears badge/rank on listings whose promotion lapsed.
 * Scheduled via `after()` so it runs once the response has been sent instead of
 * adding a round trip to the read, and best-effort (a failed RPC — e.g. migration
 * not yet applied — shouldn't affect anything else).
 *
 * `after()` only works in Server Components, so this is a separate module from
 * lib/promotions.ts — that file is also imported by client components (the
 * promote/payment UI), and bundling `next/server` into a client chunk fails the
 * build. Call this only from page.tsx / layout.tsx server files.
 */
export function expireStalePromotions(supabase: SupabaseClient) {
  after(async () => {
    try {
      await supabase.rpc("expire_promotions");
    } catch {
      // ignore
    }
  });
}
