"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, PackageSearch } from "lucide-react";
import type { Listing } from "@/types/database";
import ListingCard from "@/components/listings/ListingCard";

interface ListingSliderProps {
  listings: Listing[];
  userId?: string | null;
  favoritedIds?: Set<string>;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ListingSlider({
  listings,
  userId,
  favoritedIds,
  emptyTitle = "No listings yet",
  emptyDescription = "Be the first to post an ad on Buysellox.com.",
}: ListingSliderProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

  const updateArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft < maxScroll - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = trackRef.current;
    if (!el) return;
    el.addEventListener("scroll", updateArrows, { passive: true });
    window.addEventListener("resize", updateArrows);
    return () => {
      el.removeEventListener("scroll", updateArrows);
      window.removeEventListener("resize", updateArrows);
    };
  }, [updateArrows, listings.length]);

  function scrollByPage(direction: 1 | -1) {
    const el = trackRef.current;
    if (!el) return;
    // Advance by roughly one viewport of cards.
    el.scrollBy({ left: direction * el.clientWidth * 0.9, behavior: "smooth" });
  }

  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-line bg-surface px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <PackageSearch className="h-8 w-8 text-primary" aria-hidden />
        </span>
        <p className="mt-4 font-heading text-lg font-semibold text-ink">{emptyTitle}</p>
        <p className="mt-1 text-sm text-ink-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="relative">
      <div
        ref={trackRef}
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth pb-2 sm:gap-5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {listings.map((listing) => (
          <div
            key={listing.id}
            className="w-[calc((100%-1rem)/2)] shrink-0 snap-start sm:w-[calc((100%-2.5rem)/3)] lg:w-[calc((100%-5rem)/5)]"
          >
            <ListingCard
              listing={listing}
              userId={userId}
              isFavorited={favoritedIds?.has(listing.id) ?? false}
            />
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={() => scrollByPage(-1)}
        disabled={!canPrev}
        aria-label="Previous listings"
        className="absolute -left-3 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-[var(--shadow-card)] transition-opacity hover:text-primary disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronLeft className="h-5 w-5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => scrollByPage(1)}
        disabled={!canNext}
        aria-label="Next listings"
        className="absolute -right-3 top-[38%] hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-line bg-surface text-ink shadow-[var(--shadow-card)] transition-opacity hover:text-primary disabled:pointer-events-none disabled:opacity-0 sm:flex"
      >
        <ChevronRight className="h-5 w-5" aria-hidden />
      </button>
    </div>
  );
}
