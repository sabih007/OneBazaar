import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getActivePackages } from "@/lib/promotions";
import type { Listing } from "@/types/database";
import PackagePicker from "@/components/promote/PackagePicker";

export const metadata: Metadata = {
  title: "Promote your ad",
};

export default async function PromoteListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  if (!isSupabaseConfigured) {
    return (
      <div className="container-app max-w-2xl py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Connect Supabase first</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Promoting a listing needs a live Supabase project to load data.
        </p>
      </div>
    );
  }

  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect(`/login?redirect=/post/${id}/promote`);

  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();

  if (!listing) notFound();
  if (listing.user_id !== user.id) notFound();

  const packages = await getActivePackages(supabase);

  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="font-heading text-2xl font-bold text-ink">Promote this ad</h1>
      <p className="mt-1 text-sm text-ink-muted">
        Get more views on &ldquo;{(listing as Listing).title}&rdquo; with a promotion package.
      </p>

      <PackagePicker listing={listing as Listing} packages={packages} userId={user.id} />
    </div>
  );
}
