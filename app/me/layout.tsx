import Link from "next/link";
import { redirect } from "next/navigation";
import { BellPlus, Crown, Heart, MessageCircle, Settings, Sparkles, User, Zap } from "lucide-react";
import { getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";

const navItems = [
  { href: "/me", label: "My listings", icon: User },
  { href: "/me/favorites", label: "Favorites", icon: Heart },
  { href: "/me/saved-searches", label: "Saved searches", icon: BellPlus },
  { href: "/me/chats", label: "Inbox", icon: MessageCircle },
  { href: "/me/promotions", label: "My promotions", icon: Sparkles },
  { href: "/me/credits", label: "Refresh credits", icon: Zap },
  { href: "/me/subscription", label: "Subscription", icon: Crown },
  { href: "/me/profile", label: "Edit profile", icon: Settings },
];

export default async function MeLayout({ children }: { children: React.ReactNode }) {
  if (!isSupabaseConfigured) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Connect Supabase first</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Your dashboard needs a signed-in user, which requires a live Supabase project.
        </p>
      </div>
    );
  }

  const user = await getUser();

  if (!user) redirect("/login?redirect=/me");

  return (
    <div className="container-app grid grid-cols-1 gap-6 py-6 md:grid-cols-[220px_1fr]">
      <nav className="flex gap-1 overflow-x-auto md:flex-col md:overflow-visible">
        {navItems.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-sm font-medium text-ink-muted transition-colors hover:bg-surface hover:text-ink"
          >
            <Icon className="h-4 w-4" aria-hidden />
            {label}
          </Link>
        ))}
      </nav>
      <div className="min-w-0">{children}</div>
    </div>
  );
}
