"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ArrowUpRight, Clock, Heart, ImageOff, MapPin, MessageCircle, ShieldCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { Listing } from "@/types/database";
import { formatListingPrice, cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/listings";
import { getCategory } from "@/lib/categories";
import { getCardAttributes } from "@/lib/attribute-display";
import PromoBadge from "@/components/listings/PromoBadge";
import ShareButton from "@/components/listings/ShareButton";

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
  const [imageFailed, setImageFailed] = useState(false);
  const cover = listing.images?.[0];
  const isFeatured = variant === "featured";
  const cardAttributes = isFeatured
    ? getCardAttributes(getCategory(listing.category_slug), listing.attributes)
    : [];

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
        {cover && !imageFailed ? (
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
            onError={() => setImageFailed(true)}
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

        <div className="absolute right-2.5 top-2.5 flex items-center gap-1.5">
          <ShareButton title={listing.title} url={href} variant="icon" iconSize={isFeatured ? "md" : "sm"} />
          <button
            onClick={onToggleFavorite}
            aria-label={favorited ? "Remove from favorites" : "Save to favorites"}
            aria-pressed={favorited}
            className={cn(
              "flex items-center justify-center rounded-full bg-surface/90 shadow-sm backdrop-blur transition-transform duration-150 hover:scale-105",
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
        </div>

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
          <div className="flex flex-wrap items-center gap-2">
            <p
              className={cn(
                "font-heading font-bold text-primary-text",
                isFeatured ? "text-2xl sm:text-[1.75rem]" : "text-lg"
              )}
            >
              {formatListingPrice(listing.price, listing.category_slug)}
            </p>
            {listing.condition && (
              <span
                className={cn(
                  "inline-block rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
                  listing.condition === "new"
                    ? "border-success/20 bg-success/10 text-success"
                    : "border-line bg-surface text-ink-muted"
                )}
              >
                {listing.condition}
              </span>
            )}
          </div>
          <span
            aria-hidden
            className={cn(
              "flex shrink-0 items-center justify-center text-primary-text transition-all duration-300",
              isFeatured
                ? "h-9 w-9 rounded-xl bg-primary-light"
                : "h-6 w-6 rounded-full bg-primary-light opacity-0 translate-x-1 group-hover:opacity-100 group-hover:translate-x-0"
            )}
          >
            <ArrowUpRight className={isFeatured ? "h-4.5 w-4.5" : "h-3.5 w-3.5"} />
          </span>
        </div>
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
          <>
            {cardAttributes.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-x-3 gap-y-3 rounded-[var(--radius-lg)] border border-line bg-background/60 p-3 sm:grid-cols-4">
                {cardAttributes.map(({ key, label, value, icon: Icon }) => (
                  <div key={key} className="flex items-center gap-2 min-w-0">
                    <Icon className="h-4 w-4 shrink-0 text-primary-text" aria-hidden />
                    <div className="min-w-0">
                      <p className="truncate text-xs font-semibold text-ink">{value}</p>
                      <p className="truncate text-[10px] text-ink-muted">{label}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-3.5">
              <div className="flex min-w-0 items-center gap-3 text-xs text-ink-muted">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  {formatDistanceToNow(new Date(listing.created_at), { addSuffix: true })}
                </span>
                {listing.seller_is_verified && (
                  <span className="flex items-center gap-1.5 border-l border-line pl-3">
                    <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-success" aria-hidden />
                    Verified
                  </span>
                )}
              </div>
              <span className="flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-3.5 py-2 text-xs font-semibold text-white">
                <MessageCircle className="h-3.5 w-3.5" aria-hidden />
                View Details
              </span>
            </div>
          </>
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
