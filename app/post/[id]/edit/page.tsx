import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import EditListingForm from "@/components/post/EditListingForm";

export const metadata: Metadata = {
  title: "Edit listing",
};

export default async function EditListingPage({
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
          Editing a listing needs a live Supabase project to load data.
        </p>
      </div>
    );
  }

  const user = await getUser();

  if (!user) {
    redirect(`/login?redirect=/post/${id}/edit`);
  }

  const supabase = await createClient();
  const { data: listing } = await supabase.from("listings").select("*").eq("id", id).maybeSingle();

  if (!listing) notFound();
  if (listing.user_id !== user.id) notFound();

  return <EditListingForm listing={listing} userId={user.id} />;
}
