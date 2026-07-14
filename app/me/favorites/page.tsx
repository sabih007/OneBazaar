import type { Metadata } from "next";
import { createClient, getUser } from "@/lib/supabase/server";
import { getFavoriteListings } from "@/lib/listings";
import ListingGrid from "@/components/listings/ListingGrid";

export const metadata: Metadata = { title: "Favorites" };

export default async function FavoritesPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const listings = await getFavoriteListings(supabase, user.id);
  const favoritedIds = new Set(listings.map((l) => l.id));

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">Favorites</h1>
      <ListingGrid
        listings={listings}
        userId={user.id}
        favoritedIds={favoritedIds}
        emptyTitle="No saved listings yet"
        emptyDescription="Tap the heart on any listing to save it here."
      />
    </div>
  );
}
