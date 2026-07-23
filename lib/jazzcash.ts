import { createHmac, timingSafeEqual } from "crypto";

/**
 * Server-only JazzCash client — Hosted Checkout Page (HCP) integration mode.
 * Unlike lib/lemonsqueezy.ts's REST checkout, HCP has no "create checkout"
 * API call: the browser is form-POSTed straight to JazzCash's own page with
 * a signed set of pp_-prefixed fields, and JazzCash form-POSTs the result
 * straight back to pp_ReturnURL — there's no separate async webhook.
 *
 * The HMAC algorithm below is NOT formally published in JazzCash's sandbox
 * docs as of writing; it matches the widely-used community implementation
 * (sort non-empty pp_/ppmpf_ fields by key ascending, join values with '&',
 * prepend the integrity salt, HMAC-SHA256 keyed on the salt, uppercase hex).
 * Confirm it against a real sandbox transaction before going live — same
 * caveat as lemonsqueezy.ts's custom_price note.
 */

const PKT_OFFSET_MS = 5 * 60 * 60 * 1000; // Pakistan is UTC+5 year-round, no DST

function merchantId() {
  const id = process.env.JAZZCASH_MERCHANT_ID;
  if (!id) throw new Error("JAZZCASH_MERCHANT_ID is not set");
  return id;
}

function password() {
  const pw = process.env.JAZZCASH_PASSWORD;
  if (!pw) throw new Error("JAZZCASH_PASSWORD is not set");
  return pw;
}

function integritySalt() {
  const salt = process.env.JAZZCASH_INTEGRITY_SALT;
  if (!salt) throw new Error("JAZZCASH_INTEGRITY_SALT is not set");
  return salt;
}

/** Sandbox by default; set JAZZCASH_ENV=live once the merchant account is verified for production. */
function actionUrl() {
  return process.env.JAZZCASH_ENV === "live"
    ? "https://payments.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/"
    : "https://sandbox.jazzcash.com.pk/CustomerPortal/transactionmanagement/merchantform/";
}

/** Formats a Date as JazzCash's yyyyMMddHHmmss, always in Pakistan time regardless of server timezone. */
function formatPktDateTime(date: Date) {
  const pkt = new Date(date.getTime() + PKT_OFFSET_MS);
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${pkt.getUTCFullYear()}${pad(pkt.getUTCMonth() + 1)}${pad(pkt.getUTCDate())}` +
    `${pad(pkt.getUTCHours())}${pad(pkt.getUTCMinutes())}${pad(pkt.getUTCSeconds())}`
  );
}

function computeSecureHash(fields: Record<string, string>, salt: string) {
  const message = Object.keys(fields)
    .filter((key) => key !== "pp_SecureHash" && fields[key] !== "" && fields[key] != null)
    .sort()
    .map((key) => fields[key])
    .join("&");
  return createHmac("sha256", salt).update(`${salt}&${message}`).digest("hex").toUpperCase();
}

export interface JazzCashCheckoutInput {
  promotionId: string;
  price: number;
  /** Short merchant reference (JazzCash caps pp_BillReference well under a UUID's length) — use packageRow.key, not promotionId. */
  billReference: string;
  description: string;
  returnUrl: string;
}

export interface JazzCashCheckoutPayload {
  actionUrl: string;
  fields: Record<string, string>;
}

/**
 * Builds the signed field set for JazzCash's Hosted Checkout Page. The
 * caller renders these as hidden inputs in a real <form method="POST"> to
 * `actionUrl` and submits it — this is a page navigation, not a fetch.
 * pp_TxnRefNo (not promotionId, which is too long) is JazzCash's own unique
 * transaction id; promotionId instead rides in ppmpf_1 and is echoed back
 * verbatim on return, which is how the return handler finds the row again.
 */
export function createJazzCashCheckoutPayload({
  promotionId,
  price,
  billReference,
  description,
  returnUrl,
}: JazzCashCheckoutInput): JazzCashCheckoutPayload {
  const now = new Date();
  const txnRefNo = `T${now.getTime().toString(36).toUpperCase()}`;

  const fields: Record<string, string> = {
    pp_Version: "1.1",
    pp_Language: "EN",
    pp_MerchantID: merchantId(),
    pp_Password: password(),
    pp_TxnRefNo: txnRefNo,
    pp_Amount: String(Math.round(price * 100)), // paisa, same "smallest unit" convention as lemonsqueezy.ts's custom_price
    pp_TxnCurrency: "PKR",
    pp_TxnDateTime: formatPktDateTime(now),
    pp_TxnExpiryDateTime: formatPktDateTime(new Date(now.getTime() + 60 * 60 * 1000)),
    pp_BillReference: billReference.slice(0, 20),
    pp_Description: description.slice(0, 100),
    pp_ReturnURL: returnUrl,
    ppmpf_1: promotionId,
  };

  fields.pp_SecureHash = computeSecureHash(fields, integritySalt());

  return { actionUrl: actionUrl(), fields };
}

/**
 * Verifies the pp_SecureHash JazzCash sends back on the pp_ReturnURL POST.
 * Returns false (never throws) on any missing/malformed input; the caller
 * decides what to do with an unverified response.
 */
export function verifyJazzCashResponse(fields: Record<string, string>): boolean {
  const received = fields.pp_SecureHash;
  if (!received) return false;

  const expected = computeSecureHash(fields, integritySalt());
  const expectedBuf = Buffer.from(expected, "utf8");
  const receivedBuf = Buffer.from(received.toUpperCase(), "utf8");

  if (expectedBuf.length !== receivedBuf.length) return false;
  return timingSafeEqual(expectedBuf, receivedBuf);
}
