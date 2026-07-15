"use client";

import { useEffect } from "react";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";

interface AdSlotProps {
  slot?: string;
  label?: string;
  className?: string;
}

/**
 * Renders nothing in production until both an AdSense client ID and a slot ID are configured
 * (§ .env.local.example). In development, shows a dashed placeholder instead so the layout is
 * visible before an AdSense account exists.
 */
export default function AdSlot({ slot, label, className }: AdSlotProps) {
  useEffect(() => {
    if (!ADSENSE_CLIENT_ID || !slot) return;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // AdSense script hasn't finished loading yet; it'll pick up the <ins> on its own pass.
    }
  }, [slot]);

  if (!ADSENSE_CLIENT_ID || !slot) {
    if (process.env.NODE_ENV === "production") return null;
    return (
      <div
        className={cn(
          "flex min-h-24 flex-col items-center justify-center gap-2 rounded-md border border-dashed border-line bg-background p-4 text-xs text-ink-muted",
          className
        )}
      >
        <ImageOff className="h-6 w-6" strokeWidth={1.5} />
        <span>Ad space{label ? ` — ${label}` : ""} (AdSense not configured)</span>
      </div>
    );
  }

  return (
    <div className={cn("overflow-hidden", className)}>
      <ins
        className="adsbygoogle block"
        style={{ display: "block" }}
        data-ad-client={ADSENSE_CLIENT_ID}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </div>
  );
}
