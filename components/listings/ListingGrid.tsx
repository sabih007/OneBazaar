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
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
        <PackageSearch className="h-10 w-10 text-ink-muted" aria-hidden />
        <p className="mt-3 font-heading text-lg font-semibold text-ink">{emptyTitle}</p>
        <p className="mt-1 text-sm text-ink-muted">{emptyDescription}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
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
