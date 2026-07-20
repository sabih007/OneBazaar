export type PackageKey = "featured" | "urgent" | "top" | "bump";

export type Badge = "featured" | "urgent" | "top" | null;

/** Ranking weight applied to `listings.promotion_rank`. Higher sorts first. */
export const PROMOTION_RANK: Record<Exclude<Badge, null>, number> = {
  top: 30,
  featured: 20,
  urgent: 5,
};

/** Badge display precedence when a listing could show more than one signal. */
export const BADGE_PRIORITY: Exclude<Badge, null>[] = ["top", "featured", "urgent"];

export const BADGE_LABEL: Record<Exclude<Badge, null>, string> = {
  top: "Top Ad",
  featured: "Featured",
  urgent: "Urgent",
};

/** Tailwind color tokens per badge, matching the Buysellox.com design system (§3). */
export const BADGE_COLOR: Record<Exclude<Badge, null>, { bg: string; text: string }> = {
  top: { bg: "bg-gold", text: "text-white" },
  featured: { bg: "bg-primary", text: "text-ink" },
  urgent: { bg: "bg-danger", text: "text-white" },
};

export function highestPriorityBadge(badges: Badge[]): Badge {
  for (const b of BADGE_PRIORITY) {
    if (badges.includes(b)) return b;
  }
  return null;
}

/**
 * Default package catalog seeded into the `packages` table. Prices/durations are
 * admin-editable at runtime — this is only the initial seed (see supabase/seed.sql).
 */
export const defaultPackages = [
  {
    key: "featured" as PackageKey,
    name: "Featured",
    badge: "featured" as Badge,
    promotion_rank: PROMOTION_RANK.featured,
    duration_days: 7,
    price: 500,
  },
  {
    key: "featured" as PackageKey,
    name: "Featured (15 days)",
    badge: "featured" as Badge,
    promotion_rank: PROMOTION_RANK.featured,
    duration_days: 15,
    price: 900,
  },
  {
    key: "featured" as PackageKey,
    name: "Featured (30 days)",
    badge: "featured" as Badge,
    promotion_rank: PROMOTION_RANK.featured,
    duration_days: 30,
    price: 1600,
  },
  {
    key: "urgent" as PackageKey,
    name: "Urgent",
    badge: "urgent" as Badge,
    promotion_rank: PROMOTION_RANK.urgent,
    duration_days: 7,
    price: 250,
  },
  {
    key: "top" as PackageKey,
    name: "Top Ad / Spotlight (3 days)",
    badge: "top" as Badge,
    promotion_rank: PROMOTION_RANK.top,
    duration_days: 3,
    price: 1200,
  },
  {
    key: "top" as PackageKey,
    name: "Top Ad / Spotlight (7 days)",
    badge: "top" as Badge,
    promotion_rank: PROMOTION_RANK.top,
    duration_days: 7,
    price: 2200,
  },
  {
    key: "bump" as PackageKey,
    name: "Bump Up",
    badge: null,
    promotion_rank: 0,
    duration_days: 0,
    price: 100,
  },
];
