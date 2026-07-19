import Link from "next/link";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";

// TODO: replace with the real Buysellox profile URLs
const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/",
};

export default function Footer() {
  const topCategories = categories.slice(0, 6);
  const topCities = cities.slice(0, 8);

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      <div className="container-app grid grid-cols-2 gap-8 py-10 sm:grid-cols-4">
        <div className="col-span-2 sm:col-span-1">
          <Link href="/" className="font-heading text-xl font-bold text-primary">
            Buysellox.com
          </Link>
          <p className="mt-2 text-sm text-ink-muted">
            Pakistan&apos;s marketplace to buy and sell anything, safely.
          </p>
          <div className="mt-4 flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Buysellox on Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-primary hover:text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="currentColor"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
              </svg>
            </a>
            <a
              href={SOCIAL_LINKS.instagram}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Buysellox on Instagram"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-primary hover:text-primary"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="h-4 w-4"
              >
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
          </div>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Popular categories</h3>
          <ul className="space-y-2">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/${c.slug}/lahore`}
                  className="text-sm text-ink-muted hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Popular cities</h3>
          <ul className="space-y-2">
            {topCities.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/vehicles/${c.slug}`}
                  className="text-sm text-ink-muted hover:text-primary"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Company</h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/post" className="hover:text-primary">
                Post an ad
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-primary">
                Browse listings
              </Link>
            </li>
            <li>
              <Link href="/partner" className="hover:text-primary">
                Become our partner
              </Link>
            </li>
            <li>
              <Link href="/terms" className="hover:text-primary">
                Terms &amp; Conditions
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="hover:text-primary">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-line py-4">
        <p className="container-app text-center text-xs text-ink-muted">
          © {new Date().getFullYear()} Buysellox.com. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
