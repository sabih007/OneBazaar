"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Wallet, CreditCard } from "lucide-react";
import type { Package, PaymentMethod } from "@/types/database";
import { createClient } from "@/lib/supabase/client";
import { purchasePromotion } from "@/lib/promotions";
import { formatPKR, cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

const methods: { value: PaymentMethod; label: string; icon: typeof Wallet; enabled: boolean }[] = [
  { value: "card", label: "Card (Safepay)", icon: CreditCard, enabled: true },
  { value: "mock", label: "Mock payment (dev only)", icon: CheckCircle2, enabled: true },
  { value: "jazzcash", label: "JazzCash", icon: Wallet, enabled: false },
  { value: "easypaisa", label: "Easypaisa", icon: Wallet, enabled: false },
];

export default function PaymentForm({
  listingId,
  userId,
  pkg,
}: {
  listingId: string;
  userId: string;
  pkg: Package;
}) {
  const router = useRouter();
  const [method, setMethod] = useState<PaymentMethod>("card");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function onConfirm() {
    setSubmitting(true);
    setError(null);

    if (method === "card") {
      try {
        const res = await fetch("/api/safepay/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ listingId, packageId: pkg.id }),
        });
        const json = await res.json();
        if (!res.ok || !json.checkoutUrl) {
          throw new Error(json.error ?? "Could not start Safepay checkout");
        }
        window.location.href = json.checkoutUrl; // leaves the app — Safepay redirects back to /api/safepay/callback
      } catch {
        setError("Couldn't start checkout. Please try again.");
        setSubmitting(false);
      }
      return;
    }

    try {
      await purchasePromotion(createClient(), {
        listingId,
        userId,
        packageId: pkg.id,
        paymentMethod: method,
      });
      setDone(true);
      router.refresh();
    } catch {
      setError("Payment failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-md border border-success/30 bg-success/10 p-5 text-center">
        <CheckCircle2 className="mx-auto h-8 w-8 text-success" aria-hidden />
        <p className="mt-2 font-heading text-lg font-semibold text-ink">Promotion active</p>
        <p className="mt-1 text-sm text-ink-muted">
          {pkg.name} is now applied to your listing.
        </p>
        <Button className="mt-4" onClick={() => router.push("/me/promotions")}>
          View my promotions
        </Button>
      </div>
    );
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
          {submitting
            ? "Processing…"
            : method === "card"
              ? "Continue to Safepay"
              : `Pay ${formatPKR(pkg.price)}`}
        </Button>
      </div>

      {error && <p className="mt-3 text-sm text-danger">{error}</p>}
    </div>
  );
}
