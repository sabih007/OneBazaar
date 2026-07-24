"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import {
  markConversationRead,
  sendMessage,
  subscribeToMessages,
  uploadVoiceMessage,
} from "@/lib/chat";
import type { Message } from "@/types/database";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";
import VoiceRecorder from "@/components/chat/VoiceRecorder";
import VoiceMessageBubble from "@/components/chat/VoiceMessageBubble";

export default function ChatThread({
  conversationId,
  currentUserId,
  initialMessages,
}: {
  conversationId: string;
  currentUserId: string;
  initialMessages: Message[];
}) {
  const [messages, setMessages] = useState(initialMessages);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    const unsubscribe = subscribeToMessages(supabase, conversationId, (message) => {
      setMessages((prev) => (prev.some((m) => m.id === message.id) ? prev : [...prev, message]));
      if (message.sender_id !== currentUserId) {
        markConversationRead(supabase, conversationId).catch(() => {});
      }
    });
    return unsubscribe;
  }, [conversationId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages.length]);

  async function onSend() {
    const body = draft.trim();
    if (!body || sending) return;
    setDraft("");
    setSending(true);

    const tempId = `temp-${Date.now()}`;
    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        body,
        audio_url: null,
        audio_duration_ms: null,
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ]);

    try {
      const sent = await sendMessage(createClient(), { conversationId, senderId: currentUserId, body });
      setMessages((prev) => {
        const seen = new Set<string>();
        return prev
          .map((m) => (m.id === tempId ? sent : m))
          .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
      setDraft(body); // give the message back so it isn't lost
    } finally {
      setSending(false);
    }
  }

  async function onSendVoice(blob: Blob, durationMs: number) {
    const tempId = `temp-${Date.now()}`;
    const localUrl = URL.createObjectURL(blob);

    setMessages((prev) => [
      ...prev,
      {
        id: tempId,
        conversation_id: conversationId,
        sender_id: currentUserId,
        body: null,
        audio_url: localUrl,
        audio_duration_ms: durationMs,
        created_at: new Date().toISOString(),
        read_at: null,
      },
    ]);

    try {
      const supabase = createClient();
      const audioUrl = await uploadVoiceMessage(supabase, currentUserId, blob);
      const sent = await sendMessage(supabase, {
        conversationId,
        senderId: currentUserId,
        audioUrl,
        audioDurationMs: durationMs,
      });
      setMessages((prev) => {
        const seen = new Set<string>();
        return prev
          .map((m) => (m.id === tempId ? sent : m))
          .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)));
      });
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== tempId));
    } finally {
      URL.revokeObjectURL(localUrl);
    }
  }

  return (
    <div className="flex h-[70vh] flex-col rounded-md border border-line bg-surface">
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((m) => {
          const mine = m.sender_id === currentUserId;
          return (
            <div key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
              <div
                className={cn(
                  "max-w-[75%] rounded-md px-3.5 py-2 text-sm",
                  mine ? "bg-primary text-white" : "bg-background text-ink"
                )}
              >
                {m.audio_url ? (
                  <VoiceMessageBubble
                    src={m.audio_url}
                    durationMs={m.audio_duration_ms ?? 0}
                    mine={mine}
                  />
                ) : (
                  m.body
                )}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <div className="flex items-center gap-2 border-t border-line p-3">
        {!recording && (
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
            placeholder="Type a message…"
            className="h-11 min-w-0 flex-1 rounded-md border border-line bg-surface px-3.5 text-sm text-ink focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        )}
        <VoiceRecorder onRecorded={onSendVoice} onRecordingChange={setRecording} disabled={sending} />
        {!recording && (
          <Button
            onClick={onSend}
            disabled={sending || !draft.trim()}
            aria-label="Send message"
            className="shrink-0"
          >
            <Send className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  );
}
