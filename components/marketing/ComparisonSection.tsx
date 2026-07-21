import { Check, X, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

type Cell = { type: "check" } | { type: "cross" } | { type: "text"; label: string };

const check: Cell = { type: "check" };
const cross: Cell = { type: "cross" };
const text = (label: string): Cell => ({ type: "text", label });

const rows: { feature: string; buysellox: Cell; olx: Cell; zameen: Cell }[] = [
  {
    feature: "Free ad posting",
    buysellox: check,
    olx: check,
    zameen: text("Agent-focused"),
  },
  {
    feature: "One free refresh with every ad",
    buysellox: check,
    olx: cross,
    zameen: cross,
  },
  {
    feature: "Featured & boost pricing",
    buysellox: text("Up to 40% cheaper"),
    olx: text("Standard rates"),
    zameen: text("Premium pricing"),
  },
  {
    feature: "Dealer & agency plans",
    buysellox: text("Fixed, transparent monthly plans"),
    olx: text("Custom dealer deals"),
    zameen: text("Negotiated contracts"),
  },
];

function CellContent({ cell }: { cell: Cell }) {
  if (cell.type === "check") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/15 text-success">
        <Check className="h-4 w-4" aria-hidden />
        <span className="sr-only">Yes</span>
      </span>
    );
  }
  if (cell.type === "cross") {
    return (
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-ink-muted/10 text-ink-muted">
        <X className="h-4 w-4" aria-hidden />
        <span className="sr-only">No</span>
      </span>
    );
  }
  return <span>{cell.label}</span>;
}

export default function ComparisonSection() {
  return (
    <section className="border-t border-line py-14">
      <div className="container-app">
        <div className="text-center">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-primary-light px-3 py-1 text-xs font-semibold uppercase tracking-wide text-primary-text">
            <Sparkles className="h-3.5 w-3.5" aria-hidden />
            Why Buysellox
          </span>
          <h2 className="mt-3 font-heading text-2xl font-semibold text-ink sm:text-3xl">
            Built to be fairer than OLX &amp; Zameen
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
            Same free posting you already know, plus the parts other marketplaces charge extra for
            &mdash; or don&apos;t offer at all.
          </p>
        </div>

        <div className="mt-8 overflow-x-auto">
          <table className="w-full min-w-[560px] border-separate border-spacing-0 overflow-hidden rounded-[var(--radius-lg)] shadow-[var(--shadow-card)]">
            <thead>
              <tr>
                <th className="w-2/5 border-b border-line bg-surface px-4 py-3.5 text-left text-sm font-medium text-ink-muted sm:px-6">
                  &nbsp;
                </th>
                <th className="border-b border-line bg-primary px-4 py-3.5 text-center font-heading text-base font-bold text-ink sm:px-6">
                  Buysellox
                </th>
                <th className="border-b border-line bg-surface px-4 py-3.5 text-center text-sm font-semibold text-ink-muted sm:px-6">
                  OLX
                </th>
                <th className="border-b border-line bg-surface px-4 py-3.5 text-center text-sm font-semibold text-ink-muted sm:px-6">
                  Zameen
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.feature}>
                  <td
                    className={cn(
                      "px-4 py-4 text-sm font-medium text-ink sm:px-6",
                      i !== rows.length - 1 && "border-b border-line",
                      "bg-surface"
                    )}
                  >
                    {row.feature}
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-center text-sm font-semibold text-ink sm:px-6",
                      i !== rows.length - 1 && "border-b border-primary-hover/30",
                      "bg-primary-light"
                    )}
                  >
                    <CellContent cell={row.buysellox} />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-center text-sm text-ink-muted sm:px-6",
                      i !== rows.length - 1 && "border-b border-line",
                      "bg-surface"
                    )}
                  >
                    <CellContent cell={row.olx} />
                  </td>
                  <td
                    className={cn(
                      "px-4 py-4 text-center text-sm text-ink-muted sm:px-6",
                      i !== rows.length - 1 && "border-b border-line",
                      "bg-surface"
                    )}
                  >
                    <CellContent cell={row.zameen} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-center text-xs text-ink-muted">
          Based on published OLX and Zameen rates as of mid-2026.
        </p>
      </div>
    </section>
  );
}
