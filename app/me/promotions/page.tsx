import type { Metadata } from "next";
import { Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "My promotions" };

export default function MyPromotionsPage() {
  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">My promotions</h1>
      <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
        <Sparkles className="h-10 w-10 text-ink-muted" aria-hidden />
        <p className="mt-3 font-heading text-lg font-semibold text-ink">Coming soon</p>
        <p className="mt-1 text-sm text-ink-muted">
          Promotion packages and payment history land in a later phase.
        </p>
      </div>
    </div>
  );
}
