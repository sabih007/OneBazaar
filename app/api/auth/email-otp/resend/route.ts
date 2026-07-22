import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createAndSendEmailOtp } from "@/lib/auth/email-otp";
import { OTP_RESEND_COOLDOWN_SECONDS } from "@/lib/auth/otp";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;

  if (!userId || !email) {
    return NextResponse.json({ error: "Missing userId or email" }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: recent } = await supabase
    .from("otp_codes")
    .select("created_at")
    .eq("user_id", userId)
    .eq("channel", "email")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (
    recent &&
    Date.now() - new Date(recent.created_at as string).getTime() < OTP_RESEND_COOLDOWN_SECONDS * 1000
  ) {
    return NextResponse.json(
      { error: "Please wait a moment before requesting another code." },
      { status: 429 }
    );
  }

  const sent = await createAndSendEmailOtp(supabase, { userId, email });
  if (!sent.ok) {
    return NextResponse.json({ error: sent.error }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
