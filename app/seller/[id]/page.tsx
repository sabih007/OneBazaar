import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getPublicProfile } from "@/lib/profiles";
import { getFavoritedListingIds } from "@/lib/listings";
import ListingGrid from "@/components/listings/ListingGrid";

interface SellerPageProps {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: SellerPageProps): Promise<Metadata> {
  if (!isSupabaseConfigured) return {};

  const { id } = await params;
  const supabase = await createClient();
  const seller = await getPublicProfile(supabase, id);
  if (!seller) return {};

  const name = seller.full_name || "Seller";
  const location = seller.city ? ` in ${seller.city}` : "";
  const title = `${name} — Seller Profile${location} | Buysellox.com`;
  const description = `Browse active listings from ${name}${location} on Buysellox.com, Pakistan's classifieds marketplace.${seller.is_verified ? " Verified seller." : ""}`;

  return {
    title,
    description,
    alternates: { canonical: `/seller/${id}` },
    openGraph: { title, description, type: "profile" },
  };
}

export default async function SellerProfilePage({ params }: SellerPageProps) {
  const { id } = await params;

  if (!isSupabaseConfigured) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Connect Supabase first</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Seller profiles need a live Supabase project to load data.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const seller = await getPublicProfile(supabase, id);
  if (!seller) notFound();

  const [{ data: listings }, user] = await Promise.all([
    supabase
      .from("listings")
      .select("*")
      .eq("user_id", id)
      .eq("status", "active")
      .order("promotion_rank", { ascending: false })
      .order("created_at", { ascending: false }),
    getUser(),
  ]);
  const favoritedIds = user ? await getFavoritedListingIds(supabase, user.id) : new Set<string>();

  return (
    <div className="container-app py-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-2xl font-semibold text-primary-text">
          {(seller.full_name || "S").charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="flex items-center gap-1.5 font-heading text-xl font-bold text-ink">
            {seller.full_name || "Buysellox.com seller"}
            {seller.is_verified && (
              <BadgeCheck className="h-5 w-5 text-success" aria-label="Verified seller" />
            )}
          </h1>
          <p className="text-sm text-ink-muted">
            Member since {formatDistanceToNow(new Date(seller.created_at), { addSuffix: true })}
            {seller.city ? ` · ${seller.city}` : ""}
          </p>
        </div>
      </div>

      <h2 className="mb-4 mt-8 font-heading text-lg font-semibold text-ink">
        Listings from {seller.full_name || "this seller"}
      </h2>
      <ListingGrid
        listings={listings ?? []}
        userId={user?.id ?? null}
        favoritedIds={favoritedIds}
        emptyTitle="No active listings"
      />
    </div>
  );
}
