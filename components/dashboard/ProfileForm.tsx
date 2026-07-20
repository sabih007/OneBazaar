"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Camera } from "lucide-react";
import { profileSchema, type ProfileInput } from "@/lib/validations/profile";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { cities } from "@/lib/cities";
import type { Profile } from "@/types/database";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Select } from "@/components/ui/Select";

export default function ProfileForm({ profile }: { profile: Profile }) {
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url);
  const [uploading, setUploading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: profile.full_name ?? "",
      phone: profile.phone ?? "",
      city: profile.city ?? "",
    },
  });

  async function onAvatarSelected(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const supabase = createClient();
      const compressed = await compressImage(file, { maxDimension: 400 });
      const path = `${profile.id}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, compressed, { contentType: "image/jpeg", upsert: true });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      const url = `${data.publicUrl}?t=${Date.now()}`;
      await supabase.from("profiles").update({ avatar_url: url }).eq("id", profile.id);
      setAvatarUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload avatar");
    } finally {
      setUploading(false);
    }
  }

  async function onSubmit(values: ProfileInput) {
    setError(null);
    setSaved(false);
    const supabase = createClient();
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ full_name: values.fullName, phone: values.phone, city: values.city })
      .eq("id", profile.id);

    if (updateError) {
      setError(updateError.message);
      return;
    }
    setSaved(true);
  }

  return (
    <div className="max-w-lg">
      <h1 className="mb-4 font-heading text-2xl font-bold text-ink">Edit profile</h1>

      <div className="mb-6 flex items-center gap-4">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          className="group relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border border-line bg-primary-light text-2xl font-semibold text-primary-text"
        >
          {avatarUrl ? (
            <Image src={avatarUrl} alt="Avatar" fill className="object-cover" />
          ) : (
            (profile.full_name || "U").charAt(0).toUpperCase()
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-ink/40 text-white opacity-0 transition-opacity group-hover:opacity-100">
            <Camera className="h-5 w-5" />
          </span>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onAvatarSelected(e.target.files?.[0])}
        />
        <div>
          <p className="text-sm font-medium text-ink">{uploading ? "Uploading…" : "Profile photo"}</p>
          <p className="text-xs text-ink-muted">Click the avatar to change it</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <Label htmlFor="fullName">Full name</Label>
          <Input id="fullName" {...register("fullName")} />
          {errors.fullName && <p className="mt-1 text-xs text-danger">{errors.fullName.message}</p>}
        </div>

        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" type="tel" {...register("phone")} />
          {errors.phone && <p className="mt-1 text-xs text-danger">{errors.phone.message}</p>}
        </div>

        <div>
          <Label htmlFor="city">City</Label>
          <Select id="city" {...register("city")}>
            {cities.map((c) => (
              <option key={c.slug} value={c.name}>
                {c.name}
              </option>
            ))}
          </Select>
        </div>

        {error && <p className="text-sm text-danger">{error}</p>}
        {saved && <p className="text-sm text-success">Profile updated.</p>}

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving…" : "Save changes"}
        </Button>
      </form>
    </div>
  );
}
