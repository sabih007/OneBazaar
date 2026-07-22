import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendSavedSearchAlertEmail } from "@/lib/email";

/**
 * Fired (fire-and-forget) right after a listing is created. Matching happens
 * here rather than via a polling job — cheap since it's one lookup per new
 * listing instead of scanning every saved search on a schedule.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const listingId = typeof body?.listingId === "string" ? body.listingId : null;
  if (!listingId) {
    return NextResponse.json({ error: "Missing listingId" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: listing, error } = await supabase
    .from("listings")
    .select("id, title, price, city, category_slug, city_slug, subcategory, condition, slug")
    .eq("id", listingId)
    .maybeSingle();

  if (error || !listing) {
    return NextResponse.json({ error: "Listing not found" }, { status: 404 });
  }

  const { data: candidates } = await supabase
    .from("saved_searches")
    .select("email, subcategory_slug, condition, min_price, max_price")
    .eq("category_slug", listing.category_slug)
    .eq("city_slug", listing.city_slug);

  const matches = (candidates ?? []).filter((s) => {
    if (s.subcategory_slug && s.subcategory_slug !== listing.subcategory) return false;
    if (s.condition && s.condition !== listing.condition) return false;
    if (s.min_price !== null && listing.price < s.min_price) return false;
    if (s.max_price !== null && listing.price > s.max_price) return false;
    return true;
  });

  await Promise.allSettled(
    matches.map((m) =>
      sendSavedSearchAlertEmail(m.email, {
        title: listing.title,
        price: listing.price,
        city: listing.city,
        url: `/${listing.category_slug}/${listing.city_slug}/${listing.slug}`,
      })
    )
  );

  return NextResponse.json({ ok: true, notified: matches.length });
}
