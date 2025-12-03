import { Request as ExpressRequest } from "express";
import {
  Controller,
  Post,
  Delete,
  Path,
  Route,
  Security,
  Tags,
  Request,
  Body,
} from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { UploadService } from "./upload.service.js";
import { SignedUrlResponse } from "../../types/api.types.js";
import { SignedUrlRequestDto } from "./upload.dto.js";

@Route("upload")
@Tags("Upload")
export class UploadController extends Controller {
  private uploadService = new UploadService();

  /**
   * Generate a signed upload URL for direct client uploads
   *
   * Returns a temporary signed URL that allows clients to upload files directly
   * to Supabase Storage, bypassing the backend. This improves scalability by
   * avoiding large file buffers in the Node.js server.
   *
   * The client should:
   * 1. Call this endpoint to get a signed URL
   * 2. Upload the file directly to the signed URL using fetch/PUT
   * 3. Use the returned filePath to construct the public URL
   * 4. Include the public URL when creating posts or updating avatars
   *
   * - **Images**: JPEG, PNG, GIF, WebP
   * - **Videos**: MP4, WebM, QuickTime
   * - **Upload Types**: "post" (default) for post media, "avatar" for profile pictures
   *
   * @summary Generate signed upload URL
   * @param body Request body containing fileName, fileType, and optional uploadType
   * @returns Signed URL and file path for direct client upload
   * @throws 400 if validation fails (invalid file type)
   * @throws 401 if not authenticated
   * @throws 500 if signed URL generation fails
   */
  @Security("bearerAuth")
  @Post("/signed-url")
  public async generateSignedUploadUrl(
    @Body() body: SignedUrlRequestDto,
    @Request() request: ExpressRequest
  ): Promise<SignedUrlResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.uploadService.generateSignedUploadUrl(
          userId,
          body.fileName,
          body.fileType,
          body.uploadType || "post",
          token
        );
      },
      200
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
