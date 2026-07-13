"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Listing } from "@/types/database";
import { getCategory } from "@/lib/categories";
import { listingBaseSchema, type ListingBaseInput } from "@/lib/validations/listing";
import { createClient } from "@/lib/supabase/client";
import { updateListing } from "@/lib/listings";
import DetailsStep from "@/components/post/DetailsStep";
import ImagesStep from "@/components/post/ImagesStep";
import { Button } from "@/components/ui/Button";

export default function EditListingForm({ listing, userId }: { listing: Listing; userId: string }) {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const category = getCategory(listing.category_slug);

  const form = useForm<ListingBaseInput>({
    resolver: zodResolver(listingBaseSchema),
    defaultValues: {
      title: listing.title,
      description: listing.description,
      price: listing.price,
      categorySlug: listing.category_slug,
      subcategorySlug: listing.subcategory,
      condition: listing.condition,
      citySlug: listing.city_slug,
      area: listing.area ?? "",
      images: listing.images,
      attributes: listing.attributes,
    },
  });

  if (!category) return null;

  async function onSave() {
    const valid = await form.trigger();
    if (!valid) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const values = form.getValues();
      await updateListing(createClient(), listing.id, {
        title: values.title,
        description: values.description,
        price: values.price,
        subcategory: values.subcategorySlug ?? null,
        condition: values.condition ?? null,
        attributes: values.attributes,
        area: values.area || null,
        images: values.images,
      });

      router.push(`/${listing.category_slug}/${listing.city_slug}/${listing.slug}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save changes");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-app max-w-2xl py-8">
      <h1 className="mb-5 font-heading text-2xl font-semibold text-ink">Edit listing</h1>

      <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        <DetailsStep category={category} form={form} onBack={() => {}} onNext={() => {}} hideNav />
        <div className="mt-8 border-t border-line pt-6">
          <ImagesStep userId={userId} form={form} onBack={() => {}} onNext={() => {}} hideNav />
        </div>

        {submitError && <p className="mt-4 text-sm text-danger">{submitError}</p>}

        <div className="mt-6 flex justify-end gap-3">
          <Button type="button" variant="secondary" onClick={() => router.back()} disabled={submitting}>
            Cancel
          </Button>
          <Button type="button" onClick={onSave} disabled={submitting}>
            {submitting ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
