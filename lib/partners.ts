export type PartnerTier = "partner" | "premium";

export interface PartnerTierInfo {
  key: PartnerTier;
  /** Public status label shown once approved. */
  name: string;
  tagline: string;
  /** Visually emphasise this tier on the marketing page. */
  highlight?: boolean;
  benefits: string[];
}

export const PARTNER_TIERS: PartnerTierInfo[] = [
  {
    key: "partner",
    name: "Our Partner",
    tagline: "For growing businesses ready to reach more buyers.",
    benefits: [
      '"Our Partner" badge on your profile and listings',
      "Priority placement in relevant categories",
      "Verified seller status",
      "Email support from the Buysellox team",
    ],
  },
  {
    key: "premium",
    name: "Our Premium Partner",
    tagline: "Maximum visibility and hands-on support for serious sellers.",
    highlight: true,
    benefits: [
      "Everything in Our Partner, plus:",
      '"Our Premium Partner" badge with top billing',
      "Featured placement on the homepage",
      "Dedicated account manager & priority support",
      "Bulk listing tools and monthly performance reports",
    ],
  },
];
