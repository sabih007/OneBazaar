import type { SupabaseClient } from "@supabase/supabase-js";
import type { Listing } from "@/types/database";
import { slugifyTitle } from "@/lib/seo/slugify";

export type SortOption = "recommended" | "newest" | "price_asc" | "price_desc";

/** Free-tier cap on active listings (marketplace-packages-pakistan.md §1). */
export const FREE_TIER_ACTIVE_LIMIT = 5;

/**
 * Resolves how many active listings a user may have — their subscription
 * tier's `active_slot_limit` (§3) if they have one, else the free-tier
 * default. Mirrors the same lookup `enforce_active_listing_limit`
 * (supabase/migrations/0015) does at the DB level — that trigger is the
 * real guarantee, this is just so app-layer pre-checks show the right
 * number before hitting it.
 */
export async function getActiveSlotLimit(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("subscriptions")
    .select("active_slot_limit")
    .eq("user_id", userId)
    .eq("status", "active")
    .maybeSingle();
  if (error) throw error;
  return (data as { active_slot_limit: number } | null)?.active_slot_limit ?? FREE_TIER_ACTIVE_LIMIT;
}

export interface ListingFilters {
  categorySlug?: string;
  citySlug?: string;
  subcategorySlug?: string;
  condition?: "new" | "used";
  minPrice?: number;
  maxPrice?: number;
  query?: string;
  /** Limit to promoted "Featured"/"Top" listings (matches the homepage Featured section). */
  featured?: boolean;
  sort?: SortOption;
  page?: number;
  pageSize?: number;
}

export async function getListings(supabase: SupabaseClient, filters: ListingFilters) {
  const page = filters.page ?? 1;
  const pageSize = filters.pageSize ?? 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = supabase
    .from("listings")
    .select("*", { count: "exact" })
    .eq("status", "active");

  if (filters.categorySlug) query = query.eq("category_slug", filters.categorySlug);
  if (filters.citySlug) query = query.eq("city_slug", filters.citySlug);
  if (filters.subcategorySlug) query = query.eq("subcategory", filters.subcategorySlug);
  if (filters.condition) query = query.eq("condition", filters.condition);
  if (filters.minPrice !== undefined) query = query.gte("price", filters.minPrice);
  if (filters.maxPrice !== undefined) query = query.lte("price", filters.maxPrice);
  if (filters.query) query = query.ilike("title", `%${filters.query}%`);
  if (filters.featured) query = query.in("badge", ["featured", "top", "hot", "super_hot"]);

  switch (filters.sort) {
    case "price_asc":
      query = query
        .order("promotion_rank", { ascending: false })
        .order("price", { ascending: true });
      break;
    case "price_desc":
      query = query
        .order("promotion_rank", { ascending: false })
        .order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query
        .order("promotion_rank", { ascending: false })
        .order("bumped_at", { ascending: false, nullsFirst: false })
        .order("created_at", { ascending: false });
  }

  query = query.range(from, to);

  const { data, error, count } = await query;
  if (error) throw error;

  return { listings: (data ?? []) as Listing[], total: count ?? 0, page, pageSize };
}

/** Active listing count per category, for the homepage category cards. */
export async function getCategoryCounts(supabase: SupabaseClient): Promise<Record<string, number>> {
  const { data, error } = await supabase.from("listings").select("category_slug").eq("status", "active");
  if (error) throw error;

  const counts: Record<string, number> = {};
  for (const row of data ?? []) {
    counts[row.category_slug] = (counts[row.category_slug] ?? 0) + 1;
  }
  return counts;
}

export async function getListingBySlug(
  supabase: SupabaseClient,
  citySlug: string,
  listingSlug: string
) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("city_slug", citySlug)
    .eq("slug", listingSlug)
    .maybeSingle();

  if (error) throw error;
  return data as Listing | null;
}

export async function getSimilarListings(
  supabase: SupabaseClient,
  listing: Pick<Listing, "id" | "category_slug" | "city_slug">
) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("status", "active")
    .eq("category_slug", listing.category_slug)
    .eq("city_slug", listing.city_slug)
    .neq("id", listing.id)
    .order("promotion_rank", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(6);

  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function getMyListings(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as Listing[];
}

export async function getFavoriteListings(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("favorites")
    .select("listing:listings(*)")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return ((data ?? []) as unknown as { listing: Listing | null }[])
    .map((row) => row.listing)
    .filter((listing): listing is Listing => listing !== null);
}

/** IDs of listings the user has favorited, for marking hearts filled in a listing grid/slider. */
export async function getFavoritedListingIds(
  supabase: SupabaseClient,
  userId: string
): Promise<Set<string>> {
  const { data, error } = await supabase.from("favorites").select("listing_id").eq("user_id", userId);
  if (error) throw error;
  return new Set((data ?? []).map((row) => row.listing_id));
}

export async function incrementListingViews(supabase: SupabaseClient, listingId: string) {
  await supabase.rpc("increment_listing_views", { p_listing_id: listingId });
}

export interface NewListingInput {
  userId: string;
  title: string;
  description: string;
  price: number;
  categorySlug: string;
  categoryName: string;
  subcategorySlug: string | null;
  condition: "new" | "used" | null;
  citySlug: string;
  cityName: string;
  area: string | null;
  images: string[];
  attributes: Record<string, string | number | boolean | null>;
}

export async function createListing(supabase: SupabaseClient, input: NewListingInput) {
  const id = crypto.randomUUID();
  const slug = slugifyTitle(input.title, id);

  const { data, error } = await supabase
    .from("listings")
    .insert({
      id,
      user_id: input.userId,
      title: input.title,
      slug,
      description: input.description,
      price: input.price,
      category: input.categoryName,
      category_slug: input.categorySlug,
      subcategory: input.subcategorySlug,
      condition: input.condition,
      attributes: input.attributes,
      city: input.cityName,
      city_slug: input.citySlug,
      area: input.area,
      images: input.images,
    })
    .select()
    .single();

  if (error) throw error;
  return data as Listing;
}

export async function updateListing(
  supabase: SupabaseClient,
  id: string,
  patch: Partial<
    Pick<
      Listing,
      | "title"
      | "description"
      | "price"
      | "subcategory"
      | "condition"
      | "attributes"
      | "area"
      | "images"
      | "status"
    >
  >
) {
  const { error } = await supabase.from("listings").update(patch).eq("id", id);
  if (error) throw error;
}

export async function deleteListing(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("listings").delete().eq("id", id);
  if (error) throw error;
}

export async function markListingSold(supabase: SupabaseClient, id: string) {
  await updateListing(supabase, id, { status: "sold" });
}

export async function repostListing(supabase: SupabaseClient, id: string) {
  const { error } = await supabase
    .from("listings")
    .update({
      status: "active",
      bumped_at: new Date().toISOString(),
      expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    })
    .eq("id", id);
  if (error) throw error;
}

export async function toggleFavorite(
  supabase: SupabaseClient,
  userId: string,
  listingId: string,
  isFavorited: boolean
) {
  if (isFavorited) {
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("user_id", userId)
      .eq("listing_id", listingId);
    if (error) throw error;
    return false;
  }

  const { error } = await supabase
    .from("favorites")
    .insert({ user_id: userId, listing_id: listingId });
  if (error) throw error;
  return true;
}
