"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import {
  ChevronDown,
  Heart,
  LogIn,
  LogOut,
  Menu,
  MessageCircle,
  Settings,
  Sparkles,
  User,
  UserPlus,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { useClickOutside } from "@/lib/hooks/useClickOutside";

const menuItems = [
  { href: "/me", label: "My listings", icon: User },
  { href: "/me/favorites", label: "Favorites", icon: Heart },
  { href: "/me/chats", label: "Inbox", icon: MessageCircle },
  { href: "/me/promotions", label: "My promotions", icon: Sparkles },
  { href: "/me/profile", label: "Edit profile", icon: Settings },
];

export default function ProfileMenu({ name }: { name: string | null }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  async function logout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    setOpen(false);
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-11 items-center gap-2 rounded-md border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors hover:bg-background"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary-light text-xs font-semibold text-primary-text">
          {(name || "U").charAt(0).toUpperCase()}
        </span>
        <span className="hidden max-w-[8rem] truncate sm:inline">{name || "Account"}</span>
        <ChevronDown aria-hidden className="h-4 w-4 text-ink-muted" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-56 rounded-md border border-line bg-surface py-1 shadow-[var(--shadow-card-hover)]">
          {menuItems.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-background"
            >
              <Icon aria-hidden className="h-4 w-4 text-ink-muted" />
              {label}
            </Link>
          ))}
          <div className="my-1 border-t border-line" />
          <button
            onClick={logout}
            className="flex w-full items-center gap-2.5 px-3.5 py-2.5 text-left text-sm text-danger hover:bg-background"
          >
            <LogOut aria-hidden className="h-4 w-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export function GuestActions() {
  return (
    <>
      {/* Desktop / tablet: inline auth buttons */}
      <div className="hidden items-center gap-2 sm:flex">
        <Link href="/login">
          <Button variant="ghost" size="md" className="whitespace-nowrap">
            Log in
          </Button>
        </Link>
        <Link href="/signup">
          <Button variant="primary" size="md" className="whitespace-nowrap">
            Sign up
          </Button>
        </Link>
      </div>

      {/* Mobile: collapse auth into a menu to keep the header uncluttered */}
      <GuestMenu />
    </>
  );
}

function GuestMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setOpen(false));

  return (
    <div className="relative sm:hidden" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label="Menu"
        aria-haspopup="true"
        aria-expanded={open}
        className="flex h-11 w-11 items-center justify-center rounded-md border border-line bg-surface text-ink transition-colors hover:bg-background"
      >
        <Menu aria-hidden className="h-5 w-5" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-2 w-44 rounded-md border border-line bg-surface py-1 shadow-[var(--shadow-card-hover)]">
          <Link
            href="/login"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm text-ink hover:bg-background"
          >
            <LogIn aria-hidden className="h-4 w-4 text-ink-muted" />
            Log in
          </Link>
          <Link
            href="/signup"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-3.5 py-2.5 text-sm font-medium text-primary-text hover:bg-background"
          >
            <UserPlus aria-hidden className="h-4 w-4" />
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
