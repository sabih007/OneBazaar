import type { Metadata } from "next";
import { getListings, type SortOption } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import ListingGrid from "@/components/listings/ListingGrid";

export const metadata: Metadata = {
  title: "Search listings",
  robots: { index: false },
};

interface SearchPageProps {
  searchParams: Promise<{ q?: string; sort?: string; page?: string }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams;
  const query = sp.q?.trim() ?? "";

  let listings: Awaited<ReturnType<typeof getListings>>["listings"] = [];
  let total = 0;

  if (isSupabaseConfigured && query) {
    const supabase = await createClient();
    const result = await getListings(supabase, {
      query,
      sort: (sp.sort as SortOption) ?? "recommended",
      page: sp.page ? Number(sp.page) : 1,
    });
    listings = result.listings;
    total = result.total;
  }

  return (
    <div className="container-app py-6">
      <h1 className="font-heading text-2xl font-bold text-ink">
        {query ? `Results for "${query}"` : "Search OneBazaar"}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {query
          ? `${total} listing${total === 1 ? "" : "s"} found`
          : "Use the search bar above to find listings across every category and city."}
      </p>

      <div className="mt-5">
        <ListingGrid
          listings={listings}
          emptyTitle={query ? "No matches" : "Start typing to search"}
          emptyDescription={
            query ? "Try different keywords or browse by category instead." : ""
          }
        />
      </div>
    </div>
  );
}
