import nodemailer, { type Transporter } from "nodemailer";
import type { PartnerApplicationInput } from "@/lib/validations/partner";
import type { ContactMessageInput } from "@/lib/validations/contact";
import { SITE_URL } from "@/lib/seo/site";
import { formatPKR } from "@/lib/utils";

const DEFAULT_TO = process.env.PARTNER_APPLICATIONS_TO ?? "sabih@promowebdesigns.com";

interface OutgoingEmail {
  to?: string;
  replyTo?: string;
  subject: string;
  text: string;
  /** Prefix used when logging (no provider configured). */
  logPrefix: string;
}

let transporter: Transporter | null = null;

/** Lazily builds the SMTP transport from env vars; cached across calls. */
function getTransporter(): Transporter | null {
  const host = process.env.SMTP_HOST;
  if (!host) return null;

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_SECURE === "true",
      auth: process.env.SMTP_USER
        ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
        : undefined,
    });
  }
  return transporter;
}

/**
 * Sends a transactional email via SMTP (nodemailer) when `SMTP_HOST` is
 * configured. Until a provider is set up, the message is logged server-side
 * (loudly) so nothing is silently lost. Returns `true` only when an email was
 * delivered.
 */
async function sendEmail({ to, replyTo, subject, text, logPrefix }: OutgoingEmail): Promise<boolean> {
  const transport = getTransporter();
  if (transport) {
    const from = process.env.EMAIL_FROM ?? "Buysellox <no-reply@buysellox.com>";
    await transport.sendMail({
      from,
      to: to ?? DEFAULT_TO,
      ...(replyTo ? { replyTo } : {}),
      subject,
      text,
    });
    return true;
  }

  console.warn(
    `${logPrefix} Email delivery is not configured (set SMTP_HOST to enable). Received:\n${text}`
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

/** Sends a 6-digit verification code for the custom email OTP flow. */
export async function sendOtpEmail(to: string, code: string): Promise<boolean> {
  return sendEmail({
    to,
    subject: `${code} is your Buysellox.com verification code`,
    text: `Your verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    logPrefix: "[email-otp]",
  });
}

/** Alerts a user that a new listing matches one of their saved searches. */
export async function sendSavedSearchAlertEmail(
  to: string,
  listing: { title: string; price: number; city: string; url: string }
): Promise<boolean> {
  return sendEmail({
    to,
    subject: `New match: ${listing.title}`,
    text: `A new listing matches your saved search on Buysellox.com:\n\n${listing.title} — ${formatPKR(listing.price)} in ${listing.city}\n\n${SITE_URL}${listing.url}`,
    logPrefix: "[saved-search-alert]",
  });
}

/** Sends a message from the /contact page to the support inbox. */
export async function sendContactMessageEmail(data: ContactMessageInput): Promise<boolean> {
  return sendEmail({
    to: process.env.CONTACT_MESSAGES_TO ?? DEFAULT_TO,
    replyTo: data.email,
    subject: `New contact message — ${data.name}`,
    text: `Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`,
    logPrefix: "[contact-message]",
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
