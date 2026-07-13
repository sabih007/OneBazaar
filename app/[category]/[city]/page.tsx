import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { getListings, type SortOption } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { breadcrumbListJsonLd, toJsonLdScript } from "@/lib/seo/jsonld";
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

  const title = `${category.name} in ${city.name} — Buy & Sell | OneBazaar`;
  const description = `Find the best deals on ${category.name.toLowerCase()} in ${city.name}. Browse verified listings on OneBazaar. Post your ad free.`;

  return {
    title,
    description,
    alternates: { canonical: `/${category.slug}/${city.slug}` },
    openGraph: { title, description },
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

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const result = await getListings(supabase, {
      categorySlug: category.slug,
      citySlug: city.slug,
      subcategorySlug: sp.sub,
      condition: sp.condition as "new" | "used" | undefined,
      minPrice: sp.min ? Number(sp.min) : undefined,
      maxPrice: sp.max ? Number(sp.max) : undefined,
      sort: (sp.sort as SortOption) ?? "recommended",
      page: sp.page ? Number(sp.page) : 1,
    });
    listings = result.listings;
    total = result.total;
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
        <Filters subcategories={category.subcategories} hasCondition={category.hasCondition} />
      </div>

      <div className="mt-5">
        <ListingGrid
          listings={listings}
          emptyTitle={`No ${category.name.toLowerCase()} in ${city.name} yet`}
          emptyDescription="Be the first to post one, or try a different city or filter."
        />
      </div>
    </div>
  );
}
