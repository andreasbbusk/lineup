"use client";

import { UploadedMedia } from "../types";

interface MediaPreviewProps {
  media: UploadedMedia[];
  onRemove: (index: number) => void;
  maxItems?: number;
}

export function MediaPreview({
  media,
  onRemove,
  maxItems = 4,
}: MediaPreviewProps) {
  if (media.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {media.slice(0, maxItems).map((item, index) => (
        <div key={index} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
          {item.type === "image" ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={item.url}
              alt={`Media ${index + 1}`}
              className="h-full w-full object-cover"
            />
          ) : (
            <video
              src={item.url}
              className="h-full w-full object-cover"
              controls
            />
          )}
          <button
            onClick={() => onRemove(index)}
            className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70"
            aria-label="Remove media"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
}

