"use client";

import { useState } from "react";
import type { Package } from "@/types/database";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

/** Builds a real <form> and submits it — JazzCash's Hosted Checkout Page is a page navigation, not a fetch redirect. */
function submitJazzCashForm(actionUrl: string, fields: Record<string, string>) {
  const form = document.createElement("form");
  form.method = "POST";
  form.action = actionUrl;
  form.style.display = "none";

  for (const [name, value] of Object.entries(fields)) {
    const input = document.createElement("input");
    input.type = "hidden";
    input.name = name;
    input.value = value;
    form.appendChild(input);
  }

  document.body.appendChild(form);
  form.submit();
}

export default function PaymentForm({ listingId, pkg }: { listingId: string; pkg: Package }) {
  const [submitting, setSubmitting] = useState<"card" | "jazzcash" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onCardCheckout() {
    setSubmitting("card");
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
      setSubmitting(null);
    }
  }

  async function onJazzCashCheckout() {
    setSubmitting("jazzcash");
    setError(null);

    try {
      const res = await fetch("/api/jazzcash/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, packageId: pkg.id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.actionUrl || !json?.fields) {
        throw new Error(json?.error ?? "Couldn't start checkout. Please try again.");
      }
      submitJazzCashForm(json.actionUrl, json.fields); // leaves the app — JazzCash posts back to /api/jazzcash/return once checkout completes
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
      setSubmitting(null);
    }
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-ink-muted">{pkg.name}</p>
          <p className="font-heading text-xl font-bold text-ink">{formatPKR(pkg.price)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onCardCheckout} disabled={submitting !== null} className="flex-1 gap-2">
          {submitting === "card" ? "Processing…" : "Pay with card"}
        </Button>
        <Button
          onClick={onJazzCashCheckout}
          disabled={submitting !== null}
          variant="secondary"
          className="flex-1 gap-2"
        >
          {submitting === "jazzcash" ? "Processing…" : "Pay with JazzCash"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
