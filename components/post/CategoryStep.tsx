"use client";

import { categories } from "@/lib/categories";
import { cn } from "@/lib/utils";

interface CategoryStepProps {
  categorySlug: string;
  subcategorySlug: string | null;
  onSelectCategory: (slug: string) => void;
  onSelectSubcategory: (slug: string | null) => void;
  onNext: () => void;
}

export default function CategoryStep({
  categorySlug,
  subcategorySlug,
  onSelectCategory,
  onSelectSubcategory,
  onNext,
}: CategoryStepProps) {
  const selected = categories.find((c) => c.slug === categorySlug);

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-ink">What are you listing?</h2>
      <p className="mt-1 text-sm text-ink-muted">Choose a category to continue.</p>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {categories.map((c) => (
          <button
            key={c.slug}
            type="button"
            onClick={() => {
              onSelectCategory(c.slug);
              onSelectSubcategory(null);
            }}
            className={cn(
              "rounded-md border p-4 text-left text-sm font-medium transition-colors duration-150",
              categorySlug === c.slug
                ? "border-primary bg-primary-light text-primary"
                : "border-line bg-surface text-ink hover:border-primary/50"
            )}
          >
            {c.name}
          </button>
        ))}
      </div>

      {selected && selected.subcategories.length > 0 && (
        <div className="mt-5">
          <p className="mb-2 text-sm font-medium text-ink">Subcategory (optional)</p>
          <div className="flex flex-wrap gap-2">
            {selected.subcategories.map((s) => (
              <button
                key={s.slug}
                type="button"
                onClick={() => onSelectSubcategory(subcategorySlug === s.slug ? null : s.slug)}
                className={cn(
                  "rounded-full border px-3.5 py-1.5 text-xs font-medium transition-colors duration-150",
                  subcategorySlug === s.slug
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-surface text-ink-muted hover:border-primary/50"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex justify-end">
        <button
          type="button"
          disabled={!categorySlug}
          onClick={onNext}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-white transition-colors hover:bg-primary-hover disabled:opacity-50"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
