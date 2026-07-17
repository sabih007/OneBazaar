import { SITE_NAME, SITE_URL } from "@/lib/seo/site";

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
    name: SITE_NAME,
    url: SITE_URL,
    areaServed: {
      "@type": "Country",
      name: "Pakistan",
    },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: "en-PK",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };
}

/** ItemList for a browse/category×city page — helps search engines understand the page lists many offers. */
export function itemListJsonLd(items: { name: string; url: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: `${SITE_URL}${item.url}`,
    })),
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
  categorySlug: string;
  city: string;
  condition?: string | null;
}) {
  const offers = {
    "@type": "Offer",
    price: listing.price,
    priceCurrency: listing.currency,
    availability:
      listing.status === "sold"
        ? "https://schema.org/SoldOut"
        : "https://schema.org/InStock",
    url: `${SITE_URL}${listing.url}`,
    areaServed: {
      "@type": "City",
      name: listing.city,
    },
    ...(listing.condition && {
      itemCondition:
        listing.condition === "new"
          ? "https://schema.org/NewCondition"
          : "https://schema.org/UsedCondition",
    }),
  };

  // Vehicle has clean, well-defined schema.org fields; everything else (property,
  // mobiles, etc.) stays as Product — RealEstateListing lacks a reliable `offers`
  // fit for our data, so per spec §10 we fall back to Product "where it fits".
  return {
    "@context": "https://schema.org",
    "@type": listing.categorySlug === "vehicles" ? "Vehicle" : "Product",
    name: listing.title,
    description: listing.description,
    image: listing.images,
    offers,
  };
}

/** Escapes `<` so JSON-LD embedded in a <script> tag can't break out via `</script>` (Next.js json-ld guide). */
export function toJsonLdScript(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
