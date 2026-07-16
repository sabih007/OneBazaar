import type { Metadata } from "next";
import Script from "next/script";
import { Afacad, Poppins } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import QueryProvider from "@/components/providers/QueryProvider";
import { ADSENSE_CLIENT_ID } from "@/lib/ads";

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
  title: {
    default: "Buysellox.com — Buy & Sell Anything in Pakistan",
    template: "%s | Buysellox.com",
  },
  description:
    "Buysellox.com is Pakistan's classifieds marketplace — buy and sell houses, cars, plots, mobiles, and more in Karachi, Lahore, Islamabad, and other major cities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${afacad.variable} ${poppins.variable} h-full`}>
      <body className="min-h-full flex flex-col font-body antialiased bg-background text-ink">
        {ADSENSE_CLIENT_ID && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT_ID}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
        <QueryProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
