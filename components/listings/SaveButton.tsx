"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Heart } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { toggleFavorite } from "@/lib/listings";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

export default function SaveButton({
  listingId,
  userId,
  initialFavorited,
}: {
  listingId: string;
  userId: string | null;
  initialFavorited: boolean;
}) {
  const router = useRouter();
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!userId) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    if (pending) return;
    setPending(true);
    try {
      const next = await toggleFavorite(createClient(), userId, listingId, favorited);
      setFavorited(next);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button variant="secondary" onClick={onClick} disabled={pending} className="gap-2">
      <Heart className={cn("h-4 w-4", favorited && "fill-danger text-danger")} aria-hidden />
      {favorited ? "Saved" : "Save"}
    </Button>
  );
}
