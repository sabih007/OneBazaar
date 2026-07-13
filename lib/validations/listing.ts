import { z } from "zod";
import { getCategory } from "@/lib/categories";

export const listingBaseSchema = z.object({
  title: z.string().min(10, "Title must be at least 10 characters").max(80),
  description: z.string().min(20, "Description must be at least 20 characters").max(4000),
  price: z
    .number({ error: "Enter a valid price" })
    .nonnegative("Price can't be negative"),
  categorySlug: z.string().min(1, "Select a category"),
  subcategorySlug: z.string().nullable().optional(),
  condition: z.enum(["new", "used"]).nullable().optional(),
  citySlug: z.string().min(1, "Select a city"),
  area: z.string().max(120).optional(),
  images: z.array(z.string().url()).min(1, "Add at least one photo").max(8, "Up to 8 photos"),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null()])),
});

export type ListingBaseInput = z.infer<typeof listingBaseSchema>;

/** Adds a `.superRefine` that enforces the required attribute fields for the chosen category (§5). */
export function buildListingSchema() {
  return listingBaseSchema.superRefine((data, ctx) => {
    const category = getCategory(data.categorySlug);
    if (!category) {
      ctx.addIssue({ code: "custom", path: ["categorySlug"], message: "Unknown category" });
      return;
    }
    for (const field of category.attributes) {
      if (!field.required) continue;
      const value = data.attributes[field.key];
      if (value === undefined || value === null || value === "") {
        ctx.addIssue({
          code: "custom",
          path: ["attributes", field.key],
          message: `${field.label} is required`,
        });
      }
    }
  });
}
