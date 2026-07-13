"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import type { UseFormReturn } from "react-hook-form";
import type { ListingBaseInput } from "@/lib/validations/listing";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { formatPKR } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface ReviewStepProps {
  form: UseFormReturn<ListingBaseInput>;
  onBack: () => void;
  onPublish: () => void;
  submitting: boolean;
  submitError: string | null;
}

export default function ReviewStep({
  form,
  onBack,
  onPublish,
  submitting,
  submitError,
}: ReviewStepProps) {
  const values = form.watch();
  const category = getCategory(values.categorySlug);
  const city = getCity(values.citySlug);
  const cover = values.images?.[0];

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-ink">Review &amp; publish</h2>
      <p className="mt-1 text-sm text-ink-muted">Make sure everything looks right.</p>

      <div className="mt-5 overflow-hidden rounded-md border border-line bg-surface">
        <div className="relative aspect-[16/9] w-full bg-background">
          {cover ? (
            <Image src={cover} alt={values.title} fill className="object-cover" />
          ) : (
            <div className="flex h-full items-center justify-center text-ink-muted">
              <ImageOff className="h-8 w-8" />
            </div>
          )}
        </div>
        <div className="p-4">
          <p className="font-heading text-xl font-bold text-ink">{formatPKR(values.price || 0)}</p>
          <h3 className="mt-1 text-base font-medium text-ink">{values.title}</h3>
          <p className="mt-1 text-sm text-ink-muted">
            {category?.name}
            {values.subcategorySlug ? ` · ${values.subcategorySlug}` : ""} · {city?.name}
            {values.area ? `, ${values.area}` : ""}
          </p>
          <p className="mt-3 whitespace-pre-line text-sm text-ink">{values.description}</p>
        </div>
      </div>

      {submitError && <p className="mt-4 text-sm text-danger">{submitError}</p>}

      <div className="mt-8 flex justify-between">
        <Button type="button" variant="secondary" onClick={onBack} disabled={submitting}>
          Back
        </Button>
        <Button type="button" onClick={onPublish} disabled={submitting}>
          {submitting ? "Publishing…" : "Publish listing"}
        </Button>
      </div>
    </div>
  );
}
