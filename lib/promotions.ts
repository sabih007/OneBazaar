import type { SupabaseClient } from "@supabase/supabase-js";
import type { AdPromotion, Listing, Package, PaymentMethod } from "@/types/database";

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

/** Applies a package's badge/rank (or bump) to its listing. Shared by every payment path. */
async function applyPackageToListing(
  supabase: SupabaseClient,
  { listingId, packageRow }: { listingId: string; packageRow: Package }
) {
  const now = new Date();
  const isBump = packageRow.key === "bump";
  const computedExpiry = new Date(now.getTime() + packageRow.duration_days * 24 * 60 * 60 * 1000);

  if (isBump) {
    const { error } = await supabase
      .from("listings")
      .update({ bumped_at: now.toISOString() })
      .eq("id", listingId);
    if (error) throw error;
    return;
  }

  const { data: listing, error: listingError } = await supabase
    .from("listings")
    .select("promotion_rank, promoted_until")
    .eq("id", listingId)
    .single();
  if (listingError) throw listingError;
  const current = listing as Pick<Listing, "promotion_rank" | "promoted_until">;

  if (packageRow.promotion_rank < current.promotion_rank) return; // §6: don't downgrade an active stronger badge

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

function computeExpiresAt(packageRow: Package) {
  const now = new Date();
  if (packageRow.key === "bump") return now;
  return new Date(now.getTime() + packageRow.duration_days * 24 * 60 * 60 * 1000);
}

export interface PurchasePromotionInput {
  listingId: string;
  userId: string;
  packageId: string;
  paymentMethod: PaymentMethod;
}

/** Mock/manual payment — settles instantly, no external gateway round trip (§6 MVP path). */
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

  const now = new Date();
  const { data: promotion, error: insertError } = await supabase
    .from("ad_promotions")
    .insert({
      listing_id: listingId,
      user_id: userId,
      package_id: packageId,
      starts_at: now.toISOString(),
      expires_at: computeExpiresAt(packageRow).toISOString(),
      amount: packageRow.price,
      payment_method: paymentMethod,
      payment_status: "paid",
    })
    .select()
    .single();
  if (insertError) throw insertError;

  await applyPackageToListing(supabase, { listingId, packageRow });

  return promotion as AdPromotion;
}

/** Starts a real-gateway purchase: records the attempt as `pending` before redirecting off-site. */
export async function createPendingPromotion(
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

  const now = new Date();
  const { data: promotion, error: insertError } = await supabase
    .from("ad_promotions")
    .insert({
      listing_id: listingId,
      user_id: userId,
      package_id: packageId,
      starts_at: now.toISOString(),
      expires_at: computeExpiresAt(packageRow).toISOString(),
      amount: packageRow.price,
      payment_method: paymentMethod,
      payment_status: "pending",
    })
    .select()
    .single();
  if (insertError) throw insertError;

  return { promotion: promotion as AdPromotion, packageRow };
}

/** Confirms a real-gateway payment succeeded and applies it — called from the callback route only. */
export async function markPromotionPaid(
  supabase: SupabaseClient,
  { promotionId, paymentRef }: { promotionId: string; paymentRef: string }
) {
  const { data: promotion, error } = await supabase
    .from("ad_promotions")
    .update({ payment_status: "paid", payment_ref: paymentRef })
    .eq("id", promotionId)
    .select("listing_id, package_id")
    .single();
  if (error) throw error;

  const { data: pkg, error: pkgError } = await supabase
    .from("packages")
    .select("*")
    .eq("id", promotion.package_id)
    .single();
  if (pkgError) throw pkgError;

  await applyPackageToListing(supabase, { listingId: promotion.listing_id, packageRow: pkg as Package });
}

export async function markPromotionFailed(
  supabase: SupabaseClient,
  { promotionId, paymentRef }: { promotionId: string; paymentRef?: string }
) {
  const { error } = await supabase
    .from("ad_promotions")
    .update({ payment_status: "failed", payment_ref: paymentRef ?? null })
    .eq("id", promotionId);
  if (error) throw error;
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
