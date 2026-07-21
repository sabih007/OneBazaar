import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Uses the one free refresh included with a free-tier listing (bumps it back
 * to the top of search). Goes through the admin client because
 * `free_refresh_used_at`/`bumped_at` are both locked to service-role-only
 * writes (supabase/migrations/0008 and 0012) — a user-session client's
 * update would be silently reverted by the protect_listing_promotion_columns
 * trigger, same as it already was for repostListing().
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("id, user_id, status, free_refresh_used_at")
    .eq("id", id)
    .maybeSingle();
  if (listingError) throw listingError;
  if (!listing || listing.user_id !== user.id) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.status !== "active") {
    return NextResponse.json({ error: "Only active listings can be refreshed" }, { status: 400 });
  }
  if (listing.free_refresh_used_at) {
    return NextResponse.json({ error: "The free refresh has already been used on this ad" }, { status: 400 });
  }

  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("listings")
    .update({ bumped_at: now, free_refresh_used_at: now })
    .eq("id", id);
  if (error) throw error;

  return NextResponse.json({ ok: true });
}
