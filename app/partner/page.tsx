import type { Metadata } from "next";
import Link from "next/link";
import { Crown, Handshake, TrendingUp, ShieldCheck } from "lucide-react";
import { AGENT_TIER_ORDER, TIER_INFO } from "@/lib/subscriptions";
import { formatPKR } from "@/lib/utils";
import PartnerForm from "@/components/partner/PartnerForm";
import SubscribeButton from "@/components/credits/SubscribeButton";

export const metadata: Metadata = {
  title: "Become Our Partner",
  description:
    "Real-estate agent and agency plans on Buysellox.com — published pricing, well below market, with priority placement and a verified agency badge.",
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
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-1.5 text-xs font-medium text-primary-text shadow-[var(--shadow-card)] backdrop-blur">
            <Handshake className="h-4 w-4" aria-hidden />
            Partner programme
          </span>
          <h1 className="mt-5 font-heading text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Partner with <span className="text-primary-text">Buysellox</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-sm text-ink-muted sm:text-base">
            Real-estate agent and agency plans with pricing published upfront — priority
            placement, a verified agency badge, and dedicated support.
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
                <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary-text">
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
              Plans for agents &amp; agencies
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-sm text-ink-muted">
              Real, published pricing — well below what you&apos;re paying today.
            </p>
          </div>

          <div className="mx-auto mt-10 grid max-w-4xl gap-6 sm:grid-cols-3">
            {AGENT_TIER_ORDER.map((tier) => {
              const info = TIER_INFO[tier];
              const highlight = tier === "agency";
              return (
                <div
                  key={tier}
                  className={
                    highlight
                      ? "relative rounded-[var(--radius-lg)] border-2 border-primary bg-surface p-6 shadow-[var(--shadow-card-hover)]"
                      : "relative rounded-[var(--radius-lg)] border border-line bg-surface p-6 shadow-[var(--shadow-card)]"
                  }
                >
                  {highlight && (
                    <span className="absolute -top-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1 rounded-full bg-primary px-3 py-1 text-xs font-semibold text-white">
                      <Crown className="h-3.5 w-3.5" aria-hidden />
                      Most popular
                    </span>
                  )}
                  <h3 className="font-heading text-xl font-bold text-ink">{info.name}</h3>
                  <p className="mt-1 font-heading text-2xl font-bold text-ink">
                    {formatPKR(info.price)}
                    <span className="text-sm font-normal text-ink-muted">/mo</span>
                  </p>
                  <ul className="mt-5 space-y-1.5 text-sm text-ink-muted">
                    <li>{info.activeSlotLimit} active property listings</li>
                    <li>{info.featuredCredits} Premium listing credits/mo</li>
                    <li>{info.hotCredits} Hot listing credits/mo</li>
                    <li>{info.refreshCredits} Refresh credits/mo</li>
                    <li>Verified agency badge</li>
                  </ul>
                  <div className="mt-6">
                    {tier === "agent_starter" ? (
                      <SubscribeButton tier={tier} />
                    ) : (
                      <Link
                        href="#apply"
                        className="flex w-full items-center justify-center rounded-md border border-line px-4 py-2.5 text-sm font-semibold text-ink transition-colors hover:border-primary hover:text-primary-text"
                      >
                        Apply now
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-center text-xs text-ink-muted">
            Agency and Agency Premium include onboarding support and are set up by our team — apply
            below and we&apos;ll get you started.
          </p>
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
