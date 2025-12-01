import { Request as ExpressRequest } from "express";
import {
  Controller,
  Post,
  Delete,
  Path,
  Route,
  Security,
  Tags,
  UploadedFiles,
  FormField,
  Request,
} from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { UploadService } from "./upload.service.js";
import { UploadResponse } from "../../types/api.types.js";

@Route("upload")
@Tags("Upload")
export class UploadController extends Controller {
  private uploadService = new UploadService();

  /**
   * Upload files (images or videos) for posts or avatars
   *
   * Supports batch upload of up to 4 files.
   * Files are uploaded to Supabase Storage and media records are created in the database.
   *
   * - **Images**: JPEG, PNG, GIF, WebP (max 50MB each)
   * - **Videos**: MP4, WebM, QuickTime (max 50MB each)
   * - **Thumbnails**: Can be generated for videos if requested
   *
   * @summary Upload files
   * @param files Array of files to upload (multipart/form-data)
   * @param type Upload type: "post" for post media, "avatar" for profile pictures
   * @param generateThumbnails Whether to generate thumbnails for videos (default: false)
   * @returns Array of uploaded file records with URLs
   * @throws 400 if validation fails (file size, type, count)
   * @throws 401 if not authenticated
   * @throws 500 if upload or database operation fails
   */
  @Security("bearerAuth")
  @Post("/")
  public async uploadFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @FormField() type: "post" | "avatar",
    @FormField() generateThumbnails: boolean = false,
    @Request() request: ExpressRequest
  ): Promise<UploadResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.uploadService.uploadFiles(
          userId,
          files || [],
          type,
          generateThumbnails || false,
          token
        );
      },
      201
    );
  }
}

@Route("media")
@Tags("Upload")
export class MediaController extends Controller {
  private uploadService = new UploadService();

  /**
   * Delete a media file
   *
   * Removes the file from Supabase Storage and deletes the media record from the database.
   * Only authenticated users can delete media.
   *
   * @summary Delete media
   * @param mediaId The UUID of the media to delete
   * @returns No content on success
   * @throws 401 if not authenticated
   * @throws 404 if media not found
   * @throws 500 if deletion fails
   */
  @Security("bearerAuth")
  @Delete("{mediaId}")
  public async deleteMedia(
    @Path() mediaId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.uploadService.deleteMedia(mediaId, userId, token);
      },
      204
    );
  }
}
