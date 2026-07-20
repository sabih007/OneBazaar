import { ShoppingBag } from "lucide-react";

export default function Loading() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 px-4">
      <div className="relative flex h-20 w-20 items-center justify-center">
        <span className="absolute inset-0 rounded-full border-4 border-primary-light border-t-primary animate-spin" />
        <ShoppingBag aria-hidden className="h-8 w-8 text-primary-text" strokeWidth={1.75} />
      </div>

      <div className="flex flex-col items-center gap-1 text-center">
        <span className="font-heading text-xl font-bold text-primary-text">Buysellox.com</span>
        <span className="text-sm text-ink-muted">Finding you the best deals&hellip;</span>
      </div>

      <div className="h-1 w-40 overflow-hidden rounded-full bg-primary-light">
        <div className="h-full w-1/3 rounded-full bg-primary animate-loader-bar" />
      </div>
    </div>
  );
}
