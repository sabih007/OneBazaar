import Link from "next/link";
import { BadgeCheck } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { PublicProfile } from "@/lib/profiles";
import RevealPhoneButton from "@/components/listings/RevealPhoneButton";
import ChatButton from "@/components/chat/ChatButton";

interface SellerCardProps {
  seller: PublicProfile | null;
  listingId: string;
  isOwner: boolean;
  isLoggedIn: boolean;
  userId: string | null;
}

export default function SellerCard({ seller, listingId, isOwner, isLoggedIn, userId }: SellerCardProps) {
  if (!seller) return null;

  return (
    <div className="rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]">
      <Link href={`/seller/${seller.id}`} className="flex items-center gap-3">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-primary-hover text-base font-semibold text-ink shadow-sm">
          {(seller.full_name || "S").charAt(0).toUpperCase()}
        </span>
        <div className="min-w-0">
          <p className="flex items-center gap-1 truncate text-sm font-semibold text-ink">
            {seller.full_name || "Buysellox.com seller"}
            {seller.is_verified && (
              <BadgeCheck className="h-4 w-4 shrink-0 text-success" aria-label="Verified seller" />
            )}
          </p>
          <p className="text-xs text-ink-muted">
            Member since {formatDistanceToNow(new Date(seller.created_at), { addSuffix: true })}
          </p>
        </div>
      </Link>

      {!isOwner && (
        <div className="mt-4 space-y-2 border-t border-line pt-4">
          <ChatButton listingId={listingId} sellerId={seller.id} userId={userId} />
          <RevealPhoneButton listingId={listingId} isLoggedIn={isLoggedIn} />
        </div>
      )}
    </div>
  );
}
