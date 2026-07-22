import Link from "next/link";
import { ImageOff } from "lucide-react";

/**
 * Replaces the sidebar ad slot on the listing detail page — this position
 * converts better as a self-promotion surface (nudging the owner to boost
 * their own listing, or a buyer toward becoming a paying seller) than as
 * third-party ad inventory, so it always renders instead of an AdSense unit.
 */
export default function PromoteUpsellCard({
  listingId,
  isOwner,
}: {
  listingId: string;
  isOwner: boolean;
}) {
  const href = isOwner ? `/post/${listingId}/promote` : "/me/subscription";

  return (
    <div className="flex flex-col items-center gap-3 rounded-[var(--radius-lg)] border border-dashed border-line bg-background/60 p-6 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-line/50 text-ink-muted">
        <ImageOff className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </span>
      <div>
        <p className="font-heading text-sm font-semibold text-ink">Ad Space</p>
        <p className="mt-0.5 text-xs text-ink-muted">Promote your ad here</p>
      </div>
      <Link
        href={href}
        className="flex h-11 w-full items-center justify-center rounded-md bg-success px-4 text-sm font-medium text-white shadow-[var(--shadow-card)] transition-all hover:-translate-y-0.5 hover:bg-success/90 hover:shadow-[var(--shadow-card-hover)]"
      >
        Upgrade to Premium
      </Link>
    </div>
  );
}
