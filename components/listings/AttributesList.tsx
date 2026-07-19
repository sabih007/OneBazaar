import type { Category } from "@/lib/categories";
import type { Listing } from "@/types/database";

export default function AttributesList({
  category,
  attributes,
}: {
  category: Category;
  attributes: Listing["attributes"];
}) {
  const entries = category.attributes
    .map((field) => ({ field, value: attributes?.[field.key] }))
    .filter(({ value }) => value !== undefined && value !== null && value !== "");

  if (entries.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {entries.map(({ field, value }) => {
        // For `measure` fields the unit the user chose is stored under `${key}_unit`.
        const measureUnit =
          field.type === "measure" ? (attributes?.[`${field.key}_unit`] as string | undefined) : undefined;
        const suffix =
          typeof value === "boolean"
            ? ""
            : measureUnit
              ? ` ${measureUnit}`
              : field.unit
                ? ` ${field.unit}`
                : "";
        return (
          <div key={field.key}>
            <p className="text-xs text-ink-muted">{field.label}</p>
            <p className="text-sm font-medium text-ink">
              {typeof value === "boolean" ? (value ? "Yes" : "No") : value}
              {suffix}
            </p>
          </div>
        );
      })}
    </div>
  );
}
