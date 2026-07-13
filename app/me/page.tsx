import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getMyListings } from "@/lib/listings";
import MyListingsView from "@/components/dashboard/MyListingsView";

export const metadata: Metadata = { title: "My listings" };

export default async function MyListingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const listings = await getMyListings(supabase, user.id);

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">My listings</h1>
      <MyListingsView listings={listings} />
    </div>
  );
}
