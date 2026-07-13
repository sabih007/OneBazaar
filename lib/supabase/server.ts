import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Server Component / Route Handler / Server Action client — cookies() is async in Next.js 16. */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // setAll called from a Server Component; ignore because proxy.ts
            // refreshes the session on every request.
          }
        },
      },
    }
  );
}
