"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";

export default function BuyCreditsButton({ packageId }: { packageId: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/credits/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ packageId }),
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
      <Button onClick={onConfirm} disabled={submitting} className="gap-2">
        {submitting ? "Processing…" : "Buy 10 refresh credits"}
      </Button>
      {error && <p className="mt-2 text-sm text-danger">{error}</p>}
    </div>
  );
}
