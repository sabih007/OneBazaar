import Link from "next/link";
import Image from "next/image";
import { MessageCircle, Plus } from "lucide-react";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { getUnreadMessageCount } from "@/lib/chat";
import SearchBar from "@/components/layout/SearchBar";
import CitySelector from "@/components/layout/CitySelector";
import ProfileMenu, { GuestActions } from "@/components/layout/ProfileMenu";
import UnreadNavBadge from "@/components/chat/UnreadNavBadge";
import { Button } from "@/components/ui/Button";

export default async function Header() {
  let userId: string | null = null;
  let fullName: string | null = null;
  let isLoggedIn = false;
  let unreadCount = 0;

  if (isSupabaseConfigured) {
    const user = await getUser();
    isLoggedIn = Boolean(user);
    userId = user?.id ?? null;
    fullName = (user?.user_metadata?.full_name as string | undefined) ?? null;

    if (user) {
      const supabase = await createClient();
      unreadCount = await getUnreadMessageCount(supabase);
    }
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="container-app flex h-16 items-center gap-2 sm:gap-4">
        <Link href="/" aria-label="Buysellox.com — home" className="flex shrink-0 items-center">
          <Image
            src="/logo-primary.png"
            alt="Buysellox.com"
            width={880}
            height={228}
            priority
            className="h-8 w-auto sm:h-10"
          />
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <CitySelector />
          </div>

          <Link href="/post">
            <Button variant="primary" size="md" className="gap-1.5 whitespace-nowrap px-3 sm:px-4">
              <Plus aria-hidden className="hidden h-4 w-4 sm:inline-block" />
              <span>Post an ad</span>
            </Button>
          </Link>

          {isLoggedIn && userId && (
            <Link
              href="/me/chats"
              aria-label="Messages"
              className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-md border border-line bg-surface text-ink transition-colors hover:bg-background"
            >
              <MessageCircle aria-hidden className="h-5 w-5" />
              <UnreadNavBadge initialCount={unreadCount} userId={userId} />
            </Link>
          )}

          {isLoggedIn ? <ProfileMenu name={fullName} /> : <GuestActions />}
        </div>
      </div>

      <div className="border-t border-line px-4 py-2.5 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
