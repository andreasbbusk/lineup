// src/controllers/upload.service.ts
import { supabase } from "../config/supabase.js";
import { MediaType } from "../utils/supabase-helpers.js";

export interface UploadedFile {
  url: string;
  thumbnail_url?: string;
  type: "image" | "video";
  size?: number;
}

export interface UploadResult {
  files: UploadedFile[];
}

/**
 * Upload files to Supabase Storage
 * Handles both images and videos, with optional thumbnail generation for videos
 */
export class UploadService {
  private readonly MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  private readonly BUCKET_NAME = "posts"; // Based on docs, storage is in "posts" bucket

  /**
   * Upload a single file to Supabase Storage
   * Returns the public URL and optional thumbnail URL
   */
  async uploadFile(
    file: Express.Multer.File,
    userId: string
  ): Promise<UploadedFile> {
    // Validate file size
    if (file.size > this.MAX_FILE_SIZE) {
      throw new Error(
        `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / 1024 / 1024}MB`
      );
    }

    // Determine file type from mimetype
    const isImage = file.mimetype.startsWith("image/");
    const isVideo = file.mimetype.startsWith("video/");

    if (!isImage && !isVideo) {
      throw new Error("File must be an image or video");
    }

    const fileType: MediaType = isImage ? "image" : "video";

    // Generate a unique filename
    const fileExt = file.originalname.split(".").pop() || "";
    const fileName = `${userId}/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.${fileExt}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(this.BUCKET_NAME)
      .upload(fileName, file.buffer, {
        contentType: file.mimetype,
        upsert: false,
      });

    if (uploadError || !uploadData) {
      throw new Error(`Failed to upload file: ${uploadError?.message}`);
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from(this.BUCKET_NAME).getPublicUrl(fileName);

    const result: UploadedFile = {
      url: publicUrl,
      type: fileType,
      size: file.size,
    };

    // For videos, we could generate thumbnails here if needed
    // For now, we'll just return the video URL
    // Thumbnail generation would require additional processing

    return result;
  }

  /**
   * Upload multiple files (batch upload)
   * Supports up to 4 files as per requirements
   */
  async uploadFiles(
    files: Express.Multer.File[],
    userId: string
  ): Promise<UploadResult> {
    // Validate file count
    if (files.length > 4) {
      throw new Error("Maximum 4 files allowed per upload");
    }

    if (files.length === 0) {
      throw new Error("At least one file is required");
    }

    // Upload all files in parallel
    const uploadPromises = files.map((file) => this.uploadFile(file, userId));
    const uploadedFiles = await Promise.all(uploadPromises);

    return {
      files: uploadedFiles,
    };
  }
}

