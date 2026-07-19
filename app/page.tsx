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
  ArrowRight,
  ShieldCheck,
  Tag,
  MapPin,
  CirclePlus,
  MessageCircle,
  Handshake,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import { getListings } from "@/lib/listings";
import { expireStalePromotions } from "@/lib/promotions-server";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import ListingGrid from "@/components/listings/ListingGrid";
import ListingSlider from "@/components/listings/ListingSlider";
import AdSlot from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/ads";
import SearchBar from "@/components/layout/SearchBar";

export const revalidate = 60;

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

const howItWorks = [
  {
    icon: CirclePlus,
    title: "Post your ad",
    description: "Create a free listing with photos in under a minute.",
  },
  {
    icon: MessageCircle,
    title: "Connect with buyers",
    description: "Chat directly with interested, local buyers and sellers.",
  },
  {
    icon: Handshake,
    title: "Close the deal",
    description: "Meet up safely and make the deal that works for you.",
  },
];

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

          <div className="mx-auto mt-8 flex max-w-2xl flex-wrap items-center justify-center gap-x-6 gap-y-3 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Safe &amp; secure deals
            </span>
            <span className="inline-flex items-center gap-2">
              <Tag className="h-4 w-4 text-primary" aria-hidden />
              100% free to post
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4 text-primary" aria-hidden />
              Every major city in Pakistan
            </span>
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
              <Link
                href="/search?featured=1"
                className="inline-flex items-center gap-1 rounded-full bg-primary-light px-3.5 py-1.5 text-sm font-medium text-primary transition-colors hover:bg-primary hover:text-white"
              >
                View all
                <ArrowRight className="h-3.5 w-3.5" aria-hidden />
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
          <Link href="/search?sort=newest" className="text-sm font-medium text-primary hover:text-primary-hover">
            View all
          </Link>
        </div>
        <div className="mt-5">
          <ListingSlider
            listings={latest}
            emptyTitle="No listings yet"
            emptyDescription="Be the first to post an ad on Buysellox.com."
          />
        </div>
      </section>

      <section className="border-t border-line bg-surface/60 py-14">
        <div className="container-app">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
              How Buysellox works
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
              Buy or sell in three simple steps.
            </p>
          </div>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {howItWorks.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={step.title}
                  className="relative rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)]"
                >
                  <span className="absolute right-4 top-4 font-heading text-3xl font-bold text-primary-light">
                    {i + 1}
                  </span>
                  <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary-light text-primary">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{step.title}</h3>
                  <p className="mt-1.5 text-sm text-ink-muted">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="container-app py-16">
        <div className="relative overflow-hidden rounded-[var(--radius-lg)] bg-gradient-to-r from-primary to-primary-hover px-6 py-12 text-center sm:px-12">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-10 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          />
          <div
            aria-hidden
            className="pointer-events-none absolute -bottom-12 -left-8 h-48 w-48 rounded-full bg-white/10 blur-2xl"
          />
          <h2 className="relative font-heading text-2xl font-bold text-white sm:text-3xl">
            Got something to sell?
          </h2>
          <p className="relative mx-auto mt-2 max-w-lg text-sm text-white/90">
            Reach thousands of buyers across Pakistan. Posting your ad is quick, easy, and free.
          </p>
          <Link
            href="/post"
            className="relative mt-6 inline-flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-semibold text-primary shadow-sm transition-transform hover:-translate-y-0.5"
          >
            <CirclePlus className="h-4.5 w-4.5" aria-hidden />
            Post your ad free
          </Link>
        </div>
      </section>
    </div>
  );
}
