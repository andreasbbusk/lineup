"use client";

import Image from "next/image";
import { useState } from "react";
import type { PostResponse } from "../types";

interface MediaGridProps {
  media?: PostResponse["media"];
  className?: string;
  showLightbox?: boolean;
}

export function MediaGrid({
  media,
  className = "",
  showLightbox = false,
}: MediaGridProps) {
  const [selectedMedia, setSelectedMedia] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  // Sort by displayOrder
  const sortedMedia = [...media].sort(
    (a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)
  );

  const handleMediaClick = (index: number) => {
    if (showLightbox) {
      setSelectedMedia(index);
    }
  };

  const closeLightbox = () => {
    setSelectedMedia(null);
  };

  // Single media item
  if (sortedMedia.length === 1) {
    const item = sortedMedia[0];
    return (
      <>
        <div className={`${className}`}>
          {item.type === "image" ? (
            <Image
              src={item.url}
              alt="Post media"
              width={800}
              height={600}
              className="w-full rounded-lg object-cover"
              onClick={() => handleMediaClick(0)}
              style={{ cursor: showLightbox ? "pointer" : "default" }}
            />
          ) : (
            <video
              src={item.url}
              controls
              className="w-full rounded-lg"
              poster={item.thumbnailUrl || undefined}
            />
          )}
        </div>
        {showLightbox && selectedMedia === 0 && (
          <MediaLightbox
            media={sortedMedia}
            currentIndex={0}
            onClose={closeLightbox}
            onNext={() => setSelectedMedia(null)} // Only one item
            onPrev={() => setSelectedMedia(null)}
          />
        )}
      </>
    );
  }

  // Multiple media items - grid layout
  if (sortedMedia.length === 2) {
    return (
      <>
        <div className={`grid grid-cols-2 gap-2 ${className}`}>
          {sortedMedia.map((item, index) => (
            <div key={item.id} className="relative aspect-square">
              {item.type === "image" ? (
                <Image
                  src={item.url}
                  alt={`Media ${index + 1}`}
                  fill
                  className="rounded-lg object-cover"
                  onClick={() => handleMediaClick(index)}
                  style={{ cursor: showLightbox ? "pointer" : "default" }}
                />
              ) : (
                <video
                  src={item.url}
                  controls
                  className="h-full w-full rounded-lg object-cover"
                  poster={item.thumbnailUrl || undefined}
                />
              )}
            </div>
          ))}
        </div>
        {showLightbox && selectedMedia !== null && (
          <MediaLightbox
            media={sortedMedia}
            currentIndex={selectedMedia}
            onClose={closeLightbox}
            onNext={() =>
              setSelectedMedia(
                selectedMedia < sortedMedia.length - 1 ? selectedMedia + 1 : 0
              )
            }
            onPrev={() =>
              setSelectedMedia(
                selectedMedia > 0 ? selectedMedia - 1 : sortedMedia.length - 1
              )
            }
          />
        )}
      </>
    );
  }

  // 3 or 4 media items - special grid
  return (
    <>
      <div className={`grid grid-cols-2 gap-2 ${className}`}>
        {sortedMedia.slice(0, 3).map((item, index) => (
          <div
            key={item.id}
            className={`relative ${
              index === 0 && sortedMedia.length > 3 ? "row-span-2" : ""
            } aspect-square`}
          >
            {item.type === "image" ? (
              <Image
                src={item.url}
                alt={`Media ${index + 1}`}
                fill
                className="rounded-lg object-cover"
                onClick={() => handleMediaClick(index)}
                style={{ cursor: showLightbox ? "pointer" : "default" }}
              />
            ) : (
              <video
                src={item.url}
                controls
                className="h-full w-full rounded-lg object-cover"
                poster={item.thumbnailUrl || undefined}
              />
            )}
            {index === 2 && sortedMedia.length > 3 && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white">
                <span className="text-2xl font-bold">
                  +{sortedMedia.length - 3}
                </span>
              </div>
            )}
          </div>
        ))}
        {sortedMedia.length > 3 && (
          <div
            className="relative aspect-square cursor-pointer"
            onClick={() => handleMediaClick(3)}
          >
            <Image
              src={sortedMedia[3].url}
              alt="Media 4"
              fill
              className="rounded-lg object-cover"
            />
            {sortedMedia.length > 4 && (
              <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/50 text-white">
                <span className="text-2xl font-bold">
                  +{sortedMedia.length - 4}
                </span>
              </div>
            )}
          </div>
        )}
      </div>
      {showLightbox && selectedMedia !== null && (
        <MediaLightbox
          media={sortedMedia}
          currentIndex={selectedMedia}
          onClose={closeLightbox}
          onNext={() =>
            setSelectedMedia(
              selectedMedia < sortedMedia.length - 1 ? selectedMedia + 1 : 0
            )
          }
          onPrev={() =>
            setSelectedMedia(
              selectedMedia > 0 ? selectedMedia - 1 : sortedMedia.length - 1
            )
          }
        />
      )}
    </>
  );
}

// Lightbox component for viewing media in full screen
function MediaLightbox({
  media,
  currentIndex,
  onClose,
  onNext,
  onPrev,
}: {
  media: PostResponse["media"];
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}) {
  if (!media || media.length === 0) return null;

  const currentMedia = media[currentIndex];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
        aria-label="Close"
      >
        ×
      </button>
      {media.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onPrev();
            }}
            className="absolute left-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            aria-label="Previous"
          >
            ‹
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            className="absolute right-4 z-10 rounded-full bg-white/20 p-2 text-white hover:bg-white/30"
            aria-label="Next"
          >
            ›
          </button>
        </>
      )}
      <div
        className="relative max-h-[90vh] max-w-[90vw]"
        onClick={(e) => e.stopPropagation()}
      >
        {currentMedia.type === "image" ? (
          <Image
            src={currentMedia.url}
            alt={`Media ${currentIndex + 1}`}
            width={1200}
            height={800}
            className="max-h-[90vh] max-w-[90vw] object-contain"
          />
        ) : (
          <video
            src={currentMedia.url}
            controls
            className="max-h-[90vh] max-w-[90vw]"
            poster={currentMedia.thumbnailUrl || undefined}
          />
        )}
      </div>
      {media.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
          {currentIndex + 1} / {media.length}
        </div>
      )}
    </div>
  );
}

