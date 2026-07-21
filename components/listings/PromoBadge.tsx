import { Crown, Sparkles, Flame } from "lucide-react";
import { cn } from "@/lib/utils";
import { BADGE_COLOR, BADGE_LABEL, type Badge } from "@/lib/packages";

const BADGE_ICON: Record<Exclude<Badge, null>, typeof Crown> = {
  super_hot: Crown,
  hot: Flame,
  top: Crown,
  featured: Sparkles,
  urgent: Flame,
};

export default function PromoBadge({ badge, className }: { badge: Badge; className?: string }) {
  if (!badge) return null;
  const colors = BADGE_COLOR[badge];
  const Icon = BADGE_ICON[badge];

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm ring-1 ring-white/25",
        colors.bg,
        colors.text,
        className
      )}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {BADGE_LABEL[badge]}
    </span>
  );
}
