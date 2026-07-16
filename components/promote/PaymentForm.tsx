"use client";

import { useState } from "react";
import { Wallet, CreditCard } from "lucide-react";
import type { Package, PaymentMethod } from "@/types/database";
import { formatPKR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const methods: { value: PaymentMethod; label: string; icon: typeof Wallet; enabled: boolean }[] = [
  { value: "card", label: "Card (Safepay)", icon: CreditCard, enabled: true },
  { value: "jazzcash", label: "JazzCash", icon: Wallet, enabled: false },
  { value: "easypaisa", label: "Easypaisa", icon: Wallet, enabled: false },
];

export default function PaymentForm({ listingId, pkg }: { listingId: string; pkg: Package }) {
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch("/api/safepay/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId, packageId: pkg.id }),
      });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.checkoutUrl) {
        throw new Error(json?.error ?? "Couldn't start checkout. Please try again.");
      }
      window.location.href = json.checkoutUrl; // leaves the app — Safepay redirects back to /api/safepay/callback
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start checkout. Please try again.");
      setSubmitting(false);
    }
  }

  return (
    <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <p className="mb-3 text-sm font-semibold text-ink">Choose payment method</p>
      <div className="space-y-2">
        {methods.map(({ value, label, icon: Icon, enabled }) => (
          <button
            key={value}
            type="button"
            disabled={!enabled}
            onClick={() => setMethod(value)}
            className={cn(
              "flex w-full items-center justify-between gap-3 rounded-md border px-3.5 py-2.5 text-left text-sm transition-colors duration-200 disabled:cursor-not-allowed disabled:opacity-50",
              method === value ? "border-primary ring-2 ring-primary/30" : "border-line"
            )}
          >
            <span className="flex items-center gap-2.5 text-ink">
              <Icon className="h-4 w-4" aria-hidden />
              {label}
            </span>
            {!enabled && <span className="text-xs text-ink-muted">Coming soon</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-line pt-4">
        <div>
          <p className="text-xs text-ink-muted">{pkg.name}</p>
          <p className="font-heading text-xl font-bold text-ink">{formatPKR(pkg.price)}</p>
        </div>
        <Button onClick={onConfirm} disabled={submitting} className="gap-2">
          {submitting ? "Processing…" : "Continue to Safepay"}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
