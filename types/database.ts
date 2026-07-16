/**
 * Hand-written mirror of the Supabase schema (supabase/migrations). Once the
 * project is linked, prefer regenerating this with:
 *   npx supabase gen types typescript --linked > types/database.ts
 */

export type Role = "user" | "admin";
export type ListingStatus = "active" | "sold" | "pending" | "expired";
export type Condition = "new" | "used";
export type Badge = "featured" | "urgent" | "top";
export type PaymentMethod = "jazzcash" | "easypaisa" | "card";
export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";
export type ReportStatus = "open" | "reviewed" | "dismissed";
export type ReportReason = "spam" | "scam" | "prohibited" | "other";

export interface Profile {
  id: string;
  full_name: string | null;
  email: string | null;
  phone: string | null;
  avatar_url: string | null;
  city: string | null;
  is_verified: boolean;
  role: Role;
  created_at: string;
}

export interface Listing {
  id: string;
  user_id: string;
  title: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  category: string;
  category_slug: string;
  subcategory: string | null;
  condition: Condition | null;
  attributes: Record<string, string | number | boolean | null>;
  city: string;
  city_slug: string;
  area: string | null;
  images: string[];
  status: ListingStatus;
  badge: Badge | null;
  promotion_rank: number;
  promoted_until: string | null;
  bumped_at: string | null;
  is_featured: boolean;
  views_count: number;
  created_at: string;
  expires_at: string;
}

export interface Package {
  id: string;
  key: "featured" | "urgent" | "top" | "bump";
  name: string;
  badge: Badge | null;
  promotion_rank: number;
  duration_days: number;
  price: number;
  is_active: boolean;
}

export interface AdPromotion {
  id: string;
  listing_id: string;
  user_id: string;
  package_id: string;
  starts_at: string;
  expires_at: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  payment_ref: string | null;
  created_at: string;
}

export interface Favorite {
  id: string;
  user_id: string;
  listing_id: string;
  created_at: string;
}

export interface Conversation {
  id: string;
  listing_id: string;
  buyer_id: string;
  seller_id: string;
  created_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string;
  created_at: string;
  read_at: string | null;
}

export interface Report {
  id: string;
  listing_id: string;
  reporter_id: string;
  reason: ReportReason;
  details: string | null;
  status: ReportStatus;
  created_at: string;
}
