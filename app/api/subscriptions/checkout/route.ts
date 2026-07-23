import { NextRequest, NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { createLemonSqueezySubscriptionCheckout } from "@/lib/lemonsqueezy";
import { getPublicOrigin } from "@/lib/request-origin";
import { isSubscriptionTier } from "@/lib/subscriptions";

const VARIANT_ENV: Record<string, string | undefined> = {
  shop: process.env.LEMONSQUEEZY_SHOP_VARIANT_ID,
  dealer: process.env.LEMONSQUEEZY_DEALER_VARIANT_ID,
  business_pro: process.env.LEMONSQUEEZY_BUSINESS_PRO_VARIANT_ID,
  agent_starter: process.env.LEMONSQUEEZY_AGENT_STARTER_VARIANT_ID,
  agency: process.env.LEMONSQUEEZY_AGENCY_VARIANT_ID,
  agency_premium: process.env.LEMONSQUEEZY_AGENCY_PREMIUM_VARIANT_ID,
};

/** Starts a dealer-tier subscription checkout. Upgrade/downgrade/proration is out of scope — cancel via the portal first. */
export async function POST(request: NextRequest) {
  try {
    const user = await getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json().catch(() => null);
    const tier = body?.tier as string | undefined;
    if (!tier || !isSubscriptionTier(tier)) {
      return NextResponse.json({ error: "Invalid tier" }, { status: 400 });
    }

    const variantId = VARIANT_ENV[tier];
    if (!variantId) {
      return NextResponse.json({ error: `${tier} isn't configured yet` }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: existing, error: existingError } = await supabase
      .from("subscriptions")
      .select("id")
      .eq("user_id", user.id)
      .eq("status", "active")
      .maybeSingle();
    if (existingError) throw existingError;
    if (existing) {
      return NextResponse.json(
        { error: "You already have an active subscription — manage it from My subscription first." },
        { status: 400 }
      );
    }

    const checkoutUrl = await createLemonSqueezySubscriptionCheckout({
      userId: user.id,
      tier,
      variantId,
      redirectUrl: `${getPublicOrigin(request)}/me/subscription?checkout=success`,
    });

    return NextResponse.json({ checkoutUrl });
  } catch (err) {
    console.error("[subscriptions/checkout]", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Checkout creation failed" },
      { status: 502 }
    );
  }
}
