"use client";

import imageCompression from "browser-image-compression";

/**
 * Compression configuration for different upload types
 */
export interface CompressionOptions {
  maxSizeMB: number;
  maxWidthOrHeight: number;
  useWebWorker: boolean;
  quality?: number; // 0-1, only for JPEG/WebP
  fileType?: string; // Target file type (e.g., 'image/jpeg', 'image/webp')
}

/**
 * Default compression options for post images
 */
const DEFAULT_POST_IMAGE_OPTIONS: CompressionOptions = {
  maxSizeMB: 2, // Target 2MB max
  maxWidthOrHeight: 1920, // Max dimension
  useWebWorker: true,
  quality: 0.8, // 80% quality
  fileType: "image/jpeg", // Convert to JPEG for better compression
};

/**
 * Default compression options for avatar images
 */
const DEFAULT_AVATAR_OPTIONS: CompressionOptions = {
  maxSizeMB: 0.5, // Target 500KB max
  maxWidthOrHeight: 800, // Max dimension (will be cropped to square anyway)
  useWebWorker: true,
  quality: 0.85,
  fileType: "image/jpeg",
};

/**
 * Compress an image file
 * 
 * @param file - Original image file
 * @param options - Compression options
 * @param onProgress - Optional progress callback (0-100)
 * @returns Compressed File object
 */
export async function compressImage(
  file: File,
  options: Partial<CompressionOptions> = {},
  onProgress?: (progress: number) => void
): Promise<File> {
  // Determine compression options based on file type
  const isAvatar = options.maxSizeMB === DEFAULT_AVATAR_OPTIONS.maxSizeMB;
  const defaultOptions = isAvatar ? DEFAULT_AVATAR_OPTIONS : DEFAULT_POST_IMAGE_OPTIONS;
  
  const compressionOptions = {
    maxSizeMB: options.maxSizeMB ?? defaultOptions.maxSizeMB,
    maxWidthOrHeight: options.maxWidthOrHeight ?? defaultOptions.maxWidthOrHeight,
    useWebWorker: options.useWebWorker ?? defaultOptions.useWebWorker,
    fileType: options.fileType ?? defaultOptions.fileType,
    initialQuality: options.quality ?? defaultOptions.quality,
    // Progress callback
    onProgress: onProgress ? (percent: number) => onProgress(percent) : undefined,
  };

  try {
    const compressedFile = await imageCompression(file, compressionOptions);
    
    // Log compression results
    const originalSizeMB = (file.size / (1024 * 1024)).toFixed(2);
    const compressedSizeMB = (compressedFile.size / (1024 * 1024)).toFixed(2);
    const reduction = ((1 - compressedFile.size / file.size) * 100).toFixed(1);
    
    console.log(`Image compressed: ${originalSizeMB}MB → ${compressedSizeMB}MB (${reduction}% reduction)`);
    
    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    // Return original file if compression fails
    return file;
  }
}

/**
 * Compress a video file
 * 
 * Note: Browser video compression is limited. For now, we only compress videos
 * that are larger than the threshold by using a simpler approach.
 * For better results, consider ffmpeg.wasm in the future.
 * 
 * @param file - Original video file
 * @param onProgress - Optional progress callback (0-100)
 * @returns Compressed File object or original if compression not needed/fails
 */
export async function compressVideo(
  file: File,
  onProgress?: (progress: number) => void
): Promise<File> {
  // Video compression not yet implemented
  // For now, just return the original file
  console.log("Video compression not yet implemented");
  onProgress?.(100);
  return file;
}

/**
 * Compress media file (image or video) based on type
 * 
 * @param file - Original file
 * @param uploadType - "post" or "avatar"
 * @param onProgress - Optional progress callback
 * @returns Compressed File object
 */
export async function compressMedia(
  file: File,
  uploadType: "post" | "avatar" = "post",
  onProgress?: (progress: number) => void
): Promise<File> {
  const isImage = file.type.startsWith("image/");
  
  if (isImage) {
    const options: Partial<CompressionOptions> =
      uploadType === "avatar"
        ? DEFAULT_AVATAR_OPTIONS
        : DEFAULT_POST_IMAGE_OPTIONS;
    return compressImage(file, options, onProgress);
  } else {
    return compressVideo(file, onProgress);
  }
}

/**
 * Check if a file should be compressed
 * 
 * @param file - File to check
 * @param uploadType - "post" or "avatar"
 * @returns true if file should be compressed
 */
export function shouldCompress(file: File, uploadType: "post" | "avatar" = "post"): boolean {
  const isImage = file.type.startsWith("image/");
  
  if (isImage) {
    // Always compress images (they're usually compressible)
    return true;
  } else {
    // Videos are not compressed yet
    return false;
  }
}

