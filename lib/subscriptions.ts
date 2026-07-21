import type { SupabaseClient } from "@supabase/supabase-js";
import type { Subscription } from "@/types/database";

export type SubscriptionTier = "shop" | "dealer" | "business_pro";

export interface TierInfo {
  name: string;
  price: number;
  activeSlotLimit: number;
  featuredCredits: number;
  hotCredits: number;
  refreshCredits: number;
}

/**
 * Fixed business-defined tiers (marketplace-packages-pakistan.md §3) — kept
 * in code, not an admin-editable DB table like `packages`, since these
 * rarely change and each maps 1:1 to a real Lemon Squeezy subscription
 * variant (LEMONSQUEEZY_*_VARIANT_ID env vars) rather than a generic
 * custom-price override.
 */
export const TIER_INFO: Record<SubscriptionTier, TierInfo> = {
  shop: {
    name: "Shop",
    price: 4999,
    activeSlotLimit: 30,
    featuredCredits: 5,
    hotCredits: 0,
    refreshCredits: 30,
  },
  dealer: {
    name: "Dealer",
    price: 12999,
    activeSlotLimit: 100,
    featuredCredits: 20,
    hotCredits: 3,
    refreshCredits: 120,
  },
  business_pro: {
    name: "Business Pro",
    price: 24999,
    activeSlotLimit: 300,
    featuredCredits: 60,
    hotCredits: 10,
    refreshCredits: 400,
  },
};

export const TIER_ORDER: SubscriptionTier[] = ["shop", "dealer", "business_pro"];

export function isSubscriptionTier(value: unknown): value is SubscriptionTier {
  return typeof value === "string" && value in TIER_INFO;
}

export async function getSubscription(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data as Subscription | null;
}
