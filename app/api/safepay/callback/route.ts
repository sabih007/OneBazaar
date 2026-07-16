import { NextRequest, NextResponse } from "next/server";
import { getUser } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPromotionPaid, markPromotionFailed } from "@/lib/promotions";
import { getSafepayTrackerStatus } from "@/lib/safepay";

/**
 * Safepay redirects the buyer's browser back here after checkout (§6). We
 * don't trust anything Safepay appends to the URL — `promotionId`/`listingId`/
 * `token` are ones we generated ourselves in /api/safepay/checkout, and payment
 * status is confirmed with a server-to-server call, not the redirect itself.
 *
 * The actual DB write uses the service-role admin client, not a user-session
 * client — migration 0008 removed the RLS policy that let a user update their
 * own `ad_promotions` row, since that same policy was also a free-promotion
 * bypass (a user could flip their own pending row to "paid" without paying).
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = request.nextUrl;
  const promotionId = searchParams.get("promotionId");
  const listingId = searchParams.get("listingId");
  const token = searchParams.get("token");

  if (!promotionId || !listingId || !token) {
    return NextResponse.redirect(`${origin}/me/promotions?safepay=error`);
  }

  const user = await getUser();
  if (!user) {
    return NextResponse.redirect(`${origin}/login?redirect=/me/promotions`);
  }

  const supabase = createAdminClient();

  try {
    const status = await getSafepayTrackerStatus(token);
    if (status.paid) {
      await markPromotionPaid(supabase, { promotionId, paymentRef: token });
      return NextResponse.redirect(`${origin}/post/${listingId}/promote?safepay=success`);
    }
    await markPromotionFailed(supabase, { promotionId, paymentRef: token });
    return NextResponse.redirect(`${origin}/post/${listingId}/promote?safepay=failed`);
  } catch (err) {
    console.error("[safepay] callback error", err);
    return NextResponse.redirect(`${origin}/post/${listingId}/promote?safepay=error`);
  }
}
