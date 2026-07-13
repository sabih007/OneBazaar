"use client";

import { useState } from "react";
import Link from "next/link";
import { PackageSearch } from "lucide-react";
import type { Listing } from "@/types/database";
import { cn } from "@/lib/utils";
import MyListingRow from "@/components/dashboard/MyListingRow";
import { Button } from "@/components/ui/Button";

const tabs = [
  { key: "active", label: "Active" },
  { key: "sold", label: "Sold" },
  { key: "expired", label: "Expired" },
  { key: "pending", label: "Pending" },
] as const;

export default function MyListingsView({ listings }: { listings: Listing[] }) {
  const [tab, setTab] = useState<(typeof tabs)[number]["key"]>("active");
  const filtered = listings.filter((l) => l.status === tab);

  return (
    <div>
      <div className="flex gap-1 border-b border-line">
        {tabs.map((t) => {
          const count = listings.filter((l) => l.status === t.key).length;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={cn(
                "border-b-2 px-4 py-2.5 text-sm font-medium transition-colors",
                tab === t.key
                  ? "border-primary text-primary"
                  : "border-transparent text-ink-muted hover:text-ink"
              )}
            >
              {t.label} ({count})
            </button>
          );
        })}
      </div>

      <div className="mt-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
            <PackageSearch className="h-10 w-10 text-ink-muted" aria-hidden />
            <p className="mt-3 font-heading text-lg font-semibold text-ink">
              No {tab} listings
            </p>
            <Link href="/post" className="mt-4">
              <Button>Post an ad</Button>
            </Link>
          </div>
        ) : (
          filtered.map((listing) => <MyListingRow key={listing.id} listing={listing} />)
        )}
      </div>
    </div>
  );
}
