import type { Metadata } from "next";
import { createClient, getUser } from "@/lib/supabase/server";
import ProfileForm from "@/components/dashboard/ProfileForm";

export const metadata: Metadata = { title: "Edit profile" };

export default async function ProfilePage() {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (!profile) return null;

  return <ProfileForm profile={profile} />;
}
