import type { Metadata } from "next";
import { Mail, MessageCircleQuestion, Phone } from "lucide-react";
import ContactForm from "@/components/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us",
  description: "Get in touch with the Buysellox.com team — support, partnerships, or general questions.",
  alternates: { canonical: "/contact" },
};

export default function ContactPage() {
  return (
    <div>
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-b from-primary-light/70 via-primary-light/20 to-background">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-primary/20 blur-3xl"
        />
        <div className="container-app relative py-14 text-center sm:py-16">
          <span className="inline-flex items-center gap-2 rounded-full bg-surface/80 px-4 py-1.5 text-xs font-medium text-primary-text shadow-[var(--shadow-card)] backdrop-blur">
            <MessageCircleQuestion className="h-4 w-4" aria-hidden />
            We&apos;re here to help
          </span>
          <h1 className="mt-5 font-heading text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Contact Us
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm text-ink-muted sm:text-base">
            Questions about buying, selling, or partnering with Buysellox.com? Send us a message
            and our team will get back to you.
          </p>
          <p className="mt-4 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm font-medium text-primary-text">
            <span className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" aria-hidden />
              <a href="mailto:support@buysellox.com" className="hover:underline">
                support@buysellox.com
              </a>
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden />
              <a href="tel:+923253596641" className="hover:underline">
                +92 325 3596641
              </a>
            </span>
          </p>
        </div>
      </section>

      <section className="container-app py-14">
        <div className="mx-auto max-w-xl">
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
