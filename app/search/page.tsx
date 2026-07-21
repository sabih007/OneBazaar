import type { Metadata } from "next";
import { getFavoritedListingIds, getListings, type SortOption } from "@/lib/listings";
import { expireStalePromotions } from "@/lib/promotions-server";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import ListingGrid from "@/components/listings/ListingGrid";
import AdSlot from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/ads";

export const metadata: Metadata = {
  title: "Search listings",
  robots: { index: false },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string; featured?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";
  const featuredOnly = sp.featured === "1";

  let listings: Awaited<ReturnType<typeof getListings>>["listings"] = [];
  let total = 0;
  let userId: string | null = null;
  let favoritedIds = new Set<string>();

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    expireStalePromotions(supabase);
    const user = await getUser();
    userId = user?.id ?? null;

    const [result, favorited] = await Promise.all([
      getListings(supabase, {
        query: query || undefined,
        featured: featuredOnly || undefined,
        sort: (sp.sort as SortOption) ?? (featuredOnly ? "recommended" : "newest"),
        page: sp.page ? Number(sp.page) : 1,
      }),
      userId ? getFavoritedListingIds(supabase, userId) : Promise.resolve(new Set<string>()),
    ]);
    listings = result.listings;
    total = result.total;
    favoritedIds = favorited;
  }

  const heading = query
    ? `Results for "${query}"`
    : featuredOnly
      ? "Featured listings"
      : "Browse listings";

  return (
    <div className="container-app py-6">
      <h1 className="font-heading text-2xl font-bold text-ink">{heading}</h1>
      <p className="mt-1 text-sm text-ink-muted">
        {`${total} listing${total === 1 ? "" : "s"} found`}
      </p>

      <div className="mt-5">
        <AdSlot slot={AD_SLOTS.search} label="Search" className="mb-5" />
        <ListingGrid
          listings={listings}
          userId={userId}
          favoritedIds={favoritedIds}
          emptyTitle={query ? "No matches" : featuredOnly ? "No featured listings yet" : "No listings yet"}
          emptyDescription={
            query
              ? "Try different keywords or browse by category instead."
              : "Check back soon — new ads are posted every day."
          }
        />
      </div>
    </div>
  );
}
