"use client";

import type { UseFormReturn } from "react-hook-form";
import type { Category } from "@/lib/categories";
import { cities } from "@/lib/cities";
import type { ListingBaseInput } from "@/lib/validations/listing";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";

interface DetailsStepProps {
  category: Category;
  form: UseFormReturn<ListingBaseInput>;
  onBack: () => void;
  onNext: () => void;
  hideNav?: boolean;
}

export default function DetailsStep({
  category,
  form,
  onBack,
  onNext,
  hideNav = false,
}: DetailsStepProps) {
  const {
    register,
    formState: { errors },
    trigger,
  } = form;

  async function handleNext() {
    const fields: (keyof ListingBaseInput)[] = [
      "title",
      "description",
      "price",
      "citySlug",
    ];
    const valid = await trigger(fields);
    if (valid) onNext();
  }

  return (
    <div>
      <h2 className="font-heading text-xl font-semibold text-ink">Listing details</h2>
      <p className="mt-1 text-sm text-ink-muted">Tell buyers what you&apos;re selling.</p>

      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input id="title" placeholder="e.g. Toyota Corolla 2018, Automatic" {...register("title")} />
          {errors.title && <p className="mt-1 text-xs text-danger">{errors.title.message}</p>}
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <textarea
            id="description"
            rows={5}
            className="w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            placeholder="Describe condition, features, and reason for selling…"
            {...register("description")}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="price">Price (PKR)</Label>
            <Input
              id="price"
              type="number"
              inputMode="numeric"
              {...register("price", { valueAsNumber: true })}
            />
            {errors.price && <p className="mt-1 text-xs text-danger">{errors.price.message}</p>}
          </div>

          {category.hasCondition && (
            <div>
              <Label htmlFor="condition">Condition</Label>
              <Select id="condition" defaultValue="" {...register("condition")}>
                <option value="">Select</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </Select>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="citySlug">City</Label>
            <Select id="citySlug" defaultValue="" {...register("citySlug")}>
              <option value="" disabled>
                Select city
              </option>
              {cities.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.name}
                </option>
              ))}
            </Select>
            {errors.citySlug && <p className="mt-1 text-xs text-danger">{errors.citySlug.message}</p>}
          </div>
          <div>
            <Label htmlFor="area">Area / Locality</Label>
            <Input id="area" placeholder="e.g. DHA Phase 5" {...register("area")} />
          </div>
        </div>

        {category.attributes.length > 0 && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink">
              {category.name} details
            </p>
            <div className="grid grid-cols-2 gap-4">
              {category.attributes.map((field) => {
                const name = `attributes.${field.key}` as const;
                if (field.type === "select") {
                  return (
                    <div key={field.key}>
                      <Label htmlFor={name}>{field.label}</Label>
                      <Select id={name} defaultValue="" {...register(name)}>
                        <option value="">Select</option>
                        {field.options?.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </Select>
                    </div>
                  );
                }
                if (field.type === "boolean") {
                  return (
                    <div key={field.key} className="flex items-end pb-2.5">
                      <label className="flex items-center gap-2 text-sm text-ink">
                        <input type="checkbox" className="h-4 w-4 rounded border-line" {...register(name)} />
                        {field.label}
                      </label>
                    </div>
                  );
                }
                return (
                  <div key={field.key}>
                    <Label htmlFor={name}>
                      {field.label} {field.unit ? `(${field.unit})` : ""}
                    </Label>
                    <Input
                      id={name}
                      type={field.type === "number" ? "number" : "text"}
                      {...register(name)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

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
