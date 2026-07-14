import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";

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

/**
 * Every request re-renders Header plus at least one page/layout, and most of
 * those independently called `supabase.auth.getUser()` — each one a network
 * round trip to Supabase Auth. `cache()` dedupes those into a single call per
 * request (it only memoizes within one Server Component render pass).
 */
export const getUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});
