import type { Metadata } from "next";
import { MessageCircle } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { getConversationSummaries } from "@/lib/chat";
import ChatList from "@/components/chat/ChatList";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const items = await getConversationSummaries(supabase, user.id);

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">Inbox</h1>

      {items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
          <MessageCircle className="h-10 w-10 text-ink-muted" aria-hidden />
          <p className="mt-3 font-heading text-lg font-semibold text-ink">No conversations yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Message a seller from a listing page to start chatting.
          </p>
        </div>
      ) : (
        <ChatList initialItems={items} currentUserId={user.id} />
      )}
    </div>
  );
}
