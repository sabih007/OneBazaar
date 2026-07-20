import { PackageSearch } from "lucide-react";
import type { Listing } from "@/types/database";
import ListingCard from "@/components/listings/ListingCard";

interface ListingGridProps {
  listings: Listing[];
  userId?: string | null;
  favoritedIds?: Set<string>;
  emptyTitle?: string;
  emptyDescription?: string;
}

export default function ListingGrid({
  listings,
  userId,
  favoritedIds,
  emptyTitle = "No listings found",
  emptyDescription = "Try adjusting your filters or check back soon.",
}: ListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-lg)] border border-dashed border-line bg-surface px-6 py-20 text-center">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light">
          <PackageSearch className="h-8 w-8 text-primary-text" aria-hidden />
        </span>
        <p className="mt-4 font-heading text-lg font-semibold text-ink">{emptyTitle}</p>
        <p className="mt-1 text-sm text-ink-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 sm:gap-5 lg:grid-cols-4 xl:grid-cols-5">
      {listings.map((listing) => (
        <ListingCard
          key={listing.id}
          listing={listing}
          userId={userId}
          isFavorited={favoritedIds?.has(listing.id) ?? false}
        />
      ))}
    </div>
  );
}
