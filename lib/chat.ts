import type { SupabaseClient } from "@supabase/supabase-js";
import type { Conversation, Message } from "@/types/database";

export async function getOrCreateConversation(
  supabase: SupabaseClient,
  { listingId, buyerId, sellerId }: { listingId: string; buyerId: string; sellerId: string }
) {
  const { data: existing, error: findError } = await supabase
    .from("conversations")
    .select("*")
    .eq("listing_id", listingId)
    .eq("buyer_id", buyerId)
    .maybeSingle();

  if (findError) throw findError;
  if (existing) return existing as Conversation;

  const { data, error } = await supabase
    .from("conversations")
    .insert({ listing_id: listingId, buyer_id: buyerId, seller_id: sellerId })
    .select()
    .single();

  if (error) throw error;
  return data as Conversation;
}

export interface ChatListItem {
  id: string;
  otherUserId: string;
  otherUserName: string;
  otherUserAvatar: string | null;
  listing: {
    title: string;
    slug: string;
    images: string[];
    category_slug: string;
    city_slug: string;
  } | null;
  lastMessage: {
    body: string;
    senderId: string;
    createdAt: string;
  } | null;
  unreadCount: number;
  updatedAt: string;
}

interface ConversationSummaryRow {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
  last_message_body: string | null;
  last_message_sender_id: string | null;
  last_message_created_at: string | null;
  unread_count: number;
}

export async function getConversationSummaries(
  supabase: SupabaseClient,
  userId: string
): Promise<ChatListItem[]> {
  const { data, error } = await supabase.rpc("conversation_summaries");
  if (error) throw error;

  const rows = (data ?? []) as ConversationSummaryRow[];
  if (rows.length === 0) return [];

  const listingIds = Array.from(new Set(rows.map((r) => r.listing_id)));
  const otherIds = Array.from(
    new Set(rows.map((r) => (r.buyer_id === userId ? r.seller_id : r.buyer_id)))
  );

  const [{ data: listings }, { data: profiles }] = await Promise.all([
    supabase
      .from("listings")
      .select("id, title, slug, images, category_slug, city_slug")
      .in("id", listingIds),
    supabase.from("profiles_public").select("id, full_name, avatar_url").in("id", otherIds),
  ]);

  const listingById = new Map((listings ?? []).map((l) => [l.id, l]));
  const profileById = new Map((profiles ?? []).map((p) => [p.id, p]));

  return rows.map((r) => {
    const otherId = r.buyer_id === userId ? r.seller_id : r.buyer_id;
    const profile = profileById.get(otherId);
    const listing = listingById.get(r.listing_id);
    return {
      id: r.id,
      otherUserId: otherId,
      otherUserName: profile?.full_name || "Buysellox.com user",
      otherUserAvatar: profile?.avatar_url ?? null,
      listing: listing
        ? {
            title: listing.title,
            slug: listing.slug,
            images: listing.images,
            category_slug: listing.category_slug,
            city_slug: listing.city_slug,
          }
        : null,
      lastMessage:
        r.last_message_body != null
          ? {
              body: r.last_message_body,
              senderId: r.last_message_sender_id!,
              createdAt: r.last_message_created_at!,
            }
          : null,
      unreadCount: r.unread_count,
      updatedAt: r.last_message_created_at ?? r.created_at,
    };
  });
}

export async function getUnreadMessageCount(supabase: SupabaseClient): Promise<number> {
  const { data, error } = await supabase.rpc("unread_message_count");
  if (error) throw error;
  return (data as number) ?? 0;
}

export async function markConversationRead(supabase: SupabaseClient, conversationId: string) {
  const { error } = await supabase
    .from("messages")
    .update({ read_at: new Date().toISOString() })
    .eq("conversation_id", conversationId)
    .is("read_at", null);

  if (error) throw error;
}

export async function getMessages(supabase: SupabaseClient, conversationId: string) {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return (data ?? []) as Message[];
}

export async function sendMessage(
  supabase: SupabaseClient,
  { conversationId, senderId, body }: { conversationId: string; senderId: string; body: string }
) {
  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, body })
    .select()
    .single();

  if (error) throw error;
  return data as Message;
}

export function subscribeToMessages(
  supabase: SupabaseClient,
  conversationId: string,
  onInsert: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "messages",
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function subscribeToConversationUpdates(
  supabase: SupabaseClient,
  onInsert: (message: Message) => void
) {
  const channel = supabase
    .channel("inbox:messages")
    .on(
      "postgres_changes",
      { event: "INSERT", schema: "public", table: "messages" },
      (payload) => onInsert(payload.new as Message)
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
