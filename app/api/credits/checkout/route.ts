import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createPendingPromotion, markPromotionFailed } from "@/lib/promotions";
import { createLemonSqueezyCheckout } from "@/lib/lemonsqueezy";
import { getPublicOrigin } from "@/lib/request-origin";
import type { Package } from "@/types/database";

/**
 * Starts a Lemon Squeezy checkout for a refresh-credit bundle — same
 * gateway/webhook plumbing as /api/lemonsqueezy/checkout, but not tied to
 * any listing (no ownership check, no listingId). markPromotionPaid
 * (lib/promotions.ts) sees `listing_id` is null on this row and credits the
 * buyer's wallet instead of applying a badge to a listing.
 */
export async function POST(request: NextRequest) {
  let promotionId: string | undefined;

  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const packageId = body?.packageId as string | undefined;
    if (!packageId) {
      return NextResponse.json({ error: "packageId is required" }, { status: 400 });
    }

    const supabase = await createClient();

    const { data: pkg, error: pkgError } = await supabase
      .from("packages")
      .select("*")
      .eq("id", packageId)
      .maybeSingle();
    if (pkgError) throw pkgError;
    const packageRow = pkg as Package | null;
    if (!packageRow || packageRow.credits <= 1) {
      return NextResponse.json({ error: "This isn't a refresh-credit bundle" }, { status: 400 });
    }

    const { promotion } = await createPendingPromotion(supabase, {
      userId: user.id,
      packageId,
      paymentMethod: "lemonsqueezy",
    });
    promotionId = promotion.id;

    const checkoutUrl = await createLemonSqueezyCheckout({
      promotionId: promotion.id,
      price: packageRow.price,
      redirectUrl: `${getPublicOrigin(request)}/me/credits?checkout=success`,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[credits/checkout]", err);
    if (promotionId) {
      await markPromotionFailed(createAdminClient(), { promotionId }).catch(() => {});
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout creation failed" },
      { status: 502 }
    );
  }
}
