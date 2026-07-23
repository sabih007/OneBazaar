import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import {
  getFavoritedListingIds,
  getListingCount,
  getListings,
  MIN_LISTINGS_TO_INDEX,
  type SortOption,
} from "@/lib/listings";
import { expireStalePromotions } from "@/lib/promotions-server";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { breadcrumbListJsonLd, itemListJsonLd, toJsonLdScript } from "@/lib/seo/jsonld";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Filters from "@/components/listings/Filters";
import ListingGrid from "@/components/listings/ListingGrid";

interface PageParams {
  category: string;
  city: string;
}

interface BrowsePageProps {
  params: Promise<PageParams>;
  searchParams: Promise<Record<string, string | undefined>>;
}

export async function generateMetadata({ params }: BrowsePageProps): Promise<Metadata> {
  const { category: categorySlug, city: citySlug } = await params;
  const category = getCategory(categorySlug);
  const city = getCity(citySlug);
  if (!category || !city) return {};

  const categoryLower = category.name.toLowerCase();
  const title = `${category.name} Classified Ads in ${city.name} | Buysellox.com`;
  const description = `Free classified ads for ${categoryLower} in ${city.name}, Pakistan. Browse ${category.subcategories.length ? `${category.subcategories.map((s) => s.name.toLowerCase()).slice(0, 3).join(", ")} and more — ` : ""}thousands of verified listings with prices in Rs. on Buysellox.com. Post your classified ad free, no commission.`;
  const canonical = `/${category.slug}/${city.slug}`;

  // Thin/empty category×city combinations (there are hundreds) shouldn't be
  // indexed until they actually have inventory — noindex, not nofollow, so
  // Google still crawls through to real listings linked from the page.
  let hasEnoughListings = false;
  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const count = await getListingCount(supabase, { categorySlug: category.slug, citySlug: city.slug });
    hasEnoughListings = count >= MIN_LISTINGS_TO_INDEX;
  }

  return {
    title,
    description,
    alternates: { canonical },
    robots: { index: hasEnoughListings, follow: true },
    openGraph: { title, description, url: canonical, type: "website", locale: "en_PK" },
  };
}

export default async function BrowsePage({ params, searchParams }: BrowsePageProps) {
  const { category: categorySlug, city: citySlug } = await params;
  const sp = await searchParams;

  const category = getCategory(categorySlug);
  const city = getCity(citySlug);
  if (!category || !city) notFound();

  let listings: Awaited<ReturnType<typeof getListings>>["listings"] = [];
  let total = 0;
  let userId: string | null = null;
  let userEmail: string | null = null;
  let favoritedIds = new Set<string>();

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    expireStalePromotions(supabase);
    const user = await getUser();
    userId = user?.id ?? null;
    userEmail = user?.email ?? null;

    const [result, favorited] = await Promise.all([
      getListings(supabase, {
        categorySlug: category.slug,
        citySlug: city.slug,
        subcategorySlug: sp.sub,
        condition: sp.condition as "new" | "used" | undefined,
        minPrice: sp.min ? Number(sp.min) : undefined,
        maxPrice: sp.max ? Number(sp.max) : undefined,
        sort: (sp.sort as SortOption) ?? "recommended",
        page: sp.page ? Number(sp.page) : 1,
      }),
      userId ? getFavoritedListingIds(supabase, userId) : Promise.resolve(new Set<string>()),
    ]);
    listings = result.listings;
    total = result.total;
    favoritedIds = favorited;
  }

  const breadcrumbs = [
    { name: "Home", url: "/" },
    { name: category.name, url: `/${category.slug}/${city.slug}` },
    { name: city.name, url: `/${category.slug}/${city.slug}` },
  ];

  return (
    <div className="container-app py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: toJsonLdScript(breadcrumbListJsonLd(breadcrumbs)) }}
      />
      {listings.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: toJsonLdScript(
              itemListJsonLd(
                listings.map((l) => ({
                  name: l.title,
                  url: `/${l.category_slug}/${l.city_slug}/${l.slug}`,
                }))
              )
            ),
          }}
        />
      )}

      <Breadcrumbs
        items={[
          { label: "Home", href: "/" },
          { label: category.name, href: `/${category.slug}/${city.slug}` },
          { label: city.name },
        ]}
      />

      <h1 className="mt-2 font-heading text-2xl font-bold text-ink sm:text-3xl">
        {category.name} in {city.name}
      </h1>
      <p className="mt-1 text-sm text-ink-muted">
        {total > 0 ? `${total} listing${total === 1 ? "" : "s"} found` : "Browse the latest ads"}
      </p>

      <div className="mt-5">
        <Filters
          subcategories={category.subcategories}
          hasCondition={category.hasCondition}
          categorySlug={category.slug}
          citySlug={city.slug}
          userId={userId}
          userEmail={userEmail}
        />
      </div>

      <div className="mt-5">
        <ListingGrid
          listings={listings}
          userId={userId}
          favoritedIds={favoritedIds}
          emptyTitle={`No ${category.name.toLowerCase()} in ${city.name} yet`}
          emptyDescription="Be the first to post one, or try a different city or filter."
        />
      </div>
    </div>
  );
}
