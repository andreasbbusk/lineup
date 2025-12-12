import type { components } from "@/app/modules/types/api";

// Re-export from global API for convenience
export type {
  PostResponse,
  CreatePostBody,
  PostsQueryParams,
  PaginatedResponse,
} from "@/app/modules/api/postsApi";

export type {
  SignedUrlResponse,
  SignedUrlRequest,
  UploadedMedia,
} from "@/app/modules/api/uploadApi";

// Re-export API types
export type MediaItemDto = components["schemas"]["MediaItemDto"];
