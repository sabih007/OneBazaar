"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Rocket, Handshake, ArrowRight, X } from "lucide-react";

const STORAGE_KEY = "bso-beta-popup-seen";

export default function BetaPartnerPopup() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Show once per browser session (visit + revisit), but not on /partner.
  useEffect(() => {
    if (pathname?.startsWith("/partner")) return;
    let seen = false;
    try {
      seen = sessionStorage.getItem(STORAGE_KEY) === "1";
    } catch {
      // sessionStorage may be unavailable (privacy mode) — just show it.
    }
    if (seen) return;

    const timer = setTimeout(() => {
      setOpen(true);
      try {
        sessionStorage.setItem(STORAGE_KEY, "1");
      } catch {
        /* ignore */
      }
    }, 1200);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Lock body scroll + close on Escape while open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="beta-popup-title"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <button
        type="button"
        aria-label="Close"
        onClick={() => setOpen(false)}
        className="absolute inset-0 h-full w-full cursor-default bg-ink/50 backdrop-blur-sm"
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-[var(--radius-lg)] border border-line bg-surface shadow-[var(--shadow-card-hover)]">
        <button
          type="button"
          aria-label="Close"
          onClick={() => setOpen(false)}
          className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-primary-light hover:text-primary-text"
        >
          <X className="h-4 w-4" aria-hidden />
        </button>

        <div className="bg-gradient-to-br from-primary-light/80 to-surface px-6 pt-8 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary text-ink shadow-[var(--shadow-card)]">
            <Rocket className="h-6 w-6" aria-hidden />
          </span>
          <span className="mt-4 inline-block rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-text">
            Beta
          </span>
          <h2
            id="beta-popup-title"
            className="mt-3 font-heading text-2xl font-bold text-ink"
          >
            We&apos;re in Beta!
          </h2>
        </div>

        <div className="px-6 pb-6 pt-4 text-center">
          <p className="text-sm text-ink-muted">
            Buysellox.com is brand new and still improving every day. Want to grow with us? Join
            early as a partner and get badges, priority placement, and dedicated support.
          </p>

          <div className="mt-6 flex flex-col gap-2">
            <Link
              href="/partner"
              onClick={() => setOpen(false)}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-ink transition-colors hover:bg-primary-hover"
            >
              <Handshake className="h-4 w-4" aria-hidden />
              Become a partner
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-md px-5 py-2 text-sm font-medium text-ink-muted transition-colors hover:text-ink"
            >
              Maybe later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
