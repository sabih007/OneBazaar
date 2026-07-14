"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Heart, ImageOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Listing } from "@/types/database";
import { formatPKR, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/listings";
import PromoBadge from "@/components/listings/PromoBadge";

interface ListingCardProps {
  listing: Listing;
  userId?: string | null;
  isFavorited?: boolean;
}

export default function ListingCard({ listing, userId, isFavorited = false }: ListingCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [pending, setPending] = useState(false);
  const cover = listing.images?.[0];

  async function onToggleFavorite(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!userId || pending) return;

    const previous = favorited;
    setFavorited(!previous); // optimistic — flip immediately, roll back on failure
    setPending(true);
    try {
      await toggleFavorite(createClient(), userId, listing.id, previous);
    } catch {
      setFavorited(previous);
    } finally {
      setPending(false);
    }
  }

  const href = `/${listing.category_slug}/${listing.city_slug}/${listing.slug}`;

  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-md border border-line bg-surface shadow-[var(--shadow-card)] transition-shadow duration-200 hover:shadow-[var(--shadow-card-hover)]"
    >
      <div className="relative aspect-[4/3] w-full bg-background">
        {cover ? (
          <Image
            src={cover}
            alt={listing.title}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <ImageOff className="h-8 w-8" />
          </div>
        )}

        {listing.badge && <PromoBadge badge={listing.badge} className="absolute left-2 top-2" />}

        <button
          onClick={onToggleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={favorited}
          className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full bg-surface/90 backdrop-blur transition-transform duration-150 hover:scale-105"
        >
          <Heart
            className={cn("h-4.5 w-4.5", favorited ? "fill-danger text-danger" : "text-ink-muted")}
          />
        </button>
      </div>

      <div className="p-3">
        <p className="font-heading text-lg font-bold text-ink">{formatPKR(listing.price)}</p>
        <h3 className="mt-0.5 truncate text-sm text-ink" title={listing.title}>
          {listing.title}
        </h3>
        <p className="mt-1 truncate text-xs text-ink-muted">
          {listing.city}
          {listing.area ? `, ${listing.area}` : ""} ·{" "}
          {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
        </p>
      </div>
    </Link>
  );
}
