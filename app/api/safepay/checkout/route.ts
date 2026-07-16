import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createPendingPromotion, markPromotionFailed } from "@/lib/promotions";
import { createSafepayTracker, buildSafepayCheckoutUrl } from "@/lib/safepay";

/** Starts a Safepay checkout for a promotion package (§6) and returns the redirect URL. */
export async function POST(request: NextRequest) {
  let promotionId: string | undefined;
  let supabase: Awaited<ReturnType<typeof createClient>> | undefined;

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

    supabase = await createClient();

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
      paymentMethod: "card",
    });
    promotionId = promotion.id;

    const { origin } = request.nextUrl;
    const cancelUrl = `${origin}/post/${listingId}/promote?safepay=cancelled`;

    const token = await createSafepayTracker({
      amount: packageRow.price,
      currency: "PKR",
      orderId: promotion.id,
    });

    const checkoutUrl = buildSafepayCheckoutUrl({
      token,
      orderId: promotion.id,
      redirectUrl: `${origin}/api/safepay/callback?promotionId=${promotion.id}&listingId=${listingId}&token=${token}`,
      cancelUrl,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[safepay/checkout]", err);
    if (promotionId && supabase) {
      await markPromotionFailed(supabase, { promotionId }).catch(() => {});
    }
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Safepay session creation failed" },
      { status: 502 }
    );
  }
}
