import { createHmac, timingSafeEqual } from "crypto";

/**
 * Server-only Lemon Squeezy client. Never import this from a client component —
 * it reads LEMONSQUEEZY_API_KEY-adjacent config and talks to Lemon Squeezy directly.
 *
 * One generic "Listing Promotion" product/variant lives in the LS dashboard
 * (LEMONSQUEEZY_VARIANT_ID) and every checkout overrides its price via
 * `custom_price`, sourced live from `packages.price` (admin-editable) — this
 * avoids having to keep N Lemon Squeezy variants in sync with the packages
 * table. `custom_price` is in the store's currency subunits (paisa for a
 * PKR-denominated store, by analogy to USD cents) — unconfirmed against a
 * real API response, verify with a real test-mode purchase before going live.
 */

const API_BASE_URL = "https://api.lemonsqueezy.com/v1";

function apiKey() {
  const key = process.env.LEMONSQUEEZY_API_KEY;
  if (!key) throw new Error("LEMONSQUEEZY_API_KEY is not set");
  return key;
}

function storeId() {
  const id = process.env.LEMONSQUEEZY_STORE_ID;
  if (!id) throw new Error("LEMONSQUEEZY_STORE_ID is not set");
  return id;
}

function variantId() {
  const id = process.env.LEMONSQUEEZY_VARIANT_ID;
  if (!id) throw new Error("LEMONSQUEEZY_VARIANT_ID is not set");
  return id;
}

export async function createLemonSqueezyCheckout({
  promotionId,
  price,
  redirectUrl,
}: {
  promotionId: string;
  price: number;
  redirectUrl: string;
}) {
  const res = await fetch(`${API_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          custom_price: Math.round(price * 100),
          checkout_data: { custom: { promotion_id: promotionId } },
          product_options: { redirect_url: redirectUrl },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId() } },
          variant: { data: { type: "variants", id: variantId() } },
        },
      },
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text();
    // Lemon Squeezy enforces a minimum checkout amount (~PKR 139, drifts
    // with FX since it's pegged to a USD floor) — surface that plainly
    // instead of a raw 422, since it's a real (if rare) admin-price case.
    if (res.status === 422 && /custom price/i.test(bodyText)) {
      throw new Error("This package's price is below Lemon Squeezy's minimum checkout amount — raise its price and try again.");
    }
    throw new Error(`Lemon Squeezy checkout creation failed: ${res.status} ${bodyText}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) {
    throw new Error(`Lemon Squeezy checkout response missing url: ${JSON.stringify(json)}`);
  }
  return url as string;
}

/**
 * Starts a subscription checkout against one of the three fixed dealer-tier
 * variants (LEMONSQUEEZY_SHOP/DEALER/BUSINESS_PRO_VARIANT_ID) — unlike the
 * one-time boost checkout, no custom_price override: each tier has its own
 * real LS variant with a fixed recurring price set in the dashboard.
 */
export async function createLemonSqueezySubscriptionCheckout({
  userId,
  tier,
  variantId: subscriptionVariantId,
  redirectUrl,
}: {
  userId: string;
  tier: string;
  variantId: string;
  redirectUrl: string;
}) {
  const res = await fetch(`${API_BASE_URL}/checkouts`, {
    method: "POST",
    headers: {
      Accept: "application/vnd.api+json",
      "Content-Type": "application/vnd.api+json",
      Authorization: `Bearer ${apiKey()}`,
    },
    body: JSON.stringify({
      data: {
        type: "checkouts",
        attributes: {
          checkout_data: { custom: { user_id: userId, tier } },
          product_options: { redirect_url: redirectUrl },
        },
        relationships: {
          store: { data: { type: "stores", id: storeId() } },
          variant: { data: { type: "variants", id: subscriptionVariantId } },
        },
      },
    }),
  });

  if (!res.ok) {
    throw new Error(`Lemon Squeezy subscription checkout creation failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.url;
  if (!url) {
    throw new Error(`Lemon Squeezy checkout response missing url: ${JSON.stringify(json)}`);
  }
  return url as string;
}

/**
 * Fetches a fresh Customer Portal link for a subscription — Lemon Squeezy's
 * signed portal/payment-method URLs expire 24h after being issued, so this
 * must be called live per "Manage subscription" click, never cached.
 */
export async function getSubscriptionPortalUrl(lsSubscriptionId: string) {
  const res = await fetch(`${API_BASE_URL}/subscriptions/${lsSubscriptionId}`, {
    headers: {
      Accept: "application/vnd.api+json",
      Authorization: `Bearer ${apiKey()}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Lemon Squeezy subscription lookup failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const url = json?.data?.attributes?.urls?.customer_portal;
  if (!url) {
    throw new Error(`Lemon Squeezy subscription response missing customer_portal url: ${JSON.stringify(json)}`);
  }
  return url as string;
}

/**
 * Verifies the `X-Signature` header on an incoming Lemon Squeezy webhook.
 * `rawBody` must be the exact, unparsed request body — the HMAC is computed
 * over raw bytes, so parsing JSON first (which can reorder/reformat) breaks
 * verification. Returns false (never throws) on any missing input; the
 * caller decides the HTTP response.
 */
export function verifyLemonSqueezyWebhookSignature(rawBody: string, signatureHeader: string | null): boolean {
  const secret = process.env.LEMONSQUEEZY_WEBHOOK_SECRET;
  if (!secret || !signatureHeader) return false;

  const digest = Buffer.from(createHmac("sha256", secret).update(rawBody).digest("hex"), "utf8");
  const signature = Buffer.from(signatureHeader, "utf8");

  // timingSafeEqual throws (not returns false) on a length mismatch, so that
  // has to be checked first rather than relying on it to reject a bad signature.
  if (digest.length !== signature.length) return false;
  return timingSafeEqual(digest, signature);
}
