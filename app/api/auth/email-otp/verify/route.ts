import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";
import { hashOtpCode, OTP_MAX_ATTEMPTS } from "@/lib/auth/otp";

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const userId = typeof body?.userId === "string" ? body.userId : null;
  const email = typeof body?.email === "string" ? body.email.trim().toLowerCase() : null;
  const code = typeof body?.code === "string" ? body.code.trim() : null;

  if (!userId || !email || !code) {
    return NextResponse.json({ error: "Missing userId, email, or code" }, { status: 400 });
  }

  const adminClient = createAdminClient();

  const { data: row, error } = await adminClient
    .from("otp_codes")
    .select("id, code_hash, supabase_token_hash, expires_at, attempts")
    .eq("user_id", userId)
    .eq("channel", "email")
    .is("consumed_at", null)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !row) {
    return NextResponse.json(
      { error: "No pending code found. Request a new one." },
      { status: 400 }
    );
  }

  if (new Date(row.expires_at as string).getTime() < Date.now()) {
    return NextResponse.json({ error: "This code has expired. Request a new one." }, { status: 400 });
  }

  if ((row.attempts as number) >= OTP_MAX_ATTEMPTS) {
    return NextResponse.json(
      { error: "Too many incorrect attempts. Request a new code." },
      { status: 429 }
    );
  }

  if (hashOtpCode(code) !== row.code_hash) {
    await adminClient
      .from("otp_codes")
      .update({ attempts: (row.attempts as number) + 1 })
      .eq("id", row.id);
    return NextResponse.json({ error: "Incorrect code." }, { status: 400 });
  }

  // Cookie-bound client: this verifyOtp call is what actually issues the
  // session and writes it to the response cookies, via the same token_hash
  // minted at send-time. It also flips Supabase's own email_confirmed_at.
  const supabase = await createClient();
  const { error: verifyError } = await supabase.auth.verifyOtp({
    type: "magiclink",
    token_hash: row.supabase_token_hash as string,
  });

  if (verifyError) {
    console.error("[email-otp/verify]", verifyError);
    return NextResponse.json(
      { error: "Something went wrong verifying your code. Request a new one." },
      { status: 400 }
    );
  }

  await adminClient.from("otp_codes").update({ consumed_at: new Date().toISOString() }).eq("id", row.id);
  await adminClient.from("profiles").update({ email_verified: true }).eq("id", userId);

  return NextResponse.json({ ok: true });
}
