import Link from "next/link";
import Image from "next/image";
import { Plus } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import SearchBar from "@/components/layout/SearchBar";
import CitySelector from "@/components/layout/CitySelector";
import ProfileMenu, { GuestActions } from "@/components/layout/ProfileMenu";
import { Button } from "@/components/ui/Button";

export default async function Header() {
  let fullName: string | null = null;
  let isLoggedIn = false;

  if (isSupabaseConfigured) {
    const user = await getUser();
    isLoggedIn = Boolean(user);
    fullName = (user?.user_metadata?.full_name as string | undefined) ?? null;
  }

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface">
      <div className="container-app flex h-16 items-center gap-2 sm:gap-4">
        <Link href="/" aria-label="Buysellox.com — home" className="flex shrink-0 items-center">
          <Image
            src="/logo.jpg"
            alt="Buysellox.com"
            width={1355}
            height={364}
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

          {isLoggedIn ? <ProfileMenu name={fullName} /> : <GuestActions />}
        </div>
      </div>

      <div className="border-t border-line px-4 py-2.5 md:hidden">
        <SearchBar />
      </div>
    </header>
  );
}
