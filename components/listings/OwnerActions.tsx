"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Sparkles, Trash2, CheckCircle2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteListing, markListingSold } from "@/lib/listings";
import { Button } from "@/components/ui/Button";

export default function OwnerActions({
  listingId,
  status,
}: {
  listingId: string;
  status: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState<string | null>(null);

  async function onMarkSold() {
    setPending("sold");
    try {
      await markListingSold(createClient(), listingId);
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  async function onDelete() {
    if (!window.confirm("Delete this listing? This can't be undone.")) return;
    setPending("delete");
    try {
      await deleteListing(createClient(), listingId);
      router.push("/me");
      router.refresh();
    } finally {
      setPending(null);
    }
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="mb-3 text-sm font-semibold text-ink">Manage your listing</p>
      <div className="space-y-2">
        <Link href={`/post/${listingId}/promote`}>
          <Button className="w-full gap-2">
            <Sparkles className="h-4 w-4" aria-hidden />
            Promote for more views
          </Button>
        </Link>
        <Link href={`/post/${listingId}/edit`}>
          <Button variant="secondary" className="w-full gap-2">
            <Pencil className="h-4 w-4" aria-hidden />
            Edit listing
          </Button>
        </Link>
        {status !== "sold" && (
          <Button
            variant="secondary"
            className="w-full gap-2"
            onClick={onMarkSold}
            disabled={pending === "sold"}
          >
            <CheckCircle2 className="h-4 w-4" aria-hidden />
            {pending === "sold" ? "Marking sold…" : "Mark as sold"}
          </Button>
        )}
        <Button
          variant="danger"
          className="w-full gap-2"
          onClick={onDelete}
          disabled={pending === "delete"}
        >
          <Trash2 className="h-4 w-4" aria-hidden />
          {pending === "delete" ? "Deleting…" : "Delete listing"}
        </Button>
      </div>
    </div>
  );
}
