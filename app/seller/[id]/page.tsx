import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getPublicProfile } from "@/lib/profiles";
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
  return { title: `${seller.full_name || "Seller"} — OneBazaar` };
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

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("user_id", id)
    .eq("status", "active")
    .order("promotion_rank", { ascending: false })
    .order("created_at", { ascending: false });

  return (
    <div className="container-app py-6">
      <div className="flex items-center gap-4">
        <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary-light text-2xl font-semibold text-primary">
          {(seller.full_name || "S").charAt(0).toUpperCase()}
        </span>
        <div>
          <h1 className="flex items-center gap-1.5 font-heading text-xl font-bold text-ink">
            {seller.full_name || "OneBazaar seller"}
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
      <ListingGrid listings={listings ?? []} emptyTitle="No active listings" />
    </div>
  );
}
