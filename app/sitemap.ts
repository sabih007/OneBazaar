import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { createPublicClient } from "@/lib/supabase/public";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

// Google's per-sitemap limit is 50,000 URLs; leave headroom for the static entries.
const MAX_LISTINGS = 45000;

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
  ];

  if (isSupabaseConfigured) {
    const supabase = createPublicClient();
    const { data } = await supabase
      .from("listings")
      .select("category_slug, city_slug, slug, created_at")
      .eq("status", "active")
      .order("promotion_rank", { ascending: false })
      .order("created_at", { ascending: false })
      .range(0, MAX_LISTINGS - 1);

    // Only submit category × city pages that actually have inventory —
    // an empty browse page is worse for crawl budget/ranking than not
    // listing it at all.
    const combosWithInventory = new Set<string>();

    for (const listing of data ?? []) {
      combosWithInventory.add(`${listing.category_slug}/${listing.city_slug}`);
      entries.push({
        url: `${SITE_URL}/${listing.category_slug}/${listing.city_slug}/${listing.slug}`,
        lastModified: listing.created_at,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const category of categories) {
      for (const city of cities) {
        if (!combosWithInventory.has(`${category.slug}/${city.slug}`)) continue;
        entries.push({
          url: `${SITE_URL}/${category.slug}/${city.slug}`,
          changeFrequency: "daily",
          priority: 0.8,
        });
      }
    }
  }

  return entries;
}
