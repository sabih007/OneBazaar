import { NextResponse } from "next/server";
import { createClient, getUser } from "@/lib/supabase/server";
import { getSubscriptionPortalUrl } from "@/lib/lemonsqueezy";

/** Redirects to a freshly-signed Lemon Squeezy Customer Portal link — this is the entire manage/cancel UI. */
export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const supabase = await createClient();
  const { data: subscription, error } = await supabase
    .from("subscriptions")
    .select("ls_subscription_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!subscription?.ls_subscription_id) {
    return NextResponse.json({ error: "No subscription found" }, { status: 404 });
  }

  try {
    const portalUrl = await getSubscriptionPortalUrl(subscription.ls_subscription_id);
    return NextResponse.redirect(portalUrl);
  } catch (err) {
    console.error("[subscriptions/portal]", err);
    return NextResponse.json({ error: "Couldn't open the billing portal" }, { status: 502 });
  }
}
