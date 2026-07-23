import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Cancellation & Refund Policy",
  description: "Buysellox.com's cancellation, return, and refund policy for promotion package purchases.",
  alternates: { canonical: "/refund-policy" },
};

export default function RefundPolicyPage() {
  return (
    <>
      <h1>Cancellation &amp; Refund Policy</h1>
      <p>
        Last updated: 24 July 2026. This policy explains cancellations, returns, and refunds for
        purchases made on Buysellox.com (&quot;Buysellox.com&quot;, &quot;we&quot;, &quot;us&quot;).
      </p>

      <h2>1. What This Policy Covers</h2>
      <p>
        Buysellox.com is a classifieds marketplace: we do not sell, ship, or take custody of the
        items buyers and sellers list and arrange between themselves. The only thing you buy
        directly from Buysellox.com is a <strong>promotion package</strong> — a paid badge, ranking
        boost, refresh, or credit bundle applied to your own listing. This policy covers those
        purchases. It does not cover, and we are not responsible for, the goods or services
        exchanged between buyers and sellers — see Section 4 of our{" "}
        <Link href="/terms">Terms &amp; Conditions</Link>.
      </p>

      <h2>2. Cancellation</h2>
      <p>
        A promotion purchase is applied to your listing immediately once payment is confirmed by
        our payment gateway, so there is no cancellation window after that point. If you start a
        checkout and close the page or abandon it before paying, no charge is made and nothing is
        applied — you can simply start again.
      </p>

      <h2>3. Refunds</h2>
      <ul>
        <li>
          Promotion fees are <strong>non-refundable</strong> once a package has been successfully
          applied to a listing (badge shown, ranking boosted, or credits added to your account),
          except where required by applicable law.
        </li>
        <li>
          If you were charged but the package was never applied to your listing or account due to
          a technical error on our side, contact us within 7 days of the charge and we will
          investigate and refund the affected amount.
        </li>
        <li>
          If a payment is deducted by your bank/wallet but our system never marked it as paid
          (for example, you were redirected back before completing the gateway&apos;s confirmation
          step), contact us with your payment reference and we will reconcile it with the gateway
          and refund any duplicate or failed charge that was still deducted.
        </li>
      </ul>

      <h2>4. Turnaround Time</h2>
      <p>
        Approved refunds are processed back to the original payment method within 7–14 business
        days, depending on how quickly our payment gateway and your bank/wallet settle the reversal.
      </p>

      <h2>5. How to Request a Refund</h2>
      <p>
        Email <a href="mailto:support@buysellox.com">support@buysellox.com</a> with your account
        email, the listing or package affected, the amount charged, and the payment reference
        (from your JazzCash/card confirmation). We aim to respond within 2 business days.
      </p>

      <h2>6. Changes to This Policy</h2>
      <p>
        We may update this policy from time to time. We will update the &quot;Last updated&quot;
        date above when we do.
      </p>
    </>
  );
}
