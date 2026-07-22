import type { SupabaseClient } from "@supabase/supabase-js";
import { sendOtpEmail } from "@/lib/email";
import { generateOtpCode, hashOtpCode, otpExpiryDate } from "@/lib/auth/otp";

/**
 * Mints a fresh Supabase session token (via generateLink) alongside our own
 * 6-digit code, stores both, and emails the code. Used for both the initial
 * signup send and "Resend code" — magiclink works for either since the user
 * row already exists by the time this runs (created via admin.createUser).
 */
export async function createAndSendEmailOtp(
  adminClient: SupabaseClient,
  { userId, email }: { userId: string; email: string }
): Promise<{ ok: true } | { ok: false; error: string }> {
  const { data, error } = await adminClient.auth.admin.generateLink({
    type: "magiclink",
    email,
  });

  if (error || !data?.properties?.hashed_token) {
    console.error("[email-otp] generateLink failed", error);
    return { ok: false, error: "Could not send code. Please try again." };
  }

  const code = generateOtpCode();
  const { error: insertError } = await adminClient.from("otp_codes").insert({
    user_id: userId,
    channel: "email",
    destination: email,
    code_hash: hashOtpCode(code),
    supabase_token_hash: data.properties.hashed_token,
    expires_at: otpExpiryDate(),
  });

  if (insertError) {
    console.error("[email-otp] insert failed", insertError);
    return { ok: false, error: "Could not send code. Please try again." };
  }

  await sendOtpEmail(email, code);
  return { ok: true };
}
