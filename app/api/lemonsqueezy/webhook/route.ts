import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { createAdminClient } from "@/lib/supabase/admin";
import { markPromotionPaid } from "@/lib/promotions";
import { verifyLemonSqueezyWebhookSignature } from "@/lib/lemonsqueezy";
import { TIER_INFO, isSubscriptionTier } from "@/lib/subscriptions";

// Uses node:crypto for signature verification.
export const runtime = "nodejs";

const webhookPayloadSchema = z.object({
  meta: z.object({
    event_name: z.string(),
    custom_data: z
      .object({ promotion_id: z.string(), user_id: z.string(), tier: z.string() })
      .partial()
      .optional(),
  }),
  data: z.object({
    id: z.string(),
    attributes: z.record(z.string(), z.unknown()).optional(),
  }),
});

/**
 * Lemon Squeezy's server-to-server payment notification — the *only* code
 * path allowed to confirm a one-time payment or activate/renew/cancel a
 * subscription. The checkout redirect is purely cosmetic and proves
 * nothing on its own.
 *
 * Lemon Squeezy delivers webhooks at-least-once with retries on non-2xx,
 * so every handler below is idempotent (markPromotionPaid filters on
 * payment_status='pending'; subscription_payment_success uses the
 * subscription_credit_grants ledger, since there's no equivalent
 * pending->paid row to filter on for a recurring charge).
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
  const admin = createAdminClient();

  try {
    switch (meta.event_name) {
      case "order_created": {
        const promotionId = meta.custom_data?.promotion_id;
        if (!promotionId) {
          console.warn("[lemonsqueezy/webhook] order_created with no promotion_id in custom_data", data.id);
          break;
        }
        await markPromotionPaid(admin, { promotionId, paymentRef: data.id });
        break;
      }

      case "subscription_created": {
        const userId = meta.custom_data?.user_id;
        const tier = meta.custom_data?.tier;
        if (!userId || !isSubscriptionTier(tier)) {
          console.warn("[lemonsqueezy/webhook] subscription_created with missing/invalid custom_data", data.id);
          break;
        }
        const renewsAt = data.attributes?.renews_at;
        const { error } = await admin.from("subscriptions").upsert(
          {
            user_id: userId,
            tier,
            status: "active",
            ls_subscription_id: data.id,
            active_slot_limit: TIER_INFO[tier].activeSlotLimit,
            current_period_end: typeof renewsAt === "string" ? renewsAt : null,
          },
          { onConflict: "user_id" }
        );
        if (error) throw error;
        break;
      }

      case "subscription_payment_success": {
        // Fires for both the first payment and every renewal — credits are
        // granted here only (not in subscription_created), and only once
        // per invoice, via the subscription_credit_grants ledger.
        const userId = meta.custom_data?.user_id;
        const tier = meta.custom_data?.tier;
        if (!userId || !isSubscriptionTier(tier)) {
          console.warn("[lemonsqueezy/webhook] subscription_payment_success with missing/invalid custom_data", data.id);
          break;
        }

        const { error: ledgerError } = await admin
          .from("subscription_credit_grants")
          .insert({ ls_event_id: `subscription_invoice_${data.id}`, user_id: userId });
        if (ledgerError) {
          if (ledgerError.code === "23505") break; // already processed this invoice
          throw ledgerError;
        }

        const info = TIER_INFO[tier];
        const { error: grantError } = await admin.rpc("grant_subscription_credits", {
          p_user_id: userId,
          p_featured: info.featuredCredits,
          p_hot: info.hotCredits,
          p_refresh: info.refreshCredits,
        });
        if (grantError) throw grantError;
        break;
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        const status = meta.event_name === "subscription_cancelled" ? "cancelled" : "expired";
        const { error } = await admin
          .from("subscriptions")
          .update({ status })
          .eq("ls_subscription_id", data.id);
        if (error) throw error;
        break;
      }

      default:
        break; // ack and ignore — no other event types are relevant here
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[lemonsqueezy/webhook]", meta.event_name, err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
