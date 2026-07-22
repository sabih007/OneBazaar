"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Check } from "lucide-react";
import { buildListingSchema, type ListingBaseInput } from "@/lib/validations/listing";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import { createClient } from "@/lib/supabase/client";
import { createListing } from "@/lib/listings";
import { cn } from "@/lib/utils";
import CategoryStep from "@/components/post/CategoryStep";
import DetailsStep from "@/components/post/DetailsStep";
import ImagesStep from "@/components/post/ImagesStep";
import ReviewStep from "@/components/post/ReviewStep";

const STEPS = ["Category", "Details", "Photos", "Review"];

export default function PostWizard({ userId }: { userId: string }) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<ListingBaseInput>({
    resolver: zodResolver(buildListingSchema()),
    defaultValues: {
      title: "",
      description: "",
      price: 0,
      categorySlug: "",
      subcategorySlug: null,
      condition: null,
      citySlug: "",
      area: "",
      images: [],
      attributes: {},
    },
  });

  const categorySlug = form.watch("categorySlug");
  const subcategorySlug = form.watch("subcategorySlug") ?? null;
  const category = getCategory(categorySlug);

  async function onPublish() {
    const valid = await form.trigger();
    if (!valid) return;

    setSubmitting(true);
    setSubmitError(null);

    try {
      const values = form.getValues();
      const category = getCategory(values.categorySlug);
      const city = getCity(values.citySlug);
      if (!category || !city) throw new Error("Invalid category or city");

      const supabase = createClient();
      const listing = await createListing(supabase, {
        userId,
        title: values.title,
        description: values.description,
        price: values.price,
        categorySlug: category.slug,
        categoryName: category.name,
        subcategorySlug: values.subcategorySlug ?? null,
        condition: values.condition ?? null,
        citySlug: city.slug,
        cityName: city.name,
        area: values.area || null,
        images: values.images,
        attributes: values.attributes,
      });

      fetch("/api/listings/notify-saved-searches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listingId: listing.id }),
      }).catch(() => {});

      router.push(`/${listing.category_slug}/${listing.city_slug}/${listing.slug}`);
      router.refresh();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to publish listing");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="container-app max-w-2xl py-8">
      <ol className="mb-8 flex items-center justify-between">
        {STEPS.map((label, i) => (
          <li key={label} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1.5">
              <span
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  i < step
                    ? "bg-primary text-white"
                    : i === step
                      ? "bg-primary-light text-primary-text ring-2 ring-primary"
                      : "bg-background text-ink-muted"
                )}
              >
                {i < step ? <Check className="h-4 w-4" /> : i + 1}
              </span>
              <span className="hidden text-xs text-ink-muted sm:block">{label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={cn("mx-2 h-0.5 flex-1", i < step ? "bg-primary" : "bg-line")} />
            )}
          </li>
        ))}
      </ol>

      <div className="rounded-md border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
        {step === 0 && (
          <CategoryStep
            categorySlug={categorySlug}
            subcategorySlug={subcategorySlug}
            onSelectCategory={(slug) => form.setValue("categorySlug", slug, { shouldValidate: true })}
            onSelectSubcategory={(slug) => form.setValue("subcategorySlug", slug)}
            onNext={() => setStep(1)}
          />
        )}
        {step === 1 && category && (
          <DetailsStep
            category={category}
            form={form}
            onBack={() => setStep(0)}
            onNext={() => setStep(2)}
          />
        )}
        {step === 2 && (
          <ImagesStep
            userId={userId}
            form={form}
            onBack={() => setStep(1)}
            onNext={() => setStep(3)}
          />
        )}
        {step === 3 && (
          <ReviewStep
            form={form}
            onBack={() => setStep(2)}
            onPublish={onPublish}
            submitting={submitting}
            submitError={submitError}
          />
        )}
      </div>
    </div>
  );
}
