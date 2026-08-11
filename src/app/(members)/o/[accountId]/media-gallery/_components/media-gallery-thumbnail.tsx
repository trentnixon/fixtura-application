"use client";

import { ImageOff } from "lucide-react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";

type MediaGalleryThumbnailProps = {
  src: string;
  alt: string;
  className?: string;
};

export function MediaGalleryThumbnail({ src, alt, className }: MediaGalleryThumbnailProps) {
  const trimmedSrc = src.trim();
  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    setImageFailed(false);
  }, [trimmedSrc]);

  const showImage = Boolean(trimmedSrc) && !imageFailed;

  return (
    <div
      className={cn("bg-muted relative aspect-video w-full overflow-hidden", className)}
      aria-label={showImage ? undefined : `Image unavailable: ${alt}`}
    >
      {showImage ? (
        <img
          src={trimmedSrc}
          alt={alt}
          className="size-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div className="text-muted-foreground flex size-full flex-col items-center justify-center gap-2 px-4 text-center">
          <ImageOff className="size-6 shrink-0" aria-hidden />
          <span className="text-xs font-medium">Image unavailable</span>
        </div>
      )}
    </div>
  );
}
