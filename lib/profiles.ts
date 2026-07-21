import type { SupabaseClient } from "@supabase/supabase-js";

export interface PublicProfile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  city: string | null;
  is_verified: boolean;
  created_at: string;
}

export async function getPublicProfile(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles_public")
    .select("*")
    .eq("id", userId)
    .maybeSingle();

  if (error) throw error;
  return data as PublicProfile | null;
}

export async function getSellerPhone(supabase: SupabaseClient, listingId: string) {
  const { data, error } = await supabase.rpc("get_seller_phone", { p_listing_id: listingId });
  if (error) throw error;
  return data as string | null;
}

export async function getRefreshCredits(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("refresh_credits")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return (data as { refresh_credits: number }).refresh_credits;
}

export interface CreditBalances {
  refresh_credits: number;
  featured_credits: number;
  hot_credits: number;
}

export async function getCreditBalances(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from("profiles")
    .select("refresh_credits, featured_credits, hot_credits")
    .eq("id", userId)
    .single();
  if (error) throw error;
  return data as CreditBalances;
}
