"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Car,
  ChevronDown,
  Factory,
  Home as HomeIcon,
  PawPrint,
  Smartphone,
  Sofa,
  Shirt,
  Tv,
} from "lucide-react";
import type { Category } from "@/lib/categories";
import { cn } from "@/lib/utils";

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

const categoryDescriptions: Record<string, string> = {
  "property-for-sale": "Houses, plots & commercial property",
  "property-for-rent": "Homes, flats & commercial space",
  vehicles: "Cars, bikes & auto parts",
  mobiles: "Phones, tablets & accessories",
  "electronics-appliances": "TVs, laptops & appliances",
  animals: "Pets, livestock & poultry",
  "furniture-home": "Sofas, beds & home decor",
  "fashion-beauty": "Clothing, watches & footwear",
  "business-industry": "Machinery, equipment & more",
};

/** Cycled across the category cards — kept to our existing tokens rather than introducing new hues. */
const categoryColorPalette = [
  { tile: "bg-primary", glow: "bg-primary/15", pillBg: "bg-primary/10", pillText: "text-primary-text" },
  { tile: "bg-gold", glow: "bg-gold/15", pillBg: "bg-gold/10", pillText: "text-gold" },
  { tile: "bg-success", glow: "bg-success/15", pillBg: "bg-success/10", pillText: "text-success" },
  { tile: "bg-ink", glow: "bg-ink/10", pillBg: "bg-ink/5", pillText: "text-ink" },
  { tile: "bg-primary-hover", glow: "bg-primary-hover/15", pillBg: "bg-primary-hover/10", pillText: "text-primary-hover" },
];

/** How many cards show by default on mobile before "Load more" reveals the rest. Always all on sm+. */
const MOBILE_DEFAULT_COUNT = 5;

export default function CategoryGrid({
  categories,
  categoryCounts,
}: {
  categories: Category[];
  categoryCounts: Record<string, number>;
}) {
  const [expanded, setExpanded] = useState(false);
  const hasMore = categories.length > MOBILE_DEFAULT_COUNT;

  return (
    <>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((c, i) => {
          const Icon = categoryIcons[c.slug] ?? Building2;
          const count = categoryCounts[c.slug] ?? 0;
          const palette = categoryColorPalette[i % categoryColorPalette.length];
          const isExtra = i >= MOBILE_DEFAULT_COUNT;

          return (
            <Link
              key={c.slug}
              href={`/${c.slug}/lahore`}
              className={cn(
                "group relative items-center gap-4 overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[var(--shadow-card-hover)]",
                isExtra && !expanded ? "hidden sm:flex" : "flex"
              )}
            >
              <span
                aria-hidden
                className={cn(
                  "pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full blur-3xl transition-transform duration-500 ease-out group-hover:scale-125",
                  palette.glow
                )}
              />

              <span
                className={cn(
                  "relative z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-white shadow-sm",
                  palette.tile
                )}
              >
                <Icon className="h-6 w-6" />
              </span>

              <div className="relative z-10 min-w-0 flex-1">
                <p className="font-heading text-base font-bold text-ink">{c.name}</p>
                <p className="mt-0.5 line-clamp-2 text-xs text-ink-muted">
                  {categoryDescriptions[c.slug]}
                </p>
                {count > 0 && (
                  <span
                    className={cn(
                      "mt-2 inline-block rounded-full px-2.5 py-1 text-[11px] font-semibold",
                      palette.pillBg,
                      palette.pillText
                    )}
                  >
                    {count.toLocaleString()} Listings
                  </span>
                )}
              </div>

              <span
                aria-hidden
                className={cn(
                  "relative z-10 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white shadow-sm transition-transform duration-300 group-hover:translate-x-0.5",
                  palette.tile
                )}
              >
                <ArrowRight className="h-4 w-4" />
              </span>
            </Link>
          );
        })}
      </div>

      {hasMore && !expanded && (
        <button
          type="button"
          onClick={() => setExpanded(true)}
          className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-md border border-line bg-surface py-2.5 text-sm font-medium text-ink-muted transition-colors hover:border-primary/30 hover:text-primary-text sm:hidden"
        >
          Load more categories
          <ChevronDown className="h-4 w-4" aria-hidden />
        </button>
      )}
    </>
  );
}
