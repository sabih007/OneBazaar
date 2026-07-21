"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

/**
 * Next.js's App Router scroll-to-top-on-navigate can lose the race with a
 * Suspense boundary that suspends mid-navigation (e.g. any page reading
 * useSearchParams, like /login and /signup) — the browser keeps the old
 * page's scroll offset, and since the new page is often much shorter, that
 * offset gets clamped to the new page's max scroll, landing the viewport
 * at/near the footer instead of the top. Force it explicitly on every
 * route change instead of relying on the built-in behavior.
 */
export default function ScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
