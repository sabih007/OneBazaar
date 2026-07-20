"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToConversationUpdates } from "@/lib/chat";
import { UnreadBadge } from "@/components/chat/UnreadBadge";

export default function UnreadNavBadge({
  initialCount,
  userId,
}: {
  initialCount: number;
  userId: string;
}) {
  const [count, setCount] = useState(initialCount);
  const [prevInitialCount, setPrevInitialCount] = useState(initialCount);

  if (initialCount !== prevInitialCount) {
    setPrevInitialCount(initialCount);
    setCount(initialCount);
  }

  useEffect(() => {
    const supabase = createClient();
    const unsubscribe = subscribeToConversationUpdates(supabase, (message) => {
      if (message.sender_id !== userId) setCount((c) => c + 1);
    });
    return unsubscribe;
  }, [userId]);

  return <UnreadBadge count={count} className="absolute -right-1 -top-1" />;
}
