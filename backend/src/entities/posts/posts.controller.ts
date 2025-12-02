// src/entities/posts/posts.controller.ts
import { Controller, Route, Tags, Post, Get, Body, Query, Request, Security } from "tsoa";
import { Request as ExpressRequest } from "express";
import { CreatePostBody, PostsQueryDto } from "./posts.dto.js";
import { extractUserId, extractBearerToken } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { PostsService } from "./posts.service.js";
import { PostResponse, PaginatedResponse } from "../../types/api.types.js";

@Route("posts")
@Tags("Posts")
export class PostsController extends Controller {
  private postsService = new PostsService();

  /**
   * Create a new post
   *
   * Creates a new post (note, request, or story) with optional metadata, media,
   * and tagged users. The post is automatically associated with the authenticated user.
   *
   * For "note" type posts, you can include tags.
   * For "request" type posts, you can include genres and paid_opportunity flag.
   * All post types can include media and tagged users.
   *
   * @summary Create a post
   * @param body The post data including type, title, description, and optional fields
   * @returns The created post with all related data (metadata, media, tagged users, author)
   * @throws 400 if validation fails
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Post("/")
  public async createPost(
    @Body() body: CreatePostBody,
    @Request() req: ExpressRequest
  ): Promise<PostResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        const token = extractBearerToken(req);
        return this.postsService.createPost(userId, body, token);
      },
      201
    );
  }

  /**
   * List posts with filters and pagination
   *
   * Returns a paginated list of posts with optional filters.
   * Supports filtering by type, author, location, genres, tags, and paid opportunities.
   * Can optionally include engagement data (requires authentication).
   *
   * Posts are public and can be viewed without authentication, but engagement data
   * (likes, comments, bookmarks) requires authentication.
   *
   * @summary List posts
   * @param type Filter by post type: "note", "request", or "story"
   * @param authorId Filter by author user ID
   * @param cursor Cursor for pagination (ISO timestamp)
   * @param limit Maximum number of posts to return (1-100, default: 20)
   * @param includeEngagement Whether to include engagement data (requires auth)
   * @param includeMedia Whether to include media in the response
   * @param genreIds Filter by genre IDs (array)
   * @param tags Filter by tag names (array)
   * @param location Filter by location
   * @param paidOnly Filter for paid opportunities only
   * @returns Paginated list of posts
   */
  @Get("/")
  public async listPosts(
    @Query() type?: "note" | "request" | "story",
    @Query() authorId?: string,
    @Query() cursor?: string,
    @Query() limit?: number,
    @Query() includeEngagement?: boolean,
    @Query() includeMedia?: boolean,
    @Query() genreIds?: string[],
    @Query() tags?: string[],
    @Query() location?: string,
    @Query() paidOnly?: boolean,
    @Request() req?: ExpressRequest
  ): Promise<PaginatedResponse<PostResponse>> {
    return handleControllerRequest(
      this,
      async () => {
        // Try to extract userId and token if authenticated, but posts are public
        let userId: string | undefined;
        let token: string | undefined;

        try {
          if (req?.headers.authorization) {
            userId = await extractUserId(req);
            token = extractBearerToken(req);
          }
        } catch {
          // Not authenticated, continue with public access
        }

        const query: PostsQueryDto = {
          type,
          authorId,
          cursor,
          limit: limit || 20,
          includeEngagement: includeEngagement || false,
          includeMedia: includeMedia !== false, // Default to true
          genreIds,
          tags,
          location,
          paidOnly,
        };

        return this.postsService.listPosts(query, userId, token);
      },
      200
    );
  }
}
