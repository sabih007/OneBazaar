"use client";

import { useState } from "react";
import type { Package } from "@/types/database";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function PaymentForm({ listingId, pkg }: { listingId: string; pkg: Package }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, packageId: pkg.id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.checkoutUrl) {
        throw new Error(json?.error ?? "Couldn't start checkout. Please try again.");
      }
      window.location.href = json.checkoutUrl; // leaves the app — Lemon Squeezy redirects back once checkout completes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">{pkg.name}</p>
          <p className="font-heading text-xl font-bold text-ink">{formatPKR(pkg.price)}</p>
        </div>
        <Button onClick={onConfirm} disabled={submitting} className="gap-2">
          {submitting ? "Processing…" : "Continue to checkout"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
