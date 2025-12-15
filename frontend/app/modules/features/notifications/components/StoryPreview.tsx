import Image from "next/image";

interface StoryPreviewProps {
  imageUrl: string;
  alt?: string;
}

/**
 * Story preview thumbnail component
 */
export function StoryPreview({ imageUrl, alt = "Story preview" }: StoryPreviewProps) {
  return (
    <div className="relative rounded-[6.811px] size-[28px] bg-gray-200 overflow-hidden shrink-0">
      <Image
        src={imageUrl}
        alt={alt}
        fill
        className="rounded-[6.811px] object-cover"
      />
    </div>
  );
}

