import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getPublicOrigin } from "@/lib/request-origin";

/** Supabase OAuth (Google) redirects the browser back here with a `code` to exchange for a session. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/";

  const origin = getPublicOrigin(request);

  if (code) {
    const supabase = await createClient();
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      // Google already vouches for the email address — there's no OTP step on
      // this path, so mark it verified directly. protect_profile_verification_columns
      // (0016_email_otp.sql) only allows this column to change via the
      // service-role client, hence admin here rather than the session client.
      if (data.user) {
        const admin = createAdminClient();
        await admin.from("profiles").update({ email_verified: true }).eq("id", data.user.id);
      }
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
