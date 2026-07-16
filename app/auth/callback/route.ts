import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/** Supabase OAuth (Google) redirects the browser back here with a `code` to exchange for a session. */
export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const redirect = searchParams.get("redirect") || "/";

  // Behind Hostinger's reverse proxy, request.nextUrl.origin resolves to the
  // Node process's own bind address (0.0.0.0:3000) instead of the public host,
  // since the proxy doesn't forward the original Host header. Prefer the
  // forwarded headers, which Next.js itself relies on for the same reason
  // (see the Server Actions CSRF check).
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  const origin = forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=oauth`);
}
