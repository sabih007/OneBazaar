import type { Metadata } from "next";
import Link from "next/link";
import { Check, Crown, Handshake, TrendingUp, ShieldCheck } from "lucide-react";
import { PARTNER_TIERS } from "@/lib/partners";
import PartnerForm from "@/components/partner/PartnerForm";

export const metadata: Metadata = {
  title: "Become Our Partner",
  description:
    "Partner with Buysellox.com to reach more buyers across Pakistan. Apply to become Our Partner or Our Premium Partner and unlock badges, priority placement, and dedicated support.",
  alternates: { canonical: "/partner" },
};

const whyPartner = [
  {
    icon: TrendingUp,
    title: "Reach more buyers",
    description: "Get priority placement and more eyes on every listing you post.",
  },
  {
    icon: ShieldCheck,
    title: "Build trust",
    description: "A partner badge signals credibility and helps buyers choose you.",
  },
  {
    icon: Handshake,
    title: "Grow with support",
    description: "Work with our team to get the most out of the marketplace.",
  },
];

export default function PartnerPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-primary-light/70 via-primary-light/20 to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="container-app relative py-16 text-center sm:py-20">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-1.5 text-xs font-medium text-primary shadow-[var(--shadow-card)] backdrop-blur">
            <Handshake className="h-4 w-4" aria-hidden />
            Partner programme
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Partner with <span className="text-primary">Buysellox</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-muted sm:text-base">
            Grow your business on Pakistan&apos;s marketplace. Become <strong>Our Partner</strong> or{" "}
            <strong>Our Premium Partner</strong> to unlock badges, priority placement, and dedicated
            support.
          </p>
          <div className="mt-8">
            <Link
              href="#apply"
              className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white shadow-[var(--shadow-card)] transition-transform hover:-translate-y-0.5"
            >
              Apply now
            </Link>
          </div>
        </div>
      </section>

      {/* Why partner */}
      <section className="container-app py-14">
        <div className="grid gap-6 sm:grid-cols-3">
          {whyPartner.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="rounded-[var(--radius-lg)] border border-line bg-surface p-6 text-center shadow-[var(--shadow-card)]"
              >
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <h3 className="mt-4 font-heading text-lg font-semibold text-ink">{item.title}</h3>
                <p className="mt-1.5 text-sm text-ink-muted">{item.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Tiers */}
      <section className="border-t border-line bg-surface/60 py-14">
        <div className="container-app">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
              Choose your partnership
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
              Two ways to partner with us — pick the one that fits your business.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-3xl gap-6 sm:grid-cols-2">
            {PARTNER_TIERS.map((tier) => (
              <div
                key={tier.key}
                className={
                  tier.highlight
                    ? "relative rounded-[var(--radius-lg)] border-2 border-primary bg-surface p-6 shadow-[var(--shadow-card-hover)]"
                    : "relative rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
                }
              >
                {tier.highlight && (
                  <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                    <Crown className="h-3.5 w-3.5" aria-hidden />
                    Most popular
                  </span>
                )}
                <h3 className="font-heading text-xl font-bold text-ink">{tier.name}</h3>
                <p className="mt-1 text-sm text-ink-muted">{tier.tagline}</p>
                <ul className="mt-5 space-y-2.5">
                  {tier.benefits.map((benefit) => (
                    <li key={benefit} className="flex items-start gap-2 text-sm text-ink">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                      <span>{benefit}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="#apply"
                  className={
                    tier.highlight
                      ? "mt-6 flex w-full items-center justify-center rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-hover"
                      : "mt-6 flex w-full items-center justify-center rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary"
                  }
                >
                  Apply for {tier.name}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section id="apply" className="container-app scroll-mt-24 py-16">
        <div className="mx-auto max-w-2xl">
          <div className="text-center">
            <h2 className="font-heading text-2xl font-semibold text-ink sm:text-3xl">
              Apply to partner with us
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
              Fill in the form below and our team will be in touch.
            </p>
          </div>
          <div className="mt-8">
            <PartnerForm />
          </div>
        </div>
      </section>
    </div>
  );
}
