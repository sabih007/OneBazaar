import { cn } from "@/lib/utils";
import { BADGE_COLOR, BADGE_LABEL, type Badge } from "@/lib/packages";

export default function PromoBadge({ badge, className }: { badge: Badge; className?: string }) {
  if (!badge) return null;
  const colors = BADGE_COLOR[badge];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold",
        colors.bg,
        colors.text,
        className
      )}
    >
      {BADGE_LABEL[badge]}
    </span>
  );
}
