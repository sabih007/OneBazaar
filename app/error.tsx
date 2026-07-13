"use client";

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/Button";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  const isSupabaseError = /supabaseUrl|supabase/i.test(error.message);

  return (
    <div className="container-app flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
      <AlertTriangle className="h-10 w-10 text-warning" aria-hidden />
      <h1 className="mt-4 font-heading text-xl font-semibold text-ink">
        {isSupabaseError ? "Supabase isn't connected yet" : "Something went wrong"}
      </h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">
        {isSupabaseError
          ? "This page needs a live Supabase project. Add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local, then reload."
          : "An unexpected error occurred. You can try again."}
      </p>
      <Button className="mt-6" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
