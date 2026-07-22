import type { SupabaseClient } from "@supabase/supabase-js";

export interface SavedSearch {
  id: string;
  category_slug: string;
  city_slug: string;
  subcategory_slug: string | null;
  condition: "new" | "used" | null;
  min_price: number | null;
  max_price: number | null;
  created_at: string;
}

export interface SavedSearchInput {
  userId: string;
  email: string;
  categorySlug: string;
  citySlug: string;
  subcategorySlug?: string | null;
  condition?: "new" | "used" | null;
  minPrice?: number | null;
  maxPrice?: number | null;
}

export async function createSavedSearch(supabase: SupabaseClient, input: SavedSearchInput) {
  const { error } = await supabase.from("saved_searches").insert({
    user_id: input.userId,
    email: input.email,
    category_slug: input.categorySlug,
    city_slug: input.citySlug,
    subcategory_slug: input.subcategorySlug ?? null,
    condition: input.condition ?? null,
    min_price: input.minPrice ?? null,
    max_price: input.maxPrice ?? null,
  });
  if (error) throw error;
}

export async function getSavedSearches(
  supabase: SupabaseClient,
  userId: string
): Promise<SavedSearch[]> {
  const { data, error } = await supabase
    .from("saved_searches")
    .select("id, category_slug, city_slug, subcategory_slug, condition, min_price, max_price, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function deleteSavedSearch(supabase: SupabaseClient, id: string) {
  const { error } = await supabase.from("saved_searches").delete().eq("id", id);
  if (error) throw error;
}
