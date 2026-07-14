import type { Metadata } from "next";
import Link from "next/link";
import { format } from "date-fns";
import { Sparkles } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getMyPromotions } from "@/lib/promotions";
import { formatPKR } from "@/lib/utils";

export const metadata: Metadata = { title: "My promotions" };

const STATUS_LABEL: Record<string, string> = {
  paid: "Paid",
  pending: "Pending",
  failed: "Failed",
  refunded: "Refunded",
};

export default async function MyPromotionsPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const promotions = await getMyPromotions(supabase, user.id);

  if (promotions.length === 0) {
    return (
      <div>
        <h1 className="mb-4 font-heading text-2xl font-bold text-ink">My promotions</h1>
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
          <Sparkles className="h-10 w-10 text-ink-muted" aria-hidden />
          <p className="mt-3 font-heading text-lg font-semibold text-ink">No promotions yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Promote one of your listings to get more views and a badge.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">My promotions</h1>
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line bg-background text-xs uppercase text-ink-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Listing</th>
              <th className="px-4 py-3 font-medium">Package</th>
              <th className="px-4 py-3 font-medium">Amount</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Expires</th>
            </tr>
          </thead>
          <tbody>
            {promotions.map((promo) => {
              const active = promo.payment_status === "paid" && new Date(promo.expires_at) > new Date();
              return (
                <tr key={promo.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3">
                    {promo.listing ? (
                      <Link
                        href={`/${promo.listing.category_slug}/${promo.listing.city_slug}/${promo.listing.slug}`}
                        className="text-ink hover:text-primary"
                      >
                        {promo.listing.title}
                      </Link>
                    ) : (
                      <span className="text-ink-muted">Listing removed</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{promo.package?.name ?? "—"}</td>
                  <td className="px-4 py-3 text-ink">{formatPKR(promo.amount)}</td>
                  <td className="px-4 py-3">
                    <span className={active ? "text-success" : "text-ink-muted"}>
                      {active ? "Active" : STATUS_LABEL[promo.payment_status] ?? promo.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {format(new Date(promo.expires_at), "d MMM yyyy")}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
