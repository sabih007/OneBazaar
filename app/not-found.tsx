import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
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
  ArrowLeft,
  Plus,
} from "lucide-react";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import SearchBar from "@/components/layout/SearchBar";
import { Button } from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

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

export default function NotFound() {
  const popularCategories = categories.slice(0, 6);
  const popularCities = cities.slice(0, 6);

  return (
    <section className="relative overflow-hidden">
      {/* Decorative background glow, matching the homepage hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-10 h-64 w-64 rounded-full bg-gold/20 blur-3xl"
      />

      <div className="container-app relative flex flex-col items-center py-16 text-center sm:py-24">
        {/* 404 — the circular-arrows logo mark stands in for the zero */}
        <div className="flex items-center justify-center gap-1 sm:gap-3">
          <span className="font-heading text-[6.5rem] font-bold leading-none text-primary sm:text-[10rem]">
            4
          </span>
          <Image
            src="/android-chrome-512x512.png"
            alt="0"
            width={512}
            height={512}
            priority
            className="h-24 w-24 animate-[spin_7s_linear_infinite] drop-shadow-sm sm:h-40 sm:w-40"
          />
          <span className="font-heading text-[6.5rem] font-bold leading-none text-primary sm:text-[10rem]">
            4
          </span>
        </div>

        <h1 className="mt-6 font-heading text-3xl font-bold text-ink sm:text-4xl">
          This page has been sold out
        </h1>
        <p className="mt-3 max-w-xl text-base text-ink-muted">
          The page or listing you&apos;re looking for may have been removed, sold, or never
          existed. Let&apos;s help you find what you need instead.
        </p>

        {/* Search */}
        <div className="mt-8 flex w-full justify-center">
          <SearchBar />
        </div>

        {/* Primary actions */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="lg" className="gap-2">
              <ArrowLeft aria-hidden className="h-4 w-4" />
              Back to homepage
            </Button>
          </Link>
          <Link href="/post">
            <Button variant="secondary" size="lg" className="gap-2">
              <Plus aria-hidden className="h-4 w-4" />
              Post an ad
            </Button>
          </Link>
        </div>

        {/* Popular categories */}
        <div className="mt-14 w-full">
          <h2 className="font-heading text-lg font-semibold text-ink">Browse popular categories</h2>
          <div className="mx-auto mt-5 grid max-w-3xl grid-cols-2 gap-3 sm:grid-cols-3">
            {popularCategories.map((c) => {
              const Icon = categoryIcons[c.slug] ?? Building2;
              return (
                <Link
                  key={c.slug}
                  href={`/${c.slug}/lahore`}
                  className="group flex items-center gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-4 text-left shadow-[var(--shadow-card)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/20 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary transition-colors duration-300 group-hover:bg-primary group-hover:text-white">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-sm font-medium text-ink">{c.name}</span>
                  <ArrowRight
                    aria-hidden
                    className="ml-auto h-4 w-4 text-ink-muted opacity-0 transition-all duration-300 group-hover:translate-x-0.5 group-hover:opacity-100"
                  />
                </Link>
              );
            })}
          </div>
        </div>

        {/* Popular cities */}
        <div className="mt-10 w-full">
          <h2 className="font-heading text-lg font-semibold text-ink">Popular cities</h2>
          <div className="mt-4 flex flex-wrap justify-center gap-2">
            {popularCities.map((city) => (
              <Link
                key={city.slug}
                href={`/vehicles/${city.slug}`}
                className="rounded-full border border-line bg-surface px-4 py-1.5 text-sm font-medium text-ink-muted transition-all hover:-translate-y-0.5 hover:border-primary hover:text-primary hover:shadow-[var(--shadow-card)]"
              >
                {city.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
