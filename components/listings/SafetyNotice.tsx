import { ShieldCheck } from "lucide-react";

export default function SafetyNotice() {
  return (
    <div className="flex items-start gap-2.5 rounded-md border border-line bg-primary-light/50 p-3.5 text-xs text-ink-muted">
      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
      <p>Deal safely — meet in a public place, and inspect the item before you pay.</p>
    </div>
  );
}
