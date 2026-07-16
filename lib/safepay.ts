/**
 * Server-only Safepay client (§6). Never import this from a client component —
 * it reads SAFEPAY_SECRET_KEY-adjacent config and talks to Safepay directly.
 *
 * Confirmed against the live sandbox API (not just docs) on 2026-07-14:
 *   POST {base}/order/v1/init  -> { data: { token: "track_...", state, transaction, ... } }
 *   GET  {base}/order/v1/{token} -> same shape, current state
 * The exact terminal `state` string for a completed payment hasn't been observed
 * yet (needs one real test purchase through the hosted checkout) — see the
 * `paid` heuristic below, which is intentionally conservative: it only reports
 * paid once a `transaction` object exists and the state doesn't look like a
 * failure/cancellation. Adjust once we've seen a real completed transaction.
 */

const ENVIRONMENT = process.env.NEXT_PUBLIC_SAFEPAY_ENVIRONMENT === "production" ? "production" : "sandbox";

const API_BASE_URL =
  ENVIRONMENT === "production" ? "https://api.getsafepay.com" : "https://sandbox.api.getsafepay.com";

const CHECKOUT_BASE_URL =
  ENVIRONMENT === "production" ? "https://www.getsafepay.com/components" : "https://sandbox.api.getsafepay.com/components";

function publicKey() {
  const key = process.env.NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY;
  if (!key) throw new Error("NEXT_PUBLIC_SAFEPAY_PUBLIC_KEY is not set");
  return key;
}

export async function createSafepayTracker({
  amount,
  currency,
  orderId,
}: {
  amount: number;
  currency: string;
  orderId: string;
}) {
  const res = await fetch(`${API_BASE_URL}/order/v1/init`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client: publicKey(),
      amount,
      currency,
      environment: ENVIRONMENT,
      order_id: orderId,
    }),
  });

  if (!res.ok) {
    throw new Error(`Safepay init failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const token = json?.data?.token;
  if (!token) {
    throw new Error(`Safepay init response missing tracker token: ${JSON.stringify(json)}`);
  }
  return token as string;
}

export function buildSafepayCheckoutUrl({
  token,
  orderId,
  redirectUrl,
  cancelUrl,
}: {
  token: string;
  orderId: string;
  redirectUrl: string;
  cancelUrl: string;
}) {
  const url = new URL(CHECKOUT_BASE_URL);
  url.searchParams.set("beacon", token);
  url.searchParams.set("env", ENVIRONMENT);
  url.searchParams.set("order_id", orderId);
  url.searchParams.set("source", "Buysellox.com");
  url.searchParams.set("redirect_url", redirectUrl);
  url.searchParams.set("cancel_url", cancelUrl);
  return url.toString();
}

export interface SafepayTrackerStatus {
  state: string;
  paid: boolean;
  amount: number | null;
  currency: string | null;
}

export async function getSafepayTrackerStatus(token: string): Promise<SafepayTrackerStatus> {
  const res = await fetch(`${API_BASE_URL}/order/v1/${token}`);
  if (!res.ok) {
    throw new Error(`Safepay status check failed: ${res.status} ${await res.text()}`);
  }

  const json = await res.json();
  const data = json?.data ?? {};
  const state = String(data.state ?? "").toUpperCase();
  const hasTransaction = data.transaction != null;
  const looksFailed = /FAIL|CANCEL|DECLINE|EXPIRE/.test(state);
  const paid = hasTransaction && !looksFailed;

  // Log the raw shape so the first real test purchase tells us the true
  // terminal state string — tighten the `paid` heuristic above once we see it.
  console.log("[safepay] tracker status", { token, state, hasTransaction, paid });

  return { state, paid, amount: data.amount ?? null, currency: data.currency ?? null };
}
