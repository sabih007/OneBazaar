"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { MapPin } from "lucide-react";
import type { Listing } from "@/types/database";
import ListingSlider from "@/components/listings/ListingSlider";

interface NearbyListingsSectionProps {
  userId: string | null;
  favoritedIds: Set<string>;
}

/**
 * Client-side counterpart to the server-resolved "Near You" section in
 * app/page.tsx — used when there's no profile city to derive an origin from
 * (guests, or logged-in users who never set one). Asks the browser for the
 * visitor's location and, if granted, fetches nearby listings itself; stays
 * hidden entirely if permission is denied or unavailable.
 */
export default function NearbyListingsSection({ userId, favoritedIds }: NearbyListingsSectionProps) {
  const [listings, setListings] = useState<Listing[]>([]);

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    let cancelled = false;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        if (cancelled) return;
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(`/api/listings/nearby?lat=${latitude}&lng=${longitude}`);
          if (!res.ok || cancelled) return;
          const data = (await res.json()) as { listings?: Listing[] };
          if (!cancelled) setListings(data.listings ?? []);
        } catch {
          // Fetch failed — section just stays hidden, same as permission denied.
        }
      },
      () => {
        // Permission denied / position unavailable — stay hidden.
      },
      { timeout: 8000, maximumAge: 10 * 60 * 1000 }
    );

    return () => {
      cancelled = true;
    };
  }, []);

  if (listings.length === 0) return null;

  return (
    <section className="container-app py-12">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 font-heading text-2xl font-semibold text-ink">
          <MapPin className="h-5 w-5 text-primary-text" aria-hidden />
          Near You
        </h2>
        <Link href="/search" className="text-sm font-medium text-primary-text hover:text-primary-text-hover">
          View all
        </Link>
      </div>
      <div className="mt-5">
        <ListingSlider
          listings={listings}
          userId={userId}
          favoritedIds={favoritedIds}
          emptyTitle="No nearby listings yet"
          emptyDescription="Check back soon."
        />
      </div>
    </section>
  );
}
