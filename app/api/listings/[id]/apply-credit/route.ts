import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { applyPackageToListing, getActivePackages } from "@/lib/promotions";
import type { Package } from "@/types/database";

const SPEND_RPC: Record<"featured" | "hot", string> = {
  featured: "spend_featured_credit_only",
  hot: "spend_hot_credit_only",
};

/**
 * Spends a subscription Featured/Hot credit on a listing. Two separate
 * calls, not one DB transaction: spend_featured_credit_only/
 * spend_hot_credit_only (supabase/migrations/0015) atomically decrements
 * the wallet, then applyPackageToListing (lib/promotions.ts, the same
 * function every paid boost purchase already goes through) applies the
 * badge — reusing it rather than re-implementing its rank/expiry logic in
 * SQL a second time. A failure between the two would spend a credit with
 * nothing applied; accepted as the same class of risk already present in
 * the webhook->apply chain elsewhere in this codebase, not a new one.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const creditType = body?.creditType as string | undefined;
  if (creditType !== "featured" && creditType !== "hot") {
    return NextResponse.json({ error: "creditType must be 'featured' or 'hot'" }, { status: 400 });
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
  if (listing.status !== "active") {
    return NextResponse.json({ error: "Only active listings can be boosted" }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: spent, error: spendError } = await admin.rpc(SPEND_RPC[creditType], { p_user_id: user.id });
  if (spendError) throw spendError;
  if (!spent) {
    return NextResponse.json({ error: `No ${creditType} credits available` }, { status: 400 });
  }

  const packages = await getActivePackages(admin);
  const packageRow = packages.find((p) => p.key === creditType) as Package | undefined;
  if (!packageRow) {
    return NextResponse.json({ error: `No active ${creditType} package configured` }, { status: 500 });
  }

  await applyPackageToListing(admin, { listingId: id, packageRow });

  return NextResponse.json({ ok: true });
}
