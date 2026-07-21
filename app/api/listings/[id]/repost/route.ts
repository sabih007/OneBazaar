import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { repostListing, getActiveSlotLimit } from "@/lib/listings";

/**
 * Brings an expired listing back to active. Goes through the admin client —
 * repostListing() sets `bumped_at`, which the protect_listing_promotion_columns
 * trigger (migration 0008) silently reverts for a user-session client, so
 * calling this with the browser client (as MyListingRow.tsx used to) updated
 * status/expires_at but never actually bumped the listing's sort position.
 *
 * Using the admin client also means enforce_active_listing_limit (0012,
 * tier-aware since 0015) is bypassed — that trigger exempts service-role
 * writes on purpose, so the active-ad cap has to be re-checked here in
 * application code instead.
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
    .select("id, user_id, status")
    .eq("id", id)
    .maybeSingle();
  if (listingError) throw listingError;
  if (!listing || listing.user_id !== user.id) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }
  if (listing.status !== "expired") {
    return NextResponse.json({ error: "Only expired listings can be reposted" }, { status: 400 });
  }

  const [{ count }, limit] = await Promise.all([
    supabase.from("listings").select("id", { count: "exact", head: true }).eq("user_id", user.id).eq("status", "active"),
    getActiveSlotLimit(supabase, user.id),
  ]);
  if ((count ?? 0) >= limit) {
    return NextResponse.json(
      { error: `Your plan allows up to ${limit} active ads at a time. Delete or mark one as sold to repost this one.` },
      { status: 400 }
    );
  }

  await repostListing(createAdminClient(), id);

  return NextResponse.json({ ok: true });
}
