import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMessages } from "@/lib/chat";
import ChatThread from "@/components/chat/ChatThread";

export const metadata: Metadata = { title: "Chat" };

export default async function ChatThreadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: conversation } = await supabase
    .from("conversations")
    .select("*, listing:listings(title, slug, category_slug, city_slug)")
    .eq("id", id)
    .maybeSingle();

  if (!conversation) notFound();
  if (conversation.buyer_id !== user.id && conversation.seller_id !== user.id) notFound();

  const messages = await getMessages(supabase, id);

  return (
    <div>
      <h1 className="mb-1 font-heading text-xl font-bold text-ink">
        {conversation.listing?.title}
      </h1>
      <p className="mb-4 text-sm text-ink-muted">Chat about this listing</p>
      <ChatThread conversationId={id} currentUserId={user.id} initialMessages={messages} />
    </div>
  );
}
