import { NextRequest, NextResponse } from "next/server";
import { getListings } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

/**
 * Powers the client-side "Near You" section for visitors without a saved
 * profile city (guests, or logged-in users who never set one) — the browser
 * geolocation coords can't be read in a Server Component, so
 * NearbyListingsSection fetches this after getCurrentPosition() resolves.
 */
export async function GET(request: NextRequest) {
  const latParam = request.nextUrl.searchParams.get("lat");
  const lngParam = request.nextUrl.searchParams.get("lng");
  const lat = latParam === null ? NaN : Number(latParam);
  const lng = lngParam === null ? NaN : Number(lngParam);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: "lat and lng query params are required" }, { status: 400 });
  }

  if (!isSupabaseConfigured) {
    return NextResponse.json({ listings: [] });
  }

  const supabase = await createClient();
  const { listings } = await getListings(supabase, {
    sort: "nearest",
    originLat: lat,
    originLng: lng,
    pageSize: 10,
  });

  return NextResponse.json({ listings });
}
