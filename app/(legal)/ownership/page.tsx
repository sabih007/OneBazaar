import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Ownership Statement",
  description: "Ownership and business details for Buysellox.com, as required by our payment processing partners.",
  alternates: { canonical: "/ownership" },
};

export default function OwnershipStatementPage() {
  return (
    <>
      <h1>Ownership Statement</h1>
      <p>Last updated: 24 July 2026.</p>

      <h2>Business Details</h2>
      <ul>
        <li>
          <strong>Trading name:</strong> Buysellox.com
        </li>
        <li>
          <strong>Owner:</strong> Sabih Ul Ebad
        </li>
        <li>
          <strong>Business structure:</strong> Sole proprietorship. Buysellox.com is not currently
          registered as a separate corporate entity in Pakistan.
        </li>
        <li>
          <strong>Registered/office address:</strong> Flat No. 403, Fourth Floor, Karachi, Pakistan
        </li>
        <li>
          <strong>Contact phone:</strong> +92 325 3596641
        </li>
        <li>
          <strong>Contact email:</strong>{" "}
          <a href="mailto:support@buysellox.com">support@buysellox.com</a>
        </li>
      </ul>

      <p>
        Buysellox.com is owned and operated by the individual named above. This page is published
        to disclose ownership and business contact details, including for verification by our
        payment processing partners.
      </p>
    </>
  );
}
