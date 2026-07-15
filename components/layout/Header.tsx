import Link from "next/link";
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
      <div className="container-app flex h-16 items-center gap-4">
        <Link href="/" className="shrink-0 font-heading text-2xl font-bold text-primary">
          Sellox
        </Link>

        <div className="hidden flex-1 md:block">
          <SearchBar />
        </div>

        <div className="ml-auto flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <CitySelector />
          </div>

          <Link href="/post">
            <Button variant="primary" size="md" className="gap-1.5">
              <Plus aria-hidden className="h-4 w-4" />
              <span className="hidden sm:inline">Post ad</span>
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
