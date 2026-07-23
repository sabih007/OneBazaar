import Link from "next/link";
import Image from "next/image";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";
import NewsletterForm from "@/components/layout/NewsletterForm";

const SOCIAL_LINKS = {
  facebook: "https://www.facebook.com/profile.php?id=61592255335096",
};

export default function Footer() {
  const topCategories = categories.slice(0, 6);
  const topCities = cities.slice(0, 8);
  const year = new Date().getFullYear();

  return (
    <footer className="mt-16 border-t border-line bg-surface">
      {/* Newsletter band */}
      <div className="border-b border-line">
        <div className="container-app flex flex-col gap-4 py-8 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-lg font-semibold text-ink">Stay in the loop</h3>
            <p className="mt-1 text-sm text-ink-muted">
              New listings, tips, and updates from Buysellox — straight to your inbox.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      {/* Main columns */}
      <div className="container-app grid grid-cols-2 gap-8 py-12 sm:grid-cols-4">
        {/* Brand */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1">
          <Link href="/" aria-label="Buysellox.com — home" className="inline-flex">
            <Image
              src="/logo-primary.png"
              alt="Buysellox.com"
              width={880}
              height={228}
              className="h-9 w-auto"
            />
          </Link>
          <p className="mt-3 max-w-xs text-sm text-ink-muted">
            Pakistan&apos;s marketplace to buy and sell anything, safely — across every major city.
          </p>
          <span className="mt-4 inline-block rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-primary-text">
            Beta
          </span>

          <div className="mt-4 flex items-center gap-3">
            <a
              href={SOCIAL_LINKS.facebook}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Follow Buysellox on Facebook"
              className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-muted transition-colors hover:border-primary hover:text-primary-text"
            >
              <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
                <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
              </svg>
            </a>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Popular categories</h3>
          <ul className="space-y-2">
            {topCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}/lahore`} className="text-sm text-ink-muted hover:text-primary-text">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Cities */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Popular cities</h3>
          <ul className="space-y-2">
            {topCities.map((c) => (
              <li key={c.slug}>
                <Link href={`/vehicles/${c.slug}`} className="text-sm text-ink-muted hover:text-primary-text">
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Company */}
        <div>
          <h3 className="mb-3 text-sm font-semibold text-ink">Company</h3>
          <ul className="space-y-2 text-sm text-ink-muted">
            <li>
              <Link href="/post" className="hover:text-primary-text">
                Post an ad
              </Link>
            </li>
            <li>
              <Link href="/search" className="hover:text-primary-text">
                Browse listings
              </Link>
            </li>
            <li>
              <Link href="/partner" className="hover:text-primary-text">
                Become our partner
              </Link>
            </li>
            <li>
              <Link href="/contact" className="hover:text-primary-text">
                Contact us
              </Link>
            </li>
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-5 text-xs text-ink-muted sm:flex-row">
          <p>© {year} Buysellox.com. All rights reserved.</p>
          <div className="flex items-center gap-5">
            <Link href="/terms" className="hover:text-primary-text">
              Terms &amp; Conditions
            </Link>
            <Link href="/privacy" className="hover:text-primary-text">
              Privacy Policy
            </Link>
            <Link href="/refund-policy" className="hover:text-primary-text">
              Refund Policy
            </Link>
            <Link href="/ownership" className="hover:text-primary-text">
              Ownership
            </Link>
            <Link href="/partner" className="hover:text-primary-text">
              Partner
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
