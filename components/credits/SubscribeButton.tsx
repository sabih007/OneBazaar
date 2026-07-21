"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import type { SubscriptionTier } from "@/lib/subscriptions";

export default function SubscribeButton({ tier }: { tier: SubscriptionTier }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/subscriptions/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.checkoutUrl) {
        throw new Error(json?.error ?? "Couldn't start checkout. Please try again.");
      }
      window.location.href = json.checkoutUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      <Button onClick={onConfirm} disabled={submitting} className="w-full justify-center gap-2">
        {submitting ? "Processing…" : "Subscribe"}
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
