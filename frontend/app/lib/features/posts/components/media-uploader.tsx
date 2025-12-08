"use client";

import { useRef, useState } from "react";
import { useUpload } from "../hooks/use-upload";
import { MediaPreview } from "./media-preview";
import { Button } from "@/app/components/buttons";
import type { UploadedMedia } from "../types";

interface MediaUploaderProps {
  media: UploadedMedia[];
  onMediaChange: (media: UploadedMedia[]) => void;
  maxFiles?: number;
  maxFileSizeMB?: number;
}

export function MediaUploader({
  media,
  onMediaChange,
  maxFiles = 4,
  maxFileSizeMB = 50,
}: MediaUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { createPreviewMedia, cleanupMedia, isUploading, error } = useUpload();
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    
    if (files.length === 0) return;

    // Validate file count
    if (media.length + files.length > maxFiles) {
      setUploadErrors([
        `You can only upload up to ${maxFiles} files total.`,
      ]);
      return;
    }

    // Validate file sizes and types
    const validFiles: File[] = [];
    const errors: string[] = [];

    for (const file of files) {
      // Check file size
      if (file.size > maxFileSizeMB * 1024 * 1024) {
        errors.push(`${file.name} exceeds ${maxFileSizeMB}MB limit`);
        continue;
      }

      // Check file type
      const isValidType =
        file.type.startsWith("image/") || file.type.startsWith("video/");
      if (!isValidType) {
        errors.push(`${file.name} is not a valid image or video`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setUploadErrors(errors);
      return;
    }

    setUploadErrors([]);

    // Create preview media (no upload to Supabase yet)
    try {
      const previewMedia = validFiles.map((file) => createPreviewMedia(file));
      onMediaChange([...media, ...previewMedia]);
    } catch (err) {
      setUploadErrors([
        err instanceof Error ? err.message : "Failed to create preview",
      ]);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemove = async (index: number) => {
    const mediaToRemove = media[index];
    const newMedia = media.filter((_, i) => i !== index);
    onMediaChange(newMedia);
    
    // Clean up blob URL and optionally delete from Supabase
    if (mediaToRemove) {
      await cleanupMedia([mediaToRemove], !!mediaToRemove.filePath);
    }
  };

  return (
    <div className="space-y-3">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFileSelect}
        className="hidden"
        disabled={isUploading || media.length >= maxFiles}
      />

      <Button
        type="button"
        variant="secondary"
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading || media.length >= maxFiles}
      >
        {isUploading ? "Uploading..." : "+ Add Media"}
      </Button>

      {uploadErrors.length > 0 && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {uploadErrors.map((error, i) => (
            <p key={i}>{error}</p>
          ))}
        </div>
      )}

      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error.message}
        </div>
      )}

      {media.length > 0 && (
        <MediaPreview media={media} onRemove={handleRemove} maxItems={maxFiles} />
      )}

      {media.length > 0 && (
        <p className="text-sm text-gray-500">
          {media.length} / {maxFiles} files
        </p>
      )}
    </div>
  );
}

