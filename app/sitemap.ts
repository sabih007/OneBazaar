import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo/site";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { MIN_LISTINGS_TO_INDEX } from "@/lib/listings";
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

    // Only submit category × city pages that meet the same MIN_LISTINGS_TO_INDEX
    // bar the page itself uses to decide index vs. noindex (lib/listings.ts) —
    // otherwise the sitemap would submit URLs Google's told to skip anyway.
    const listingCountByCombo = new Map<string, number>();

    for (const listing of data ?? []) {
      const combo = `${listing.category_slug}/${listing.city_slug}`;
      listingCountByCombo.set(combo, (listingCountByCombo.get(combo) ?? 0) + 1);
      entries.push({
        url: `${SITE_URL}/${listing.category_slug}/${listing.city_slug}/${listing.slug}`,
        lastModified: listing.created_at,
        changeFrequency: "weekly",
        priority: 0.6,
      });
    }

    for (const category of categories) {
      for (const city of cities) {
        const count = listingCountByCombo.get(`${category.slug}/${city.slug}`) ?? 0;
        if (count < MIN_LISTINGS_TO_INDEX) continue;
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
