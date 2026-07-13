const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://onebazaar.pk";

export function breadcrumbListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function organizationJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "OneBazaar",
    url: SITE_URL,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "OneBazaar",
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

export function listingJsonLd(listing: {
  title: string;
  description: string;
  price: number;
  currency: string;
  images: string[];
  status: string;
  url: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers: {
      "@type": "Offer",
      price: listing.price,
      priceCurrency: listing.currency,
      availability:
        listing.status === "sold"
          ? "https://schema.org/SoldOut"
          : "https://schema.org/InStock",
      url: `${SITE_URL}${listing.url}`,
    },
  };
}

/** Escapes `<` so JSON-LD embedded in a <script> tag can't break out via `</script>` (Next.js json-ld guide). */
export function toJsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
