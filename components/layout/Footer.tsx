import Link from "next/link";
import { categories } from "@/lib/categories";
import { cities } from "@/lib/cities";

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
