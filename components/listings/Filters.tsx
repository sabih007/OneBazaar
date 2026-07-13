"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { Subcategory } from "@/lib/categories";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

interface FiltersProps {
  subcategories: Subcategory[];
  hasCondition?: boolean;
}

export default function Filters({ subcategories, hasCondition }: FiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [minPrice, setMinPrice] = useState(searchParams.get("min") ?? "");
  const [maxPrice, setMaxPrice] = useState(searchParams.get("max") ?? "");

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    router.push(`?${params.toString()}`);
  }

  function onPriceSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set("min", minPrice);
    else params.delete("min");
    if (maxPrice) params.set("max", maxPrice);
    else params.delete("max");
    router.push(`?${params.toString()}`);
  }

  return (
    <div className="flex flex-wrap items-end gap-3 rounded-md border border-line bg-surface p-4">
      {subcategories.length > 0 && (
        <div className="w-full sm:w-auto">
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Subcategory</label>
          <Select
            className="min-w-[160px]"
            defaultValue={searchParams.get("sub") ?? ""}
            onChange={(e) => updateParam("sub", e.target.value)}
          >
            <option value="">All</option>
            {subcategories.map((s) => (
              <option key={s.slug} value={s.slug}>
                {s.name}
              </option>
            ))}
          </Select>
        </div>
      )}

      {hasCondition && (
        <div className="w-full sm:w-auto">
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Condition</label>
          <Select
            className="min-w-[140px]"
            defaultValue={searchParams.get("condition") ?? ""}
            onChange={(e) => updateParam("condition", e.target.value)}
          >
            <option value="">Any</option>
            <option value="new">New</option>
            <option value="used">Used</option>
          </Select>
        </div>
      )}

      <form onSubmit={onPriceSubmit} className="flex w-full items-end gap-2 sm:w-auto">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Min price</label>
          <Input
            type="number"
            inputMode="numeric"
            className="w-28"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium text-ink-muted">Max price</label>
          <Input
            type="number"
            inputMode="numeric"
            className="w-28"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
          />
        </div>
        <Button type="submit" variant="secondary" size="md">
          Apply
        </Button>
      </form>

      <div className="ml-auto w-full sm:w-auto">
        <label className="mb-1.5 block text-xs font-medium text-ink-muted">Sort by</label>
        <Select
          className="min-w-[160px]"
          defaultValue={searchParams.get("sort") ?? "recommended"}
          onChange={(e) => updateParam("sort", e.target.value)}
        >
          <option value="recommended">Recommended</option>
          <option value="newest">Newest</option>
          <option value="price_asc">Price: low to high</option>
          <option value="price_desc">Price: high to low</option>
        </Select>
      </div>
    </div>
  );
}
