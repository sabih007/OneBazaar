"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { deleteSavedSearch } from "@/lib/saved-searches";

export default function DeleteSavedSearchButton({ id }: { id: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onDelete() {
    setPending(true);
    try {
      await deleteSavedSearch(createClient(), id);
      router.refresh();
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onDelete}
      disabled={pending}
      aria-label="Remove saved search"
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-ink-muted transition-colors hover:bg-background hover:text-danger disabled:opacity-50"
    >
      <X className="h-4 w-4" aria-hidden />
    </button>
  );
}
