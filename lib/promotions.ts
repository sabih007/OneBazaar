import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdPromotion, Listing, Package, PaymentMethod } from "@/types/database";

/**
 * Check-on-read expiry (§6): clears badge/rank on listings whose promotion lapsed.
 * Best-effort — a failed RPC (e.g. offline, migration not yet applied) shouldn't
 * break the read path that called it.
 */
export async function expireStalePromotions(supabase: SupabaseClient) {
  try {
    await supabase.rpc("expire_promotions");
  } catch {
    // ignore
  }
}

export async function getActivePackages(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from("packages")
    .select("*")
    .eq("is_active", true)
    .order("promotion_rank", { ascending: false })
    .order("duration_days", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Package[];
}

export interface PurchasePromotionInput {
  listingId: string;
  userId: string;
  packageId: string;
  paymentMethod: PaymentMethod;
}

export async function purchasePromotion(
  supabase: SupabaseClient,
  { listingId, userId, packageId, paymentMethod }: PurchasePromotionInput
) {
  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("*")
    .eq("id", packageId)
    .single();
  if (pkgError) throw pkgError;
  const packageRow = pkg as Package;

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("promotion_rank, promoted_until, badge")
    .eq("id", listingId)
    .single();
  if (listingError) throw listingError;
  const current = listing as Pick<Listing, "promotion_rank" | "promoted_until" | "badge">;

  const now = new Date();
  const isBump = packageRow.key === "bump";
  const computedExpiry = new Date(now.getTime() + packageRow.duration_days * 24 * 60 * 60 * 1000);

  const { data: promotion, error: insertError } = await supabase
    .from("ad_promotions")
    .insert({
      listing_id: listingId,
      user_id: userId,
      package_id: packageId,
      starts_at: now.toISOString(),
      expires_at: (isBump ? now : computedExpiry).toISOString(),
      amount: packageRow.price,
      payment_method: paymentMethod,
      // MVP: no real gateway wired up yet, so mock/manual payments settle instantly (§6).
      payment_status: "paid",
    })
    .select()
    .single();
  if (insertError) throw insertError;

  if (isBump) {
    const { error } = await supabase
      .from("listings")
      .update({ bumped_at: now.toISOString() })
      .eq("id", listingId);
    if (error) throw error;
  } else if (packageRow.promotion_rank >= current.promotion_rank) {
    // A weaker package (e.g. Urgent) must not downgrade an active stronger badge (e.g. Top) — §6.
    const currentExpiry = current.promoted_until ? new Date(current.promoted_until) : null;
    const promotedUntil =
      currentExpiry && currentExpiry > computedExpiry ? currentExpiry : computedExpiry;

    const { error } = await supabase
      .from("listings")
      .update({
        badge: packageRow.badge,
        promotion_rank: packageRow.promotion_rank,
        promoted_until: promotedUntil.toISOString(),
        is_featured: packageRow.badge === "featured" || packageRow.badge === "top",
      })
      .eq("id", listingId);
    if (error) throw error;
  }

  return promotion as AdPromotion;
}

export interface AdPromotionWithDetails extends AdPromotion {
  package: Pick<Package, "name" | "key" | "badge"> | null;
  listing: Pick<Listing, "title" | "slug" | "category_slug" | "city_slug"> | null;
}

export async function getMyPromotions(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("ad_promotions")
    .select("*, package:packages(name, key, badge), listing:listings(title, slug, category_slug, city_slug)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as AdPromotionWithDetails[];
}
