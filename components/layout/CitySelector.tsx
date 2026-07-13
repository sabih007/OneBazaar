"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { cities } from "@/lib/cities";

const STORAGE_KEY = "onebazaar:city";

export default function CitySelector() {
  const [city, setCity] = useState("Lahore");

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored) setCity(stored);
  }, []);

  function onChange(value: string) {
    setCity(value);
    window.localStorage.setItem(STORAGE_KEY, value);
  }

  return (
    <div className="relative flex items-center">
      <MapPin aria-hidden className="pointer-events-none absolute left-2.5 h-4 w-4 text-ink-muted" />
      <select
        aria-label="Select city"
        value={city}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 appearance-none rounded-md border border-line bg-surface py-2 pl-8 pr-3 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
      >
        {cities.map((c) => (
          <option key={c.slug} value={c.name}>
            {c.name}
          </option>
        ))}
      </select>
    </div>
  );
}
