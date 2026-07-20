"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Phone } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getSellerPhone } from "@/lib/profiles";
import { Button } from "@/components/ui/Button";

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
    return (
      <a
        href={`tel:${phone}`}
        className="flex h-11 items-center justify-center gap-2 rounded-md border border-primary bg-primary-light px-4 text-sm font-semibold text-primary-text"
      >
        <Phone className="h-4 w-4" aria-hidden />
        {phone}
      </a>
    );
  }

  return (
    <Button variant="secondary" onClick={reveal} disabled={loading} className="w-full gap-2">
      <Phone className="h-4 w-4" aria-hidden />
      {loading ? "Loading…" : "Show number"}
    </Button>
  );
}
