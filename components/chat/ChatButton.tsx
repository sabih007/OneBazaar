"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateConversation } from "@/lib/chat";
import { Button } from "@/components/ui/Button";

export default function ChatButton({
  listingId,
  sellerId,
  userId,
}: {
  listingId: string;
  sellerId: string;
  userId: string | null;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    if (!userId) {
      router.push("/login?redirect=" + encodeURIComponent(window.location.pathname));
      return;
    }
    setPending(true);
    try {
      const conversation = await getOrCreateConversation(createClient(), {
        listingId,
        buyerId: userId,
        sellerId,
      });
      router.push(`/me/chats/${conversation.id}`);
    } finally {
      setPending(false);
    }
  }

  return (
    <Button onClick={onClick} disabled={pending} className="w-full gap-2">
      <MessageCircle className="h-4 w-4" aria-hidden />
      {pending ? "Opening chat…" : "Chat with seller"}
    </Button>
  );
}
