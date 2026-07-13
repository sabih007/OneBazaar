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

export interface ConversationWithListing extends Conversation {
  listing: {
    title: string;
    slug: string;
    images: string[];
    category_slug: string;
    city_slug: string;
  } | null;
}

export async function getConversations(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("conversations")
    .select("*, listing:listings(title, slug, images, category_slug, city_slug)")
    .or(`buyer_id.eq.${userId},seller_id.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return (data ?? []) as unknown as ConversationWithListing[];
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
