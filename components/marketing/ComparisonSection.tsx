import { Check, Sparkles } from "lucide-react";

const features = [
  {
    title: "Free ad posting",
    description: "List anything you're selling at no cost — no catch, no hidden fees.",
  },
  {
    title: "One free refresh with every ad",
    description: "Bump your listing back to the top once, free, whenever it needs a boost.",
  },
  {
    title: "Transparent featured & boost pricing",
    description: "Straightforward rates to get more eyes on your ad, published upfront.",
  },
  {
    title: "Fixed, transparent monthly dealer plans",
    description: "Dealers and agencies get a flat monthly rate — no custom-negotiated contracts.",
  },
];

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
            Built to be fair, from the first ad you post
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
            Free posting, a free refresh, and pricing that stays transparent as you grow.
          </p>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)]"
            >
              <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success">
                <Check className="h-4 w-4" aria-hidden />
              </span>
              <div>
                <p className="text-sm font-semibold text-ink">{feature.title}</p>
                <p className="mt-1 text-sm text-ink-muted">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
