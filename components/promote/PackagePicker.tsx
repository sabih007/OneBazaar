"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Check } from "lucide-react";
import type { Listing, Package } from "@/types/database";
import { BADGE_LABEL } from "@/lib/packages";
import { formatPKR, cn } from "@/lib/utils";
import PaymentForm from "@/components/promote/PaymentForm";

const GROUP_LABEL: Record<Package["key"], string> = {
  top: "Top Ad / Spotlight",
  featured: "Featured",
  urgent: "Urgent",
  bump: "Bump Up",
};

const GROUP_ORDER: Package["key"][] = ["top", "featured", "urgent", "bump"];

export default function PackagePicker({
  listing,
  packages,
}: {
  listing: Listing;
  packages: Package[];
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const isCurrentlyPromoted =
    listing.badge && listing.promoted_until && new Date(listing.promoted_until) > new Date();

  const groups = GROUP_ORDER.map((key) => ({
    key,
    label: GROUP_LABEL[key],
    options: packages.filter((p) => p.key === key),
  })).filter((g) => g.options.length > 0);

  const selectedPackage = packages.find((p) => p.id === selectedId) ?? null;

  return (
    <div className="mt-6 space-y-6">
      {isCurrentlyPromoted && (
        <div className="rounded-md border border-primary/30 bg-primary-light px-4 py-3 text-sm text-ink">
          This ad is currently <strong>{BADGE_LABEL[listing.badge!]}</strong>, promoted until{" "}
          {format(new Date(listing.promoted_until!), "d MMM yyyy")}.
        </div>
      )}

      {groups.map((group) => (
        <div key={group.key}>
          <p className="mb-2 font-heading text-sm font-semibold text-ink">{group.label}</p>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {group.options.map((pkg) => (
              <button
                key={pkg.id}
                type="button"
                onClick={() => setSelectedId(pkg.id)}
                className={cn(
                  "flex items-start justify-between gap-3 rounded-md border bg-surface p-4 text-left transition-colors duration-200",
                  selectedId === pkg.id
                    ? "border-primary ring-2 ring-primary/30"
                    : "border-line hover:border-primary/40"
                )}
              >
                <div>
                  <p className="text-sm font-medium text-ink">{pkg.name}</p>
                  <p className="mt-0.5 text-xs text-ink-muted">
                    {pkg.duration_days > 0
                      ? `${pkg.duration_days} day${pkg.duration_days === 1 ? "" : "s"}`
                      : "One-time"}
                  </p>
                  <p className="mt-2 font-heading text-lg font-bold text-ink">
                    {formatPKR(pkg.price)}
                  </p>
                </div>
                {selectedId === pkg.id && (
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-white">
                    <Check className="h-3.5 w-3.5" aria-hidden />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      ))}

      {selectedPackage && <PaymentForm listingId={listing.id} pkg={selectedPackage} />}
    </div>
  );
}
