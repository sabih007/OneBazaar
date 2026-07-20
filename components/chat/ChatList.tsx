"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ImageOff } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { subscribeToConversationUpdates, type ChatListItem } from "@/lib/chat";
import { cn, formatChatTimestamp } from "@/lib/utils";
import { UnreadBadge } from "@/components/chat/UnreadBadge";

export default function ChatList({
  initialItems,
  currentUserId,
}: {
  initialItems: ChatListItem[];
  currentUserId: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);

  if (initialItems !== prevInitialItems) {
    setPrevInitialItems(initialItems);
    setItems(initialItems);
  }

  useEffect(() => {
    const supabase = createClient();
    const unsubscribe = subscribeToConversationUpdates(supabase, (message) => {
      setItems((prev) => {
        const index = prev.findIndex((c) => c.id === message.conversation_id);
        if (index === -1) return prev;

        const current = prev[index];
        const updated: ChatListItem = {
          ...current,
          lastMessage: {
            body: message.body,
            senderId: message.sender_id,
            createdAt: message.created_at,
          },
          updatedAt: message.created_at,
          unreadCount:
            message.sender_id === currentUserId ? current.unreadCount : current.unreadCount + 1,
        };

        const next = [...prev];
        next.splice(index, 1);
        return [updated, ...next];
      });
    });
    return unsubscribe;
  }, [currentUserId]);

  return (
    <div className="space-y-2">
      {items.map((c) => {
        const cover = c.listing?.images?.[0];
        const unread = c.unreadCount > 0;
        const preview = c.lastMessage
          ? `${c.lastMessage.senderId === currentUserId ? "You: " : ""}${c.lastMessage.body}`
          : "Say hello \u{1F44B}";

        return (
          <Link
            key={c.id}
            href={`/me/chats/${c.id}`}
            className="flex items-center gap-3 rounded-md border border-line bg-surface p-3 transition-colors hover:border-primary/50"
          >
            <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-md bg-background">
              {cover ? (
                <Image src={cover} alt="" fill className="object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-ink-muted">
                  <ImageOff className="h-5 w-5" />
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <p
                  className={cn(
                    "truncate text-sm text-ink",
                    unread ? "font-semibold" : "font-medium"
                  )}
                >
                  {c.otherUserName}
                </p>
                <span className="shrink-0 text-xs text-ink-muted">
                  {formatChatTimestamp(c.updatedAt)}
                </span>
              </div>
              <p className="truncate text-xs text-ink-muted">{c.listing?.title}</p>
              <p
                className={cn("truncate text-xs", unread ? "font-semibold text-ink" : "text-ink-muted")}
              >
                {preview}
              </p>
            </div>
            <UnreadBadge count={c.unreadCount} className="shrink-0" />
          </Link>
        );
      })}
    </div>
  );
}
