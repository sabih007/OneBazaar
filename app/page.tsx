import Link from "next/link";
import {
  Building2,
  Car,
  Smartphone,
  Tv,
  PawPrint,
  Sofa,
  Shirt,
  Factory,
  Home as HomeIcon,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { getListings } from "@/lib/listings";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import ListingGrid from "@/components/listings/ListingGrid";

const categoryIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  "property-for-sale": Building2,
  "property-for-rent": HomeIcon,
  vehicles: Car,
  mobiles: Smartphone,
  "electronics-appliances": Tv,
  animals: PawPrint,
  "furniture-home": Sofa,
  "fashion-beauty": Shirt,
  "business-industry": Factory,
};

export default async function Home() {
  let featured: Awaited<ReturnType<typeof getListings>>["listings"] = [];
  let latest: Awaited<ReturnType<typeof getListings>>["listings"] = [];

  if (isSupabaseConfigured) {
    const supabase = await createClient();
    const [featuredResult, latestResult] = await Promise.all([
      getListings(supabase, { sort: "recommended", pageSize: 10 }),
      getListings(supabase, { sort: "newest", pageSize: 10 }),
    ]);
    featured = featuredResult.listings.filter((l) => l.badge === "featured" || l.badge === "top");
    latest = latestResult.listings;
  }

  return (
    <div>
      <section className="border-b border-line bg-gradient-to-b from-primary-light/60 to-background">
        <div className="container-app py-14 text-center sm:py-20">
          <h1 className="font-heading text-3xl font-bold tracking-tight text-ink sm:text-5xl">
            Buy &amp; sell anything, <span className="text-primary">near you</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted sm:text-base">
            Houses, cars, mobiles, and more — across Karachi, Lahore, Islamabad, and every major
            city in Pakistan.
          </p>
          <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
            {cities.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/vehicles/${c.slug}`}
                className="rounded-full border border-line bg-surface px-3.5 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-primary hover:text-primary"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-10">
        <h2 className="font-heading text-xl font-semibold text-ink">Browse categories</h2>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
          {categories.map((c) => {
            const Icon = categoryIcons[c.slug] ?? Building2;
            return (
              <Link
                key={c.slug}
                href={`/${c.slug}/lahore`}
                className="group flex flex-col items-center gap-2.5 rounded-md border border-line bg-surface p-5 text-center shadow-[var(--shadow-card)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-primary-light text-primary transition-colors group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      {featured.length > 0 && (
        <section className="container-app py-10">
          <h2 className="font-heading text-xl font-semibold text-ink">Featured listings</h2>
          <div className="mt-4">
            <ListingGrid listings={featured} />
          </div>
        </section>
      )}

      <section className="container-app py-10">
        <h2 className="font-heading text-xl font-semibold text-ink">Latest listings</h2>
        <div className="mt-4">
          <ListingGrid
            listings={latest}
            emptyTitle="No listings yet"
            emptyDescription="Be the first to post an ad on OneBazaar."
          />
        </div>
      </section>
    </div>
  );
}
