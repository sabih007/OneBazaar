import {
  Bath,
  BedDouble,
  Calendar,
  Car,
  Cog,
  Fuel,
  Gauge,
  HardDrive,
  KeyRound,
  type LucideIcon,
  Layers,
  PawPrint,
  Ruler,
  ShieldCheck,
  Sofa,
  Syringe,
  Tag,
} from "lucide-react";
import type { Category } from "@/lib/categories";
import type { Listing } from "@/types/database";

/** Icon per attribute key, for the card's compact spec row. Falls back to Tag. */
const ATTRIBUTE_ICONS: Record<string, LucideIcon> = {
  bedrooms: BedDouble,
  bathrooms: Bath,
  area: Ruler,
  size: Ruler,
  furnished: Sofa,
  floor: Layers,
  plot_type: KeyRound,
  possession_status: KeyRound,
  make: Car,
  model: Car,
  year: Calendar,
  mileage: Gauge,
  fuel_type: Fuel,
  transmission: Cog,
  brand: Tag,
  storage: HardDrive,
  pta_approved: ShieldCheck,
  species: PawPrint,
  breed: PawPrint,
  vaccinated: Syringe,
  material: Layers,
};

export interface CardAttribute {
  key: string;
  label: string;
  value: string;
  icon: LucideIcon;
}

/**
 * Up to `max` category attributes that have a value on this listing, for the
 * card's spec row. Skips required text fields (make/model/brand) since those
 * are typically already in the listing title.
 */
export function getCardAttributes(
  category: Category | undefined,
  attributes: Listing["attributes"],
  max = 4
): CardAttribute[] {
  if (!category) return [];

  const entries: CardAttribute[] = [];
  for (const field of category.attributes) {
    if (field.type === "text" && field.required) continue;
    const value = attributes?.[field.key];
    if (value === undefined || value === null || value === "") continue;

    const measureUnit =
      field.type === "measure" ? (attributes?.[`${field.key}_unit`] as string | undefined) : undefined;
    const suffix = typeof value === "boolean" ? "" : measureUnit ? ` ${measureUnit}` : field.unit ? ` ${field.unit}` : "";

    entries.push({
      key: field.key,
      label: field.label,
      value: `${typeof value === "boolean" ? (value ? "Yes" : "No") : value}${suffix}`,
      icon: ATTRIBUTE_ICONS[field.key] ?? Tag,
    });

    if (entries.length === max) break;
  }

  return entries;
}
