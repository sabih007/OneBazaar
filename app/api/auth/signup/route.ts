import { NextRequest, NextResponse } from "next/server";
import { signupSchema } from "@/lib/validations/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAndSendEmailOtp } from "@/lib/auth/email-otp";

/**
 * Creates the auth user server-side with email_confirm: false, so no session
 * exists until /api/auth/email-otp/verify succeeds — mirrors the guarantee
 * Supabase's own "Confirm email" used to give us, now backed by our OTP.
 */
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const parsed = signupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid submission" },
      { status: 400 }
    );
  }

  const { fullName, email, password, phone, city } = parsed.data;
  const supabase = createAdminClient();

  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: false,
    user_metadata: { full_name: fullName, phone, city },
  });

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Could not create your account." },
      { status: 400 }
    );
  }

  const sent = await createAndSendEmailOtp(supabase, { userId: data.user.id, email });
  if (!sent.ok) {
    return NextResponse.json({ error: sent.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true, userId: data.user.id });
}
