import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCategory } from "@/lib/categories";
import { getCity } from "@/lib/cities";
import {
  getFavoritedListingIds,
  getListingBySlug,
  getSimilarListings,
  incrementListingViews,
} from "@/lib/listings";
import { getPublicProfile } from "@/lib/profiles";
import { expireStalePromotions } from "@/lib/promotions-server";
import { createClient, getUser } from "@/lib/supabase/server";
import { isSupabaseConfigured } from "@/lib/supabase/is-configured";
import { formatPKR } from "@/lib/utils";
import {
  breadcrumbListJsonLd,
  listingJsonLd,
  toJsonLdScript,
} from "@/lib/seo/jsonld";
import Breadcrumbs from "@/components/layout/Breadcrumbs";
import Gallery from "@/components/listings/Gallery";
import PromoBadge from "@/components/listings/PromoBadge";
import AttributesList from "@/components/listings/AttributesList";
import SafetyNotice from "@/components/listings/SafetyNotice";
import SaveButton from "@/components/listings/SaveButton";
import ReportButton from "@/components/listings/ReportButton";
import SellerCard from "@/components/listings/SellerCard";
import OwnerActions from "@/components/listings/OwnerActions";
import ListingGrid from "@/components/listings/ListingGrid";
import AdSlot from "@/components/ads/AdSlot";
import { AD_SLOTS } from "@/lib/ads";

interface ListingPageParams {
  category: string;
  city: string;
  listing: string;
}

interface ListingPageProps {
  params: Promise<ListingPageParams>;
}

export async function generateMetadata({ params }: ListingPageProps): Promise<Metadata> {
  if (!isSupabaseConfigured) return {};

  const { city: citySlug, listing: listingSlug } = await params;
  const supabase = await createClient();
  const listing = await getListingBySlug(supabase, citySlug, listingSlug);
  if (!listing) return {};

  const city = getCity(citySlug);
  const cityName = city?.name ?? listing.city;
  const title = `${listing.title} in ${cityName} — Rs. ${new Intl.NumberFormat("en-PK").format(listing.price)} | Buysellox.com`;
  const description = `${listing.description.slice(0, 100)} — free classified ad on Buysellox.com.`;
  const url = `/${listing.category_slug}/${listing.city_slug}/${listing.slug}`;

  return {
    title,
    description,
    keywords: [
      listing.title,
      `${listing.title} ${cityName}`,
      `${listing.category} classified ads ${cityName}`,
      listing.category,
      "classified ads",
    ],
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      images: listing.images.slice(0, 1),
      url,
      type: "website",
      locale: "en_PK",
      siteName: "Buysellox.com",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: listing.images.slice(0, 1),
    },
  };
}

export default async function ListingDetailPage({ params }: ListingPageProps) {
  const { category: categorySlug, city: citySlug, listing: listingSlug } = await params;

  const category = getCategory(categorySlug);
  const city = getCity(citySlug);
  if (!category || !city) notFound();

  if (!isSupabaseConfigured) {
    return (
      <div className="container-app py-16 text-center">
        <h1 className="font-heading text-xl font-semibold text-ink">Connect Supabase first</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Listing pages need a live Supabase project to load data.
        </p>
      </div>
    );
  }

  const supabase = await createClient();
  expireStalePromotions(supabase);
  const [listing, user] = await Promise.all([
    getListingBySlug(supabase, citySlug, listingSlug),
    getUser(),
  ]);
  if (!listing) notFound();

  const isOwner = user?.id === listing.user_id;
  const isLoggedIn = Boolean(user);

  const [seller, similar, favorite, similarFavoritedIds] = await Promise.all([
    getPublicProfile(supabase, listing.user_id),
    getSimilarListings(supabase, listing),
    user
      ? supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listing.id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
    user ? getFavoritedListingIds(supabase, user.id) : Promise.resolve(new Set<string>()),
  ]);

  if (!isOwner) {
    // Fire-and-forget — the view count isn't part of this render, no need to block on it.
    incrementListingViews(supabase, listing.id).catch(() => {});
  }

  const breadcrumbs = [
    { label: "Home", href: "/" },
    { label: category.name, href: `/${category.slug}/${city.slug}` },
    { label: city.name, href: `/${category.slug}/${city.slug}` },
    { label: listing.title },
  ];

  return (
    <div className="container-app py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLdScript(
            breadcrumbListJsonLd(breadcrumbs.map((b) => ({ name: b.label, url: b.href ?? "#" })))
          ),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: toJsonLdScript(
            listingJsonLd({
              title: listing.title,
              description: listing.description,
              price: listing.price,
              currency: listing.currency,
              images: listing.images,
              status: listing.status,
              url: `/${listing.category_slug}/${listing.city_slug}/${listing.slug}`,
              categorySlug: listing.category_slug,
              city: listing.city,
              condition: listing.condition,
            })
          ),
        }}
      />

      <Breadcrumbs items={breadcrumbs} />

      <div className="mt-5 grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <Gallery images={listing.images} title={listing.title} />

          <div className="mt-5 rounded-[var(--radius-lg)] border border-line bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
            <div className="flex items-center gap-2">
              {listing.badge && <PromoBadge badge={listing.badge} />}
              {listing.status === "sold" && (
                <span className="rounded-full bg-success px-2.5 py-1 text-xs font-semibold text-white shadow-sm">
                  Sold
                </span>
              )}
            </div>
            <p className="mt-3 font-heading text-4xl font-bold text-ink">
              {formatPKR(listing.price)}
            </p>
            <h1 className="mt-1 text-lg font-semibold text-ink">{listing.title}</h1>
            <p className="mt-1 text-sm text-ink-muted">
              {listing.city}
              {listing.area ? `, ${listing.area}` : ""}
            </p>

            {!isOwner && (
              <div className="mt-4 flex gap-2">
                <SaveButton
                  listingId={listing.id}
                  userId={user?.id ?? null}
                  initialFavorited={Boolean(favorite.data)}
                />
                <ReportButton listingId={listing.id} userId={user?.id ?? null} />
              </div>
            )}

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="mb-3 font-heading text-base font-semibold text-ink">Details</h2>
              <AttributesList category={category} attributes={listing.attributes} />
            </div>

            <div className="mt-6 border-t border-line pt-6">
              <h2 className="mb-2 font-heading text-base font-semibold text-ink">Description</h2>
              <p className="whitespace-pre-line text-sm text-ink">{listing.description}</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 self-start lg:col-span-1">
          {isOwner ? (
            <OwnerActions listingId={listing.id} status={listing.status} />
          ) : (
            <SellerCard
              seller={seller}
              listingId={listing.id}
              isOwner={isOwner}
              isLoggedIn={isLoggedIn}
              userId={user?.id ?? null}
            />
          )}
          <SafetyNotice />
          <AdSlot slot={AD_SLOTS.listingSidebar} label="Listing sidebar" className="h-72" />
        </div>
      </div>

      <AdSlot slot={AD_SLOTS.listing} label="Listing" className="mt-10" />

      {similar.length > 0 && (
        <div className="mt-10">
          <h2 className="mb-4 font-heading text-xl font-semibold text-ink">
            Similar in {city.name}
          </h2>
          <ListingGrid listings={similar} userId={user?.id ?? null} favoritedIds={similarFavoritedIds} />
        </div>
      )}
    </div>
  );
}
