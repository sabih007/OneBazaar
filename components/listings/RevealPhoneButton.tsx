"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSellerPhone } from "@/lib/profiles";
import { toWhatsAppNumber } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className={className}>
      <path d="M12.04 2c-5.52 0-10 4.48-10 10 0 1.76.46 3.48 1.34 4.99L2 22l5.17-1.35a9.96 9.96 0 0 0 4.87 1.24h.01c5.52 0 10-4.48 10-10s-4.48-9.89-10.01-9.89Zm5.87 14.24c-.25.7-1.45 1.36-2 1.44-.51.08-1.15.11-1.86-.12-.43-.13-.98-.32-1.68-.62-2.97-1.28-4.9-4.27-5.05-4.47-.15-.2-1.2-1.6-1.2-3.05 0-1.45.76-2.16 1.03-2.46.27-.3.59-.37.78-.37.2 0 .4 0 .57.01.18.01.43-.07.67.51.25.6.85 2.08.92 2.23.07.15.12.32.02.52-.1.2-.15.32-.3.49-.15.17-.31.38-.44.51-.15.15-.3.31-.13.61.17.3.76 1.25 1.63 2.03 1.12 1 2.06 1.31 2.36 1.46.3.15.48.13.65-.08.18-.2.75-.87.95-1.17.2-.3.4-.25.67-.15.28.1 1.75.83 2.05.98.3.15.5.22.57.35.08.13.08.72-.17 1.42Z" />
    </svg>
  );
}

export default function RevealPhoneButton({
  listingId,
  isLoggedIn,
}: {
  listingId: string;
  isLoggedIn: boolean;
}) {
  const router = useRouter();
  const [phone, setPhone] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function reveal() {
    if (!isLoggedIn) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setLoading(true);
    try {
      const number = await getSellerPhone(createClient(), listingId);
      setPhone(number ?? "Not available");
    } finally {
      setLoading(false);
    }
  }

  if (phone) {
    const whatsappNumber = phone !== "Not available" ? toWhatsAppNumber(phone) : null;
    return (
      <div className="flex gap-2">
        <a
          href={`tel:${phone}`}
          className="flex h-11 flex-1 items-center justify-center gap-2 rounded-md border border-primary bg-primary-light px-4 text-sm font-semibold text-primary-text"
        >
          <Phone className="h-4 w-4" aria-hidden />
          {phone}
        </a>
        {whatsappNumber && (
          <a
            href={`https://wa.me/${whatsappNumber}`}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Message on WhatsApp"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line text-[#25D366] transition-colors hover:bg-background"
          >
            <WhatsAppIcon className="h-5 w-5" />
          </a>
        )}
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={reveal} disabled={loading} className="w-full gap-2">
      <Phone className="h-4 w-4" aria-hidden />
      {loading ? "Loading…" : "Show number"}
    </Button>
  );
}
