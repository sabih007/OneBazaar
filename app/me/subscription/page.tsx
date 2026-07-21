import type { Metadata } from "next";
import { format } from "date-fns";
import { CheckCircle2, Crown } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getSubscription, TIER_INFO, TIER_ORDER } from "@/lib/subscriptions";
import { formatPKR } from "@/lib/utils";
import SubscribeButton from "@/components/credits/SubscribeButton";

export const metadata: Metadata = { title: "Subscription" };

const STATUS_LABEL: Record<string, string> = {
  active: "Active",
  cancelled: "Cancelled",
  expired: "Expired",
  past_due: "Payment overdue",
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ checkout?: string }>;
}) {
  const { checkout } = await searchParams;
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const subscription = await getSubscription(supabase, user.id);
  const isActive = subscription?.status === "active";

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">Subscription</h1>

      {checkout === "success" && (
        <div className="mb-4 flex items-center gap-2.5 rounded-md border border-success/30 bg-success/10 px-4 py-3 text-sm text-ink">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-success" aria-hidden />
          Payment received — we&apos;re confirming it now, this usually takes a few seconds.
        </div>
      )}

      {subscription && (
        <div className="mb-6 rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
          <div className="flex items-center gap-2.5">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-light text-primary-text">
              <Crown className="h-5 w-5" aria-hidden />
            </span>
            <div>
              <p className="text-xs text-ink-muted">Your plan</p>
              <p className="font-heading text-xl font-bold text-ink">{TIER_INFO[subscription.tier].name}</p>
            </div>
          </div>
          <p className="mt-3 text-sm text-ink-muted">
            Status: <span className="text-ink">{STATUS_LABEL[subscription.status] ?? subscription.status}</span>
            {subscription.current_period_end && (
              <>
                {" "}
                · Renews {format(new Date(subscription.current_period_end), "d MMM yyyy")}
              </>
            )}
          </p>
          {/* API route that 302s to an external Lemon Squeezy URL — not a Next.js page, so next/link doesn't apply. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/subscriptions/portal"
            className="mt-4 inline-block text-sm font-medium text-primary-text underline"
          >
            Manage subscription
          </a>
        </div>
      )}

      {!isActive && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TIER_ORDER.map((tier) => {
            const info = TIER_INFO[tier];
            return (
              <div key={tier} className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
                <p className="font-heading text-lg font-bold text-ink">{info.name}</p>
                <p className="mt-1 font-heading text-2xl font-bold text-ink">
                  {formatPKR(info.price)}
                  <span className="text-sm font-normal text-ink-muted">/mo</span>
                </p>
                <ul className="mt-4 space-y-1.5 text-sm text-ink-muted">
                  <li>{info.activeSlotLimit} active ad slots</li>
                  <li>{info.featuredCredits} Featured credits/mo</li>
                  {info.hotCredits > 0 && <li>{info.hotCredits} Hot credits/mo</li>}
                  <li>{info.refreshCredits} Refresh credits/mo</li>
                </ul>
                <div className="mt-4">
                  <SubscribeButton tier={tier} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
