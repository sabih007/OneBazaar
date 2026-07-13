"use client";

import type { UseFormReturn } from "react-hook-form";
import type { ListingBaseInput } from "@/lib/validations/listing";
import ImageUploader from "@/components/listings/ImageUploader";
import { Button } from "@/components/ui/Button";

interface ImagesStepProps {
  userId: string;
  form: UseFormReturn<ListingBaseInput>;
  onBack: () => void;
  onNext: () => void;
  hideNav?: boolean;
}

export default function ImagesStep({
  userId,
  form,
  onBack,
  onNext,
  hideNav = false,
}: ImagesStepProps) {
  const { watch, setValue, trigger, formState } = form;
  const images = watch("images") ?? [];

  async function handleNext() {
    const valid = await trigger("images");
    if (valid) onNext();
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-ink">Add photos</h2>
      <p className="mt-1 text-sm text-ink-muted">
        Listings with clear photos get more views. The first photo is your cover image.
      </p>

      <div className="mt-5">
        <ImageUploader
          userId={userId}
          images={images}
          onChange={(next) => setValue("images", next, { shouldValidate: true })}
        />
      </div>
      {formState.errors.images && (
        <p className="mt-2 text-xs text-danger">{formState.errors.images.message as string}</p>
      )}

      {!hideNav && (
        <div className="mt-8 flex justify-between">
          <Button type="button" variant="secondary" onClick={onBack}>
            Back
          </Button>
          <Button type="button" onClick={handleNext}>
            Continue
          </Button>
        </div>
      )}
    </div>
  );
}
