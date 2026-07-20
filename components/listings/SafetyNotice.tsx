import { ShieldCheck } from "lucide-react";

export default function SafetyNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-[var(--radius-lg)] border border-primary/15 bg-gradient-to-br from-primary-light/70 to-primary-light/30 p-4 text-xs text-ink-muted">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary-text" aria-hidden />
      <p>Deal safely — meet in a public place, and inspect the item before you pay.</p>
    </div>
  );
}
