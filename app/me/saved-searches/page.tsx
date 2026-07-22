import type { Metadata } from "next";
import Link from "next/link";
import { BellPlus } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getSavedSearches } from "@/lib/saved-searches";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { formatPKR } from "@/lib/utils";
import DeleteSavedSearchButton from "@/components/me/DeleteSavedSearchButton";

export const metadata: Metadata = { title: "Saved searches" };

export default async function SavedSearchesPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const searches = await getSavedSearches(supabase, user.id);

  return (
    <div>
      <h1 className="mb-1 font-heading text-2xl font-bold text-ink">Saved searches</h1>
      <p className="mb-4 text-sm text-ink-muted">
        We&apos;ll email you at {user.email} when a new listing matches one of these.
      </p>

      {searches.length === 0 ? (
        <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-8 text-center">
          <BellPlus className="mx-auto h-8 w-8 text-ink-muted" aria-hidden />
          <p className="mt-3 text-sm text-ink-muted">
            No saved searches yet. Browse a category and tap &quot;Notify me of new ads&quot; to
            create one.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {searches.map((s) => {
            const category = getCategory(s.category_slug);
            const city = getCity(s.city_slug);
            const parts = [
              category?.name ?? s.category_slug,
              city ? `in ${city.name}` : null,
              s.condition ? s.condition : null,
              s.min_price !== null ? `from ${formatPKR(s.min_price)}` : null,
              s.max_price !== null ? `up to ${formatPKR(s.max_price)}` : null,
            ].filter(Boolean);

            return (
              <div
                key={s.id}
                className="flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-4"
              >
                <div className="min-w-0">
                  <Link
                    href={`/${s.category_slug}/${s.city_slug}`}
                    className="text-sm font-medium text-ink hover:text-primary-text"
                  >
                    {parts.join(" · ")}
                  </Link>
                </div>
                <DeleteSavedSearchButton id={s.id} />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
