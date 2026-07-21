import type { Metadata } from "next";
import { Zap, CheckCircle2 } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getRefreshCredits } from "@/lib/profiles";
import { getActivePackages } from "@/lib/promotions";
import { formatPKR } from "@/lib/utils";
import BuyCreditsButton from "@/components/credits/BuyCreditsButton";

export const metadata: Metadata = { title: "Refresh credits" };

export default async function CreditsPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const [credits, packages] = await Promise.all([
    getRefreshCredits(supabase, user.id),
    getActivePackages(supabase),
  ]);
  const bundle = packages.find((p) => p.credits > 1) ?? null;

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">Refresh credits</h1>

      {checkout === "success" && (
        <div className="mb-4 flex items-center gap-2.5 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-ink">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
          Payment received — we&apos;re confirming it now, this usually takes a few seconds.
        </div>
      )}

      <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-text">
            <Zap className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <p className="text-xs text-ink-muted">Your balance</p>
            <p className="font-heading text-xl font-bold text-ink">{credits} credits</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink-muted">
          Every listing gets one free refresh — a credit lets you bump it back to the top of
          search again after that.
        </p>
      </div>

      {bundle && (
        <div className="mt-6 flex items-center justify-between gap-4 rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div>
            <p className="text-sm font-medium text-ink">{bundle.name}</p>
            <p className="mt-0.5 text-xs text-ink-muted">{bundle.credits} refresh credits</p>
            <p className="mt-2 font-heading text-lg font-bold text-ink">{formatPKR(bundle.price)}</p>
          </div>
          <BuyCreditsButton packageId={bundle.id} />
        </div>
      )}
    </div>
  );
}
