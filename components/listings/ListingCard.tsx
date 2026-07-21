"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Eye, Heart, ImageOff, MapPin } from "lucide-react";
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
  /** "featured" renders a larger, higher-contrast card for spotlight rails. */
  variant?: "default" | "featured";
}

export default function ListingCard({
  listing,
  userId,
  isFavorited = false,
  variant = "default",
}: ListingCardProps) {
  const [favorited, setFavorited] = useState(isFavorited);
  const [pending, setPending] = useState(false);
  const cover = listing.images?.[0];
  const isFeatured = variant === "featured";

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
      className={cn(
        "group relative flex h-full flex-col overflow-hidden rounded-[var(--radius-lg)] bg-surface transition-all duration-300 ease-out",
        isFeatured
          ? "border-2 border-gold/25 shadow-[0_10px_24px_-14px_rgba(245,158,11,0.22),var(--shadow-card)] hover:-translate-y-1.5 hover:border-gold/70 hover:shadow-[0_18px_36px_-16px_rgba(245,158,11,0.32),var(--shadow-card-hover)]"
          : "border border-line shadow-[var(--shadow-card)] hover:-translate-y-1.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
      )}
    >
      <div
        className={cn(
          "relative w-full shrink-0 overflow-hidden bg-gradient-to-br from-background to-line/40",
          isFeatured ? "aspect-[16/11]" : "aspect-[4/3]"
        )}
      >
        {cover ? (
          <Image
            src={cover}
            alt={`${listing.title} — ${listing.city}`}
            fill
            sizes={
              isFeatured
                ? "(max-width: 640px) 90vw, (max-width: 1024px) 45vw, 24vw"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
            }
            className="object-cover transition-transform duration-500 ease-out group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-ink-muted">
            <ImageOff className={isFeatured ? "h-10 w-10" : "h-8 w-8"} />
          </div>
        )}

        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t to-transparent",
            isFeatured ? "h-24 from-black/70 via-black/10" : "h-14 from-black/35 via-black/0"
          )}
        />

        {listing.badge && (
          <PromoBadge
            badge={listing.badge}
            className={cn("absolute left-2.5 top-2.5", isFeatured && "px-3 py-1.5 text-xs shadow-md")}
          />
        )}

        <button
          onClick={onToggleFavorite}
          aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
          aria-pressed={favorited}
          className={cn(
            "absolute right-2.5 top-2.5 flex items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition-transform duration-150 hover:scale-105",
            isFeatured ? "h-10 w-10" : "h-9 w-9"
          )}
        >
          <Heart
            className={cn(
              isFeatured ? "h-5 w-5" : "h-4.5 w-4.5",
              favorited ? "fill-danger text-danger" : "text-ink-muted"
            )}
          />
        </button>

        {isFeatured && (
          <p className="absolute inset-x-3 bottom-2.5 flex items-center gap-1 truncate text-xs font-medium text-white">
            <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {listing.city}
            {listing.area ? `, ${listing.area}` : ""}
          </p>
        )}
      </div>

      {isFeatured && (
        <div aria-hidden className="h-[3px] w-full bg-gradient-to-r from-gold via-gold/40 to-transparent" />
      )}

      <div
        className={cn(
          "flex flex-1 flex-col",
          isFeatured ? "bg-gradient-to-b from-surface to-gold/[0.04] p-4 sm:p-5" : "p-3.5"
        )}
      >
        <div className="flex items-start justify-between gap-2">
          <p
            className={cn(
              "font-heading font-bold text-primary-text",
              isFeatured ? "text-2xl sm:text-[1.75rem]" : "text-lg"
            )}
          >
            {formatPKR(listing.price)}
          </p>
          <span
            aria-hidden
            className={cn(
              "flex shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-text opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-1",
              isFeatured ? "mt-0.5 h-7 w-7" : "mt-0.5 h-6 w-6"
            )}
          >
            <ArrowUpRight className={isFeatured ? "h-4 w-4" : "h-3.5 w-3.5"} />
          </span>
        </div>
        {listing.condition && (
          <span
            className={cn(
              "mt-1 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
              listing.condition === "new"
                ? "bg-success/10 text-success"
                : "bg-ink-muted/10 text-ink-muted"
            )}
          >
            {listing.condition}
          </span>
        )}
        <h3
          className={cn(
            "text-ink",
            isFeatured ? "mt-1.5 line-clamp-2 text-base font-semibold" : "mt-1 truncate text-sm"
          )}
          title={listing.title}
        >
          {listing.title}
        </h3>
        {isFeatured ? (
          <p className="mt-auto flex items-center gap-2 pt-2.5 text-xs text-ink-muted">
            <span>{formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}</span>
            {listing.views_count > 0 && (
              <span className="flex items-center gap-1 border-l border-line pl-2">
                <Eye className="h-3 w-3" aria-hidden />
                {listing.views_count.toLocaleString()}
              </span>
            )}
          </p>
        ) : (
          <p className="mt-auto truncate pt-1.5 text-xs text-ink-muted">
            {listing.city}
            {listing.area ? `, ${listing.area}` : ""} ·{" "}
            {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
          </p>
        )}
      </div>
    </Link>
  );
}
