"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { CheckCircle2, ImageOff, Pencil, RefreshCw, RotateCcw, Sparkles, Trash2 } from "lucide-react";
import type { Listing } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { deleteListing, markListingSold } from "@/lib/listings";
import { formatPKR } from "@/lib/utils";
import PromoBadge from "@/components/listings/PromoBadge";
import { Button } from "@/components/ui/Button";

const statusLabel: Record<string, string> = {
  active: "Active",
  sold: "Sold",
  pending: "Pending",
  expired: "Expired",
};

/** Posts to a listing action route (repost/refresh); throws with the server's error message on failure. */
async function postListingAction(listingId: string, action: "repost" | "refresh") {
  const res = await fetch(`/api/listings/${listingId}/${action}`, { method: "POST" });
  const json = await res.json().catch(() => null);
  if (!res.ok) throw new Error(json?.error ?? "Something went wrong");
}

export default function MyListingRow({
  listing,
  onUpdate,
  onRemove,
  onRestore,
  creditsAvailable,
  onCreditSpent,
}: {
  listing: Listing;
  onUpdate: (id: string, patch: Partial<Listing>) => void;
  onRemove: (id: string) => void;
  onRestore: (listing: Listing) => void;
  creditsAvailable: number;
  onCreditSpent: () => void;
}) {
  const [pending, setPending] = useState<string | null>(null);
  const href = `/${listing.category_slug}/${listing.city_slug}/${listing.slug}`;

  /** Applies `optimistic` immediately, then fires `fn`; rolls back on failure. */
  async function run(
    action: string,
    optimistic: Partial<Listing>,
    fn: () => Promise<void>
  ) {
    setPending(action);
    onUpdate(listing.id, optimistic);
    try {
      await fn();
    } catch {
      onUpdate(listing.id, listing);
    } finally {
      setPending(null);
    }
  }

  async function runDelete() {
    setPending("delete");
    const snapshot = listing;
    onRemove(listing.id); // optimistic — vanish immediately, restore on failure
    try {
      await deleteListing(createClient(), listing.id);
    } catch {
      onRestore(snapshot);
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="flex flex-col gap-4 rounded-md border border-line bg-surface p-4 sm:flex-row sm:items-center">
      <Link href={href} className="relative h-24 w-32 shrink-0 overflow-hidden rounded-md bg-background">
        {listing.images[0] ? (
          <Image src={listing.images[0]} alt={listing.title} fill className="object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-ink-muted">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
      </Link>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          {listing.badge && <PromoBadge badge={listing.badge} />}
          <span className="rounded-full bg-background px-2 py-0.5 text-xs font-medium text-ink-muted">
            {statusLabel[listing.status] ?? listing.status}
          </span>
        </div>
        <Link href={href} className="mt-1 block truncate font-medium text-ink hover:text-primary-text">
          {listing.title}
        </Link>
        <p className="text-sm text-ink-muted">
          {formatPKR(listing.price)} · {listing.city} · {listing.views_count} views
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href={`/post/${listing.id}/promote`}>
          <Button size="sm" variant="secondary" className="gap-1.5">
            <Sparkles className="h-3.5 w-3.5" /> Promote
          </Button>
        </Link>
        <Link href={`/post/${listing.id}/edit`}>
          <Button size="sm" variant="secondary" className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" /> Edit
          </Button>
        </Link>
        {listing.status === "expired" ? (
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            disabled={pending === "repost"}
            onClick={() =>
              run("repost", { status: "active", bumped_at: new Date().toISOString() }, () =>
                postListingAction(listing.id, "repost")
              )
            }
          >
            <RotateCcw className="h-3.5 w-3.5" /> Repost
          </Button>
        ) : listing.status === "active" && !listing.free_refresh_used_at ? (
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            disabled={pending === "refresh"}
            onClick={() =>
              run(
                "refresh",
                { bumped_at: new Date().toISOString(), free_refresh_used_at: new Date().toISOString() },
                () => postListingAction(listing.id, "refresh")
              )
            }
          >
            <RefreshCw className="h-3.5 w-3.5" /> Free refresh
          </Button>
        ) : listing.status === "active" && creditsAvailable > 0 ? (
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            disabled={pending === "refresh"}
            onClick={() =>
              run("refresh", { bumped_at: new Date().toISOString() }, async () => {
                await postListingAction(listing.id, "refresh");
                onCreditSpent();
              })
            }
          >
            <RefreshCw className="h-3.5 w-3.5" /> Refresh · 1 credit
          </Button>
        ) : null}
        {listing.status !== "sold" && listing.status !== "expired" ? (
          <Button
            size="sm"
            variant="secondary"
            className="gap-1.5"
            disabled={pending === "sold"}
            onClick={() => run("sold", { status: "sold" }, () => markListingSold(createClient(), listing.id))}
          >
            <CheckCircle2 className="h-3.5 w-3.5" /> Mark sold
          </Button>
        ) : null}
        <Button
          size="sm"
          variant="danger"
          className="gap-1.5"
          disabled={pending === "delete"}
          onClick={() => window.confirm("Delete this listing?") && runDelete()}
        >
          <Trash2 className="h-3.5 w-3.5" /> Delete
        </Button>
      </div>
    </div>
  );
}
