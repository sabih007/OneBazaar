import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPendingPromotion, markPromotionFailed } from "@/lib/promotions";
import { createJazzCashCheckoutPayload } from "@/lib/jazzcash";
import { getPublicOrigin } from "@/lib/request-origin";

/**
 * Starts a JazzCash Hosted Checkout Page transaction for a promotion package.
 * Unlike /api/lemonsqueezy/checkout, this returns the signed form fields
 * (not a redirect URL) — the client builds and submits a real
 * <form method="POST"> to `actionUrl`, since HCP is a page navigation.
 */
export async function POST(request: NextRequest) {
  let promotionId: string | undefined;

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const listingId = body?.listingId as string | undefined;
    const packageId = body?.packageId as string | undefined;
    if (!listingId || !packageId) {
      return NextResponse.json({ error: "listingId and packageId are required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: listing, error: listingError } = await supabase
      .from("listings")
      .select("id, user_id, title")
      .eq("id", listingId)
      .maybeSingle();
    if (listingError) throw listingError;
    if (!listing || listing.user_id !== user.id) {
      return NextResponse.json({ error: "Listing not found" }, { status: 404 });
    }

    const { promotion, packageRow } = await createPendingPromotion(supabase, {
      listingId,
      userId: user.id,
      packageId,
      paymentMethod: "jazzcash",
    });
    promotionId = promotion.id;

    const payload = createJazzCashCheckoutPayload({
      promotionId: promotion.id,
      price: packageRow.price,
      billReference: packageRow.key,
      description: `${packageRow.name} — ${listing.title}`,
      returnUrl: `${getPublicOrigin(request)}/api/jazzcash/return`,
    });

    return NextResponse.json(payload);
  } catch (err) {
    console.error("[jazzcash/checkout]", err);
    if (promotionId) {
      // Admin client, not the user session — migration 0008 removed the
      // user-facing UPDATE policy on ad_promotions, so a user-session client
      // here would silently fail RLS and leave the row stuck as `pending`.
      await markPromotionFailed(createAdminClient(), { promotionId }).catch(() => {});
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "JazzCash checkout creation failed" },
      { status: 502 }
    );
  }
}
