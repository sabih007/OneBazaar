import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "The terms and conditions that govern your use of Buysellox.com's marketplace.",
  alternates: { canonical: "/terms" },
};

export default function TermsPage() {
  return (
    <>
      <h1>Terms &amp; Conditions</h1>
      <p>
        Last updated: 15 July 2026. These Terms &amp; Conditions (&quot;Terms&quot;) also serve as
        our Terms of Use and govern your access to and use of Buysellox.com (&quot;Buysellox.com&quot;,
        &quot;we&quot;, &quot;us&quot;). By creating an account, posting a listing, or otherwise
        using Buysellox.com, you agree to these Terms. If you do not agree, please do not use Buysellox.com.
      </p>

      <h2>1. What Buysellox.com Is</h2>
      <p>
        Buysellox.com is an online classifieds marketplace that lets users in Pakistan post, browse, and
        respond to listings for items such as property, vehicles, mobiles, electronics, and other
        goods. Buysellox.com provides the platform only — we are not a party to, and do not guarantee,
        any transaction between a buyer and a seller.
      </p>

      <h2>2. Eligibility &amp; Your Account</h2>
      <ul>
        <li>You must be at least 18 years old to create an account or post a listing.</li>
        <li>
          You must provide accurate information (full name, email, phone number, city) and verify
          your email with the code we send before your account is activated.
        </li>
        <li>You are responsible for keeping your password confidential and for all activity under your account.</li>
        <li>One person or business may not maintain more than one account to evade a suspension.</li>
      </ul>

      <h2>3. Posting Listings</h2>
      <ul>
        <li>Listings must accurately describe the item, its condition, and its price.</li>
        <li>You must have the legal right to sell the item you list.</li>
        <li>
          Prohibited items include (without limitation): weapons, drugs, counterfeit goods, stolen
          property, animals or animal parts where prohibited by law, adult content, and anything
          illegal to sell or own in Pakistan.
        </li>
        <li>
          By posting, you grant Buysellox.com a non-exclusive, royalty-free licence to display your
          listing text and images on the platform (and in search results) for as long as the
          listing is active.
        </li>
        <li>We may remove any listing, or suspend any account, that violates these Terms.</li>
      </ul>

      <h2>4. Buyer–Seller Transactions</h2>
      <p>
        Buysellox.com does not inspect, verify, or take custody of items listed on the platform, and does
        not act as an escrow or guarantee payment. Meet in safe, public locations, inspect goods
        before paying, and never send money in advance to a stranger. See our in-app safety notice
        on listing pages for more guidance. Any dispute over an item or payment is between the
        buyer and seller.
      </p>

      <h2>5. Messaging</h2>
      <p>
        The in-app chat is provided so buyers and sellers can discuss a listing. Do not use chat to
        harass, scam, or send unsolicited advertising. We may review reported messages to enforce
        these Terms.
      </p>

      <h2>6. Promoted Listings &amp; Payments</h2>
      <ul>
        <li>
          Sellers may purchase a package to promote a listing (badge, higher ranking, or extended
          duration). Prices are shown before checkout.
        </li>
        <li>Payments are processed by a third-party payment gateway; Buysellox.com does not store your card details.</li>
        <li>Promotion fees are non-refundable once a listing has been promoted, except where required by law.</li>
      </ul>

      <h2>7. Advertising</h2>
      <p>
        Buysellox.com may display third-party advertisements (for example, via Google AdSense) alongside
        listings. We are not responsible for the content of, or any transaction arising from, a
        third-party ad. Ad providers may use cookies as described in our Privacy Policy.
      </p>

      <h2>8. Reporting &amp; Moderation</h2>
      <p>
        Use the &quot;Report&quot; button on a listing to flag spam, scams, prohibited items, or
        other issues. We review reports and may remove content, suspend accounts, or take other
        action at our discretion.
      </p>

      <h2>9. Intellectual Property</h2>
      <p>
        The Buysellox.com name, logo, and site design belong to us. You retain ownership of the content
        you post, subject to the licence granted in Section 3.
      </p>

      <h2>10. Disclaimer of Warranties</h2>
      <p>
        Buysellox.com is provided &quot;as is&quot; without warranties of any kind, express or implied. We
        do not guarantee that listings are accurate, that the service will be uninterrupted, or
        that any transaction will be completed successfully.
      </p>

      <h2>11. Limitation of Liability</h2>
      <p>
        To the fullest extent permitted by law, Buysellox.com is not liable for any indirect, incidental,
        or consequential damages, or for any loss arising from a transaction between users, arising
        out of your use of the platform.
      </p>

      <h2>12. Termination</h2>
      <p>
        You may stop using Buysellox.com and delete your account at any time from your profile settings.
        We may suspend or terminate your account if you violate these Terms.
      </p>

      <h2>13. Governing Law</h2>
      <p>
        These Terms are governed by the laws of Pakistan, and any dispute will be subject to the
        exclusive jurisdiction of the courts of Pakistan.
      </p>

      <h2>14. Changes to These Terms</h2>
      <p>
        We may update these Terms from time to time. We will update the &quot;Last updated&quot;
        date above when we do. Continued use of Buysellox.com after a change means you accept the updated
        Terms.
      </p>

      <h2>15. Contact Us</h2>
      <p>Questions about these Terms? Contact us at support@buysellox.com.</p>
    </>
  );
}
