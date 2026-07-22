"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { ImagePlus, Loader2, Star, X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { compressImage } from "@/lib/image-compress";
import { cn } from "@/lib/utils";

const MAX_IMAGES = 8;

interface ImageUploaderProps {
  userId: string;
  images: string[];
  onChange: (images: string[]) => void;
}

export default function ImageUploader({ userId, images, onChange }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function onFilesSelected(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);

    const remaining = MAX_IMAGES - images.length;
    const files = Array.from(fileList).slice(0, remaining);
    if (files.length === 0) {
      setError(`You can upload up to ${MAX_IMAGES} photos`);
      return;
    }

    setUploading(true);
    try {
      const supabase = createClient();
      const uploaded: string[] = [];

      for (const file of files) {
        const compressed = await compressImage(file);
        const path = `${userId}/${crypto.randomUUID()}.jpg`;
        const { error: uploadError } = await supabase.storage
          .from("listing-images")
          .upload(path, compressed, { contentType: "image/jpeg" });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage.from("listing-images").getPublicUrl(path);
        uploaded.push(data.publicUrl);
      }

      onChange([...images, ...uploaded]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to upload image");
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function removeAt(i: number) {
    onChange(images.filter((_, idx) => idx !== i));
  }

  function makeCover(i: number) {
    if (i === 0) return;
    const next = [...images];
    const [item] = next.splice(i, 1);
    next.unshift(item);
    onChange(next);
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {images.map((src, i) => (
          <div
            key={src}
            className="group relative aspect-square overflow-hidden rounded-md border border-line"
          >
            <Image src={src} alt="" fill sizes="150px" className="object-cover" />
            {i === 0 && (
              <span className="absolute left-1.5 top-1.5 flex items-center gap-1 rounded-full bg-primary px-2 py-0.5 text-[10px] font-semibold text-white">
                <Star className="h-2.5 w-2.5 fill-white" /> Cover
              </span>
            )}
            <button
              type="button"
              onClick={() => removeAt(i)}
              aria-label="Remove photo"
              className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-ink/70 text-white transition-opacity hover:bg-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
            >
              <X className="h-4 w-4" />
            </button>
            {i !== 0 && (
              <button
                type="button"
                onClick={() => makeCover(i)}
                className="absolute inset-x-0 bottom-0 bg-ink/60 py-1 text-[10px] text-white transition-opacity sm:opacity-0 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100"
              >
                Make cover
              </button>
            )}
          </div>
        ))}

        {images.length < MAX_IMAGES && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className={cn(
              "flex aspect-square flex-col items-center justify-center gap-1.5 rounded-md border border-dashed border-line text-ink-muted transition-colors hover:border-primary hover:text-primary-text",
              uploading && "pointer-events-none opacity-60"
            )}
          >
            {uploading ? (
              <Loader2 className="h-6 w-6 animate-spin" />
            ) : (
              <ImagePlus className="h-6 w-6" />
            )}
            <span className="text-xs">{uploading ? "Uploading…" : "Add photo"}</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => onFilesSelected(e.target.files)}
      />

      <p className="mt-2 text-xs text-ink-muted">
        Up to {MAX_IMAGES} photos. First photo is the cover — click &quot;Make cover&quot; on
        another to change it.
      </p>
      {error && <p className="mt-1 text-xs text-danger">{error}</p>}
    </div>
  );
}
