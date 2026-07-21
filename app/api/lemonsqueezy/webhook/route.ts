import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPromotionPaid } from "@/lib/promotions";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy";

// Uses node:crypto for signature verification.
export const runtime = "nodejs";

const webhookPayloadSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z.object({ promotion_id: z.string() }).partial().optional(),
  }),
  data: z.object({ id: z.string() }),
});

/**
 * Lemon Squeezy's server-to-server payment notification. This is the *only*
 * code path allowed to confirm a promotion payment — the checkout redirect
 * is purely cosmetic and proves nothing on its own.
 *
 * Lemon Squeezy delivers webhooks at-least-once with retries on non-2xx, so
 * markPromotionPaid (lib/promotions.ts) must be — and is — idempotent.
 */
export async function POST(request: NextRequest) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-signature");

  if (!verifyLemonSqueezyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const parsed = webhookPayloadSchema.safeParse(JSON.parse(rawBody));
  if (!parsed.success) {
    console.warn("[lemonsqueezy/webhook] unrecognized payload shape", parsed.error.message);
    return NextResponse.json({ ok: true });
  }

  const { meta, data } = parsed.data;

  if (meta.event_name !== "order_created") {
    return NextResponse.json({ ok: true });
  }

  const promotionId = meta.custom_data?.promotion_id;
  if (!promotionId) {
    console.warn("[lemonsqueezy/webhook] order_created with no promotion_id in custom_data", data.id);
    return NextResponse.json({ ok: true });
  }

  try {
    await markPromotionPaid(createAdminClient(), { promotionId, paymentRef: data.id });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lemonsqueezy/webhook] failed to mark promotion paid", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
