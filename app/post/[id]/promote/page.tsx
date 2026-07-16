import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getActivePackages } from "@/lib/promotions";
import type { Listing } from "@/types/database";
import PackagePicker from "@/components/promote/PackagePicker";

export const metadata: Metadata = {
  title: "Promote your ad",
};

const SAFEPAY_STATUS_BANNER: Record<string, { tone: "success" | "danger"; text: string }> = {
  success: { tone: "success", text: "Payment confirmed — your promotion is now active." },
  failed: { tone: "danger", text: "The payment didn't go through. You haven't been charged — try again." },
  cancelled: { tone: "danger", text: "Checkout was cancelled." },
  error: { tone: "danger", text: "We couldn't confirm the payment. Check My promotions, or try again." },
};

export default async function PromoteListingPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ safepay?: string }>;
}) {
  const { id } = await params;
  const { safepay } = await searchParams;
  const banner = safepay ? SAFEPAY_STATUS_BANNER[safepay] : undefined;

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

  const user = await getUser();

  if (!user) redirect(`/login?redirect=/post/${id}/promote`);

  const supabase = await createClient();
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

      {banner && (
        <div
          className={`mt-4 flex items-center gap-2.5 rounded-md border px-4 py-3 text-sm ${
            banner.tone === "success"
              ? "border-success/30 bg-success/10 text-ink"
              : "border-danger/30 bg-danger/10 text-ink"
          }`}
        >
          {banner.tone === "success" ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
          ) : (
            <XCircle className="h-4 w-4 shrink-0 text-danger" aria-hidden />
          )}
          {banner.text}
        </div>
      )}

      <PackagePicker listing={listing as Listing} packages={packages} />
    </div>
  );
}
