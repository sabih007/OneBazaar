/**
 * Google Analytics 4 measurement ID. Public value (shipped in client HTML by
 * design), so we default to the production ID and let an env var override it —
 * this way the tag works even when the build environment has no env vars set.
 */
export const GA_MEASUREMENT_ID =
  process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "G-N9YC51KGR0";
