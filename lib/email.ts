import type { PartnerApplicationInput } from "@/lib/validations/partner";

const PARTNER_TO = process.env.PARTNER_APPLICATIONS_TO ?? "sabih@promowebdesigns.com";

/**
 * Sends a partner application to the Buysellox team.
 *
 * Email delivery is optional until a provider is configured. When
 * `RESEND_API_KEY` is set the application is sent via Resend; otherwise it is
 * logged server-side (loudly) so it is never silently lost, and the caller
 * still treats the submission as accepted.
 *
 * Returns `true` only when an email was actually delivered.
 */
export async function sendPartnerApplicationEmail(
  data: PartnerApplicationInput
): Promise<boolean> {
  const tierLabel = data.tier === "premium" ? "Our Premium Partner" : "Our Partner";
  const subject = `New partner application — ${tierLabel} — ${data.name}`;
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
        to: [PARTNER_TO],
        reply_to: data.email,
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

  // No provider configured yet — log loudly so applications aren't lost.
  console.warn(
    `[partner-application] Email delivery is not configured (set RESEND_API_KEY to enable). ` +
      `Application received:\n${text}`
  );
  return false;
}
