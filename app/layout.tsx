import type { Metadata } from "next";
import Script from "next/script";
import { Afacad, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import BetaPartnerPopup from "@/components/marketing/BetaPartnerPopup";
import QueryProvider from "@/components/providers/QueryProvider";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";
import { GA_MEASUREMENT_ID } from "@/lib/analytics";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/seo/site";
import { organizationJsonLd, toJsonLdScript, websiteJsonLd } from "@/lib/seo/jsonld";

const afacad = Afacad({
  variable: "--font-afacad",
  subsets: ["latin"],
  weight: ["600", "700"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — Free Classified Ads in Pakistan | Buy & Sell Anything`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: [
    "free classified ads Pakistan",
    "online classified ads Pakistan",
    "post classified ads online",
    "classified ads website Pakistan",
    "buy and sell Pakistan",
    "online classifieds Pakistan",
    "OLX Pakistan alternative",
    "used cars for sale Pakistan",
    "houses for sale Pakistan",
  ],
  applicationName: SITE_NAME,
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: SITE_NAME,
    title: `${SITE_NAME} — Free Classified Ads in Pakistan`,
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    locale: "en_PK",
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} — Free Classified Ads in Pakistan`,
    description: SITE_DESCRIPTION,
  },
  ...(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION },
  }),
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-PK" className={`${afacad.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col font-body antialiased bg-background text-ink">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(organizationJsonLd()) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLdScript(websiteJsonLd()) }}
        />
        {ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        {GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="google-analytics" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${GA_MEASUREMENT_ID}');
              `}
            </Script>
          </>
        )}
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <BetaPartnerPopup />
        </QueryProvider>
      </body>
    </html>
  );
}
