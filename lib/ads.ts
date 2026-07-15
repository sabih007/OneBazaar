export const ADSENSE_CLIENT_ID = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID;

/** Per-placement ad unit slot IDs, created in the AdSense dashboard once the site is approved. */
export const AD_SLOTS = {
  home: process.env.NEXT_PUBLIC_ADSENSE_SLOT_HOME,
  search: process.env.NEXT_PUBLIC_ADSENSE_SLOT_SEARCH,
  listing: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING,
  listingSidebar: process.env.NEXT_PUBLIC_ADSENSE_SLOT_LISTING_SIDEBAR,
} as const;
