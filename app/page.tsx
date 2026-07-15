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
import { expireStalePromotions } from "@/lib/promotions-server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import ListingGrid from "@/components/listings/ListingGrid";
import AdSlot from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import SearchBar from "@/components/layout/SearchBar";

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
    expireStalePromotions(supabase);
    const [featuredResult, latestResult] = await Promise.all([
      getListings(supabase, { sort: "recommended", pageSize: 10 }),
      getListings(supabase, { sort: "newest", pageSize: 10 }),
    ]);
    featured = featuredResult.listings.filter((l) => l.badge === "featured" || l.badge === "top");
    latest = latestResult.listings;
  }

  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-primary-light/70 via-primary-light/20 to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 top-8 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
        />

        <div className="container-app relative py-16 text-center sm:py-24">
          <h1 className="font-heading text-4xl font-bold tracking-tight text-ink sm:text-6xl">
            Buy &amp; sell anything, <span className="text-primary">near you</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-muted sm:text-base">
            Houses, cars, mobiles, and more — across Karachi, Lahore, Islamabad, and every major
            city in Pakistan.
          </p>

          <div className="mx-auto mt-8 max-w-xl">
            <SearchBar />
          </div>

          <div className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
            {cities.slice(0, 6).map((c) => (
              <Link
                key={c.slug}
                href={`/vehicles/${c.slug}`}
                className="rounded-full border border-line bg-surface/80 px-3.5 py-1.5 text-xs font-medium text-ink-muted backdrop-blur transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-[var(--shadow-card)]"
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="container-app py-12">
        <h2 className="font-heading text-2xl font-semibold text-ink">Browse categories</h2>
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 md:grid-cols-5">
          {categories.map((c) => {
            const Icon = categoryIcons[c.slug] ?? Building2;
            return (
              <Link
                key={c.slug}
                href={`/${c.slug}/lahore`}
                className="group flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-5 text-center shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium text-ink">{c.name}</span>
              </Link>
            );
          })}
        </div>
      </section>

      <div className="container-app">
        <AdSlot slot={AD_SLOTS.home} label="Home" />
      </div>

      {featured.length > 0 && (
        <section className="border-t border-line bg-surface/60 py-12">
          <div className="container-app">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-2xl font-semibold text-ink">Featured listings</h2>
              <Link href="/search" className="text-sm font-medium text-primary hover:text-primary-hover">
                View all
              </Link>
            </div>
            <div className="mt-5">
              <ListingGrid listings={featured} />
            </div>
          </div>
        </section>
      )}

      <section className="container-app py-12">
        <div className="flex items-center justify-between">
          <h2 className="font-heading text-2xl font-semibold text-ink">Latest listings</h2>
          <Link href="/search" className="text-sm font-medium text-primary hover:text-primary-hover">
            View all
          </Link>
        </div>
        <div className="mt-5">
          <ListingGrid
            listings={latest}
            emptyTitle="No listings yet"
            emptyDescription="Be the first to post an ad on Sellox."
          />
        </div>
      </section>
    </div>
  );
}
