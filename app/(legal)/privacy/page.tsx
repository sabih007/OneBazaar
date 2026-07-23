import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Buysellox.com collects, uses, and protects your personal information.",
  alternates: { canonical: "/privacy" },
};

export default function PrivacyPage() {
  return (
    <>
      <h1>Privacy Policy</h1>
      <p>
        Last updated: 15 July 2026. This Privacy Policy explains what information Buysellox.com
        (&quot;Buysellox.com&quot;, &quot;we&quot;, &quot;us&quot;) collects, how we use it, and the
        choices you have.
      </p>

      <h2>1. Information We Collect</h2>
      <ul>
        <li>
          <strong>Account information:</strong> full name, email address, phone number, city, and
          password (stored encrypted, never in plain text).
        </li>
        <li>
          <strong>Listing content:</strong> the title, description, price, category, attributes,
          and photos you upload when you post an ad.
        </li>
        <li>
          <strong>Messages:</strong> chat messages you send to other users about a listing.
        </li>
        <li>
          <strong>Usage data:</strong> pages viewed, listings favorited, and similar interactions,
          used to operate features like view counts and your favorites list.
        </li>
        <li>
          <strong>Local storage/cookies:</strong> we store your selected city in your browser&apos;s
          local storage so the site remembers it on return visits.
        </li>
        <li>
          <strong>Payment data:</strong> if you buy a promotion package, our payment gateway
          processes your card/payment details directly — Buysellox.com does not receive or store your
          full card number.
        </li>
      </ul>

      <h2>2. How We Use Your Information</h2>
      <ul>
        <li>To create and secure your account, including sending the email verification code.</li>
        <li>To display your listings and public profile to other users.</li>
        <li>To enable chat between buyers and sellers about a listing.</li>
        <li>To process payments for promoted listings.</li>
        <li>To review reported listings or messages and enforce our Terms &amp; Conditions.</li>
        <li>To improve the site and understand how it&apos;s used.</li>
      </ul>

      <h2>3. Who We Share Information With</h2>
      <ul>
        <li>
          <strong>Other users:</strong> your name and listing details are visible to anyone
          browsing Buysellox.com. If you message another user, they see your name and message content.
        </li>
        <li>
          <strong>Service providers:</strong> we use Supabase for account authentication, database,
          and file storage, and a payment gateway (Lemon Squeezy) to process promotion payments.
        </li>
        <li>
          <strong>Advertising partners:</strong> Buysellox.com may show ads through Google AdSense.
          Google may use cookies or similar technology to serve ads based on your visits to this
          and other sites — see Google&apos;s own privacy policy for how it handles that data. You
          can opt out of personalized advertising through Google&apos;s Ads Settings.
        </li>
        <li>We do not sell your personal information.</li>
      </ul>

      <h2>4. Cookies &amp; Similar Technologies</h2>
      <p>
        We use browser local storage to remember your selected city. If advertising is enabled,
        our ad partner may set cookies to measure and personalize ads. You can clear these at any
        time through your browser settings.
      </p>

      <h2>5. Data Retention</h2>
      <p>
        We keep your account and listing information for as long as your account is active. If you
        delete your account, we remove your profile and listings, except where we need to retain
        limited records to comply with law or resolve disputes.
      </p>

      <h2>6. Data Security</h2>
      <p>
        We rely on our infrastructure providers&apos; security controls (encryption in transit,
        access-controlled databases) to protect your information, but no online service can
        guarantee absolute security.
      </p>

      <h2>7. Your Rights</h2>
      <p>
        You can review and update your profile information at any time from your account settings,
        and you can request deletion of your account and associated data by contacting us. You may
        also ask us what personal data we hold about you.
      </p>

      <h2>8. Children&apos;s Privacy</h2>
      <p>Buysellox.com is not intended for anyone under 18, and we do not knowingly collect data from children.</p>

      <h2>9. Changes to This Policy</h2>
      <p>
        We may update this Privacy Policy from time to time. We&apos;ll update the &quot;Last
        updated&quot; date above when we do.
      </p>

      <h2>10. Contact Us</h2>
      <p>Questions about this Privacy Policy or your data? Contact us at support@buysellox.com.</p>
    </>
  );
}
