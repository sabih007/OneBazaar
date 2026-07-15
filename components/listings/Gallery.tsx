"use client";

import Image from "next/image";
import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Gallery({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);

  if (images.length === 0) {
    return (
      <div className="flex aspect-[4/3] w-full items-center justify-center rounded-[var(--radius-lg)] border border-line bg-background text-ink-muted">
        <ImageOff className="h-10 w-10" aria-hidden />
      </div>
    );
  }

  function go(delta: number) {
    setIndex((i) => (i + delta + images.length) % images.length);
  }

  return (
    <div>
      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-lg)] border border-line bg-background shadow-[var(--shadow-card)]">
        <Image
          src={images[index]}
          alt={`${title} — photo ${index + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 60vw"
          className="object-cover"
        />

        {images.length > 1 && (
          <>
            <button
              aria-label="Previous photo"
              onClick={() => go(-1)}
              className="absolute left-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-[var(--shadow-card)] backdrop-blur transition-transform hover:scale-105"
            >
              <ChevronLeft className="h-5 w-5 text-ink" />
            </button>
            <button
              aria-label="Next photo"
              onClick={() => go(1)}
              className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full bg-surface/90 shadow-[var(--shadow-card)] backdrop-blur transition-transform hover:scale-105"
            >
              <ChevronRight className="h-5 w-5 text-ink" />
            </button>
            <span className="absolute bottom-3 right-3 rounded-full bg-ink/70 px-2.5 py-1 text-xs font-medium text-white backdrop-blur">
              {index + 1} / {images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((src, i) => (
            <button
              key={src + i}
              onClick={() => setIndex(i)}
              className={cn(
                "relative h-16 w-20 shrink-0 overflow-hidden rounded-md ring-2 ring-offset-2 ring-offset-background transition-all",
                i === index ? "ring-primary" : "ring-transparent hover:ring-line"
              )}
              aria-label={`View photo ${i + 1}`}
            >
              <Image src={src} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
