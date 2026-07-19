import type { PartnerApplicationInput } from "@/lib/validations/partner";

const DEFAULT_TO = process.env.PARTNER_APPLICATIONS_TO ?? "sabih@promowebdesigns.com";

interface OutgoingEmail {
  to?: string;
  replyTo?: string;
  subject: string;
  text: string;
  /** Prefix used when logging (no provider configured). */
  logPrefix: string;
}

/**
 * Sends a transactional email via Resend when `RESEND_API_KEY` is configured.
 * Until a provider is set up, the message is logged server-side (loudly) so
 * nothing is silently lost. Returns `true` only when an email was delivered.
 */
async function sendEmail({ to, replyTo, subject, text, logPrefix }: OutgoingEmail): Promise<boolean> {
  const resendKey = process.env.RESEND_API_KEY;
  if (resendKey) {
    const from = process.env.PARTNER_APPLICATIONS_FROM ?? "Buysellox <onboarding@resend.dev>";
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [to ?? DEFAULT_TO],
        ...(replyTo ? { reply_to: replyTo } : {}),
        subject,
        text,
      }),
    });
    if (!res.ok) {
      const detail = await res.text().catch(() => "");
      throw new Error(`Resend failed (${res.status}): ${detail}`);
    }
    return true;
  }

  console.warn(
    `${logPrefix} Email delivery is not configured (set RESEND_API_KEY to enable). Received:\n${text}`
  );
  return false;
}

/** Sends a "Become Our Partner" application to the Buysellox team. */
export async function sendPartnerApplicationEmail(
  data: PartnerApplicationInput
): Promise<boolean> {
  const tierLabel = data.tier === "premium" ? "Our Premium Partner" : "Our Partner";
  const text = [
    `Tier requested: ${tierLabel}`,
    `Name: ${data.name}`,
    data.business ? `Business: ${data.business}` : null,
    `Email: ${data.email}`,
    `Phone: ${data.phone}`,
    data.message ? `\nMessage:\n${data.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  return sendEmail({
    replyTo: data.email,
    subject: `New partner application — ${tierLabel} — ${data.name}`,
    text,
    logPrefix: "[partner-application]",
  });
}

/** Notifies the team of a newsletter signup from the footer. */
export async function sendNewsletterSignupEmail(email: string): Promise<boolean> {
  return sendEmail({
    to: process.env.NEWSLETTER_SIGNUPS_TO ?? DEFAULT_TO,
    replyTo: email,
    subject: `New newsletter signup — ${email}`,
    text: `New newsletter subscriber: ${email}`,
    logPrefix: "[newsletter-signup]",
  });
}
