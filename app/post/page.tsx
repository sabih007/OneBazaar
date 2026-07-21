import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { FREE_TIER_ACTIVE_LIMIT } from "@/lib/listings";
import PostWizard from "@/components/post/PostWizard";

export const metadata: Metadata = {
  title: "Post an ad",
};

export default async function PostPage() {
  if (!isSupabaseConfigured) {
    return (
      <div className="container-app max-w-2xl py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Connect Supabase first</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Posting requires a signed-in user. Add your Supabase credentials to `.env.local` to
          enable authentication.
        </p>
      </div>
    );
  }

  const user = await getUser();

  if (!user) {
    redirect("/login?redirect=/post");
  }

  const supabase = await createClient();
  const { count } = await supabase
    .from("listings")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("status", "active");

  if ((count ?? 0) >= FREE_TIER_ACTIVE_LIMIT) {
    return (
      <div className="container-app max-w-2xl py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">You&apos;ve hit the free ad limit</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Free accounts can have up to {FREE_TIER_ACTIVE_LIMIT} active ads at a time. Delete or
          mark one as sold to post a new one.
        </p>
        <Link href="/me" className="mt-4 inline-block text-sm font-medium text-primary-text underline">
          Manage my listings
        </Link>
      </div>
    );
  }

  return <PostWizard userId={user.id} />;
}
