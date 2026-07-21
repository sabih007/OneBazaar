import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Bumps a listing back to the top of search — the free tier's one-time free
 * refresh first, then falls back to spending a paid refresh credit
 * (supabase/migrations/0013's spend_refresh_credit, bought via
 * /api/credits/checkout). Goes through the admin client because
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
    const { data: spent, error: spendError } = await createAdminClient().rpc("spend_refresh_credit", {
      p_listing_id: id,
      p_user_id: user.id,
    });
    if (spendError) throw spendError;
    if (!spent) {
      return NextResponse.json(
        { error: "No refresh credits available — buy more on the Credits page." },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true });
  }

  const now = new Date().toISOString();
  const { error } = await createAdminClient()
    .from("listings")
    .update({ bumped_at: now, free_refresh_used_at: now })
    .eq("id", id);
  if (error) throw error;

  return NextResponse.json({ ok: true });
}
