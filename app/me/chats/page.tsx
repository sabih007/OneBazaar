import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ImageOff, MessageCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { getConversations } from "@/lib/chat";

export const metadata: Metadata = { title: "Inbox" };

export default async function InboxPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const conversations = await getConversations(supabase, user.id);

  const otherPartyIds = Array.from(
    new Set(conversations.map((c) => (c.buyer_id === user.id ? c.seller_id : c.buyer_id)))
  );

  const { data: profiles } = otherPartyIds.length
    ? await supabase.from("profiles_public").select("id, full_name").in("id", otherPartyIds)
    : { data: [] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div>
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">Inbox</h1>

      {conversations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-md border border-dashed border-line bg-surface px-6 py-16 text-center">
          <MessageCircle className="h-10 w-10 text-ink-muted" aria-hidden />
          <p className="mt-3 font-heading text-lg font-semibold text-ink">No conversations yet</p>
          <p className="mt-1 text-sm text-ink-muted">
            Message a seller from a listing page to start chatting.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {conversations.map((c) => {
            const otherId = c.buyer_id === user.id ? c.seller_id : c.buyer_id;
            const cover = c.listing?.images?.[0];
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
                  <p className="truncate text-sm font-medium text-ink">
                    {nameById.get(otherId) || "OneBazaar user"}
                  </p>
                  <p className="truncate text-xs text-ink-muted">{c.listing?.title}</p>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
