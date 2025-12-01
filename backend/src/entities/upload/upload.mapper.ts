import { MediaRow } from "../../utils/supabase-helpers.js";
import { UploadedFileResponse } from "../../types/api.types.js";

/**
 * Maps Supabase media row to API response format
 * Converts snake_case to camelCase
 */
export function mapMediaToResponse(media: MediaRow): UploadedFileResponse {
  return {
    id: media.id,
    url: media.url,
    thumbnailUrl: media.thumbnail_url ?? null,
    type: media.type,
    createdAt: media.created_at,
  };
}

/**
 * Maps array of Supabase media rows to API response format
 */
export function mapMediaArrayToResponse(
  mediaArray: MediaRow[]
): UploadedFileResponse[] {
  return mediaArray.map(mapMediaToResponse);
}
