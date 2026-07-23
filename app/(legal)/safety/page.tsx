import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Safety Tips",
  description: "Practical safety tips for buying and selling safely on Buysellox.com.",
  alternates: { canonical: "/safety" },
};

export default function SafetyPage() {
  return (
    <>
      <h1>Safety Tips</h1>
      <p>
        Buysellox.com connects buyers and sellers directly — we don&apos;t hold funds or inspect
        items on your behalf, so a few precautions go a long way.
      </p>

      <h2>Meeting up</h2>
      <ul>
        <li>Meet in a public, well-lit place — a busy market, mall, or bank branch works well.</li>
        <li>Bring a friend or family member if you can, especially for higher-value items.</li>
        <li>For vehicles or property, meet during daylight hours and verify the address in advance.</li>
      </ul>

      <h2>Before you pay</h2>
      <ul>
        <li>Inspect the item in person and confirm it matches the listing before handing over money.</li>
        <li>Never pay in advance, by bank transfer, or via a link before seeing the item — this is the most common scam pattern.</li>
        <li>For vehicles, check the registration documents match the seller&apos;s ID.</li>
        <li>For property, verify ownership documents before making any payment or deposit.</li>
      </ul>

      <h2>Red flags</h2>
      <ul>
        <li>A price that&apos;s far below market value for no clear reason.</li>
        <li>A seller who refuses to meet in person or share the item&apos;s location.</li>
        <li>Pressure to pay quickly, or to pay through an unfamiliar app or account.</li>
        <li>A buyer offering to overpay and asking you to refund the difference.</li>
      </ul>

      <h2>Reporting a problem</h2>
      <p>
        If a listing or user looks suspicious, use the <strong>Report</strong> button on the
        listing to flag it to our team. If you&apos;ve already been affected by a scam, also
        report it to your local police station.
      </p>
    </>
  );
}
