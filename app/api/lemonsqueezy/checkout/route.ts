import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPendingPromotion, markPromotionFailed } from "@/lib/promotions";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy";
import { getPublicOrigin } from "@/lib/request-origin";

/** Starts a Lemon Squeezy checkout for a promotion package and returns the redirect URL. */
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
      .select("id, user_id")
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
      paymentMethod: "lemonsqueezy",
    });
    promotionId = promotion.id;

    const checkoutUrl = await createLemonSqueezyCheckout({
      promotionId: promotion.id,
      price: packageRow.price,
      redirectUrl: `${getPublicOrigin(request)}/post/${listingId}/promote?checkout=success`,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[lemonsqueezy/checkout]", err);
    if (promotionId) {
      // Uses the admin client, not the user session — migration 0008 removed
      // the user-facing UPDATE policy on ad_promotions entirely, so a
      // user-session client here would silently fail RLS and leave the row
      // stuck as `pending`.
      await markPromotionFailed(createAdminClient(), { promotionId }).catch(() => {});
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Lemon Squeezy checkout creation failed" },
      { status: 502 }
    );
  }
}
