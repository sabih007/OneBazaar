import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPromotionPaid, markPromotionFailed } from "@/lib/promotions";
import { verifyJazzCashResponse } from "@/lib/jazzcash";
import { getPublicOrigin } from "@/lib/request-origin";

// Uses node:crypto for signature verification (via lib/jazzcash.ts).
export const runtime = "nodejs";

/**
 * JazzCash's Hosted Checkout Page redirects the customer's browser back here
 * via a form POST of pp_-prefixed fields — there's no separate async webhook
 * the way Lemon Squeezy has one, so this single request is both the
 * "did it succeed" signal and the page the browser lands on next. Redirects
 * with 303 so the browser's follow-up request is a GET, not a re-POST.
 */
export async function POST(request: NextRequest) {
  const origin = getPublicOrigin(request);
  const admin = createAdminClient();

  const form = await request.formData().catch(() => null);
  if (!form) {
    return NextResponse.redirect(`${origin}/me/promotions?checkout=failed`, 303);
  }

  const fields: Record<string, string> = {};
  for (const [key, value] of form.entries()) {
    if (typeof value === "string") fields[key] = value;
  }

  const promotionId = fields.ppmpf_1;
  if (!promotionId) {
    console.warn("[jazzcash/return] missing ppmpf_1 promotion id", fields.pp_TxnRefNo);
    return NextResponse.redirect(`${origin}/me/promotions?checkout=failed`, 303);
  }

  const { data: promotion } = await admin
    .from("ad_promotions")
    .select("listing_id")
    .eq("id", promotionId)
    .maybeSingle();

  // Credit-bundle purchases aren't tied to a listing (see lib/promotions.ts) — land those on /me/credits instead.
  const redirectBase = promotion?.listing_id
    ? `${origin}/post/${promotion.listing_id}/promote`
    : `${origin}/me/credits`;

  if (!verifyJazzCashResponse(fields)) {
    console.error("[jazzcash/return] signature verification failed", fields.pp_TxnRefNo);
    await markPromotionFailed(admin, { promotionId, paymentRef: fields.pp_TxnRefNo }).catch(() => {});
    return NextResponse.redirect(`${redirectBase}?checkout=failed`, 303);
  }

  try {
    if (fields.pp_ResponseCode === "000") {
      await markPromotionPaid(admin, { promotionId, paymentRef: fields.pp_TxnRefNo });
      return NextResponse.redirect(`${redirectBase}?checkout=success`, 303);
    }

    await markPromotionFailed(admin, { promotionId, paymentRef: fields.pp_TxnRefNo });
    return NextResponse.redirect(`${redirectBase}?checkout=failed`, 303);
  } catch (err) {
    console.error("[jazzcash/return]", fields.pp_TxnRefNo, err);
    return NextResponse.redirect(`${redirectBase}?checkout=failed`, 303);
  }
}
