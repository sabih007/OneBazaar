import type { NextRequest } from "next/server";

/**
 * Behind Hostinger's reverse proxy, `request.nextUrl.origin` resolves to the
 * Node process's own bind address (0.0.0.0:3000) instead of the public host,
 * since the proxy doesn't forward the original Host header the way
 * `request.nextUrl` expects. Prefer the `x-forwarded-*` headers the proxy
 * does set, falling back to `nextUrl.origin` for local dev.
 */
export function getPublicOrigin(request: NextRequest): string {
  const forwardedHost = request.headers.get("x-forwarded-host");
  const forwardedProto = request.headers.get("x-forwarded-proto") ?? "https";
  return forwardedHost ? `${forwardedProto}://${forwardedHost}` : request.nextUrl.origin;
}
