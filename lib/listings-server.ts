import type { SupabaseClient } from "@supabase/supabase-js";
import { after } from "next/server";

/**
 * Check-on-read expiry: flips listings past their 30-day `expires_at` to
 * `status = 'expired'`. Same pattern as expireStalePromotions
 * (lib/promotions-server.ts) — scheduled via `after()` so it runs once the
 * response has been sent, best-effort (a failed RPC shouldn't affect
 * anything else). Separate module for the same reason: `next/server`
 * can't be bundled into a client chunk, and this file is only ever
 * imported from page.tsx/layout.tsx server files.
 */
export function expireStaleListings(supabase: SupabaseClient) {
  after(async () => {
    try {
      await supabase.rpc("expire_listings");
    } catch {
      // ignore
    }
  });
}
