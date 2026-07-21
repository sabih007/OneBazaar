"use client";

import { useRef, useState } from "react";
import { Check, Link2, Share2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

const WhatsAppIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.46 1.32 4.96L2 22l5.25-1.38a9.9 9.9 0 0 0 4.78 1.22h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2Zm5.76 14.15c-.24.68-1.4 1.3-1.93 1.35-.5.06-1.03.29-3.45-.72-2.92-1.21-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-3 0-1.42.75-2.12 1.01-2.41.27-.29.58-.36.78-.36h.55c.18 0 .42-.07.65.5.24.58.82 2 .89 2.15.07.14.11.32.02.51-.09.19-.14.31-.28.48-.14.16-.29.36-.42.48-.14.14-.28.28-.12.55.16.28.72 1.18 1.54 1.92 1.06.94 1.95 1.24 2.23 1.38.28.14.45.12.61-.07.17-.2.71-.83.9-1.11.19-.28.38-.24.63-.14.26.09 1.65.78 1.93.92.28.14.47.21.54.33.07.12.07.68-.17 1.36Z" />
  </svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="h-4 w-4">
    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987H7.898v-2.89h2.54V9.797c0-2.507 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12Z" />
  </svg>
);

export default function ShareButton({
  title,
  url,
  variant = "button",
  iconSize = "sm",
  className,
}: {
  title: string;
  /** Absolute or relative URL to share — defaults to the current page. Pass this explicitly on listing cards, where the current page (e.g. the homepage) isn't the listing's own URL. */
  url?: string;
  /** "button" for the full labeled button (listing detail page); "icon" for a compact circular button (cards). */
  variant?: "button" | "icon";
  /** Only applies to variant="icon" — matches the adjacent favorite-heart button's size. */
  iconSize?: "sm" | "md";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  function resolvedUrl() {
    if (typeof window === "undefined") return url ?? "";
    return url ? new URL(url, window.location.origin).href : window.location.href;
  }

  async function share(e: React.MouseEvent) {
    // Cards render this inside a full-card <Link> — never let the click bubble into it.
    e.preventDefault();
    e.stopPropagation();

    const shareUrl = resolvedUrl();

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, url: shareUrl });
      } catch {
        // user cancelled — not an error
      }
      return;
    }

    setOpen((v) => !v);
  }

  async function copyLink(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(resolvedUrl());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard access denied — nothing more we can do
    }
  }

  const shareText = encodeURIComponent(`${title} — ${resolvedUrl()}`);
  const shareUrlParam = encodeURIComponent(resolvedUrl());

  return (
    <div className={cn("relative", className)} ref={ref} onClick={(e) => e.stopPropagation()}>
      {variant === "icon" ? (
        <button
          onClick={share}
          aria-label="Share this listing"
          className={cn(
            "flex items-center justify-center rounded-full bg-surface/90 text-ink-muted shadow-sm backdrop-blur transition-transform duration-150 hover:scale-105",
            iconSize === "md" ? "h-10 w-10" : "h-9 w-9"
          )}
        >
          <Share2 className={iconSize === "md" ? "h-5 w-5" : "h-4.5 w-4.5"} aria-hidden />
        </button>
      ) : (
        <Button variant="secondary" onClick={share} className="gap-2">
          <Share2 className="h-4 w-4" aria-hidden />
          Share
        </Button>
      )}

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-52 rounded-md border border-line bg-surface py-1 shadow-[var(--shadow-card-hover)]">
          <a
            href={`https://wa.me/?text=${shareText}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-background"
          >
            <WhatsAppIcon />
            WhatsApp
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${shareUrlParam}`}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-background"
          >
            <FacebookIcon />
            Facebook
          </a>
          <button
            onClick={copyLink}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-ink hover:bg-background"
          >
            {copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Link2 className="h-4 w-4" aria-hidden />}
            {copied ? "Copied!" : "Copy link"}
          </button>
        </div>
      )}
    </div>
  );
}
