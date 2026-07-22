import { cn } from "@/lib/utils";

export function UnreadBadge({ count, className }: { count: number; className?: string }) {
  if (count <= 0) return null;

  return (
    <span
      aria-label={`${count} unread message${count === 1 ? "" : "s"}`}
      className={cn(
        "flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[11px] font-semibold leading-none text-white",
        className
      )}
    >
      {count > 9 ? "9+" : count}
    </span>
  );
}
