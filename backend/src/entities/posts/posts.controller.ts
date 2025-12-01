// src/entities/posts/posts.controller.ts
import {
  Controller,
  Route,
  Tags,
  Post,
  Get,
  Body,
  Request,
  Security,
  Path,
  Query,
} from "tsoa";
import { Request as ExpressRequest } from "express";
import { CreatePostBody } from "./posts.dto.js";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { PostsService } from "./posts.service.js";
import { PaginatedResponse } from "../../types/api.types.js";

@Route("posts")
@Tags("Posts")
export class PostsController extends Controller {
  private postsService = new PostsService();

  @Security("bearerAuth")
  @Post("/")
  public async createPost(
    @Body() body: CreatePostBody,
    @Request() req: ExpressRequest
  ): Promise<any> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        return this.postsService.createPost(userId, body);
      },
      201
    );
  }

  /**
   * Get a list of posts with optional filters and pagination
   * Supports filtering by type, author, location, genres, tags, and paid opportunities
   */
  @Get("/")
  public async getPosts(
    @Query() type?: "note" | "request" | "story",
    @Query() authorId?: string,
    @Query() cursor?: string,
    @Query() limit?: number,
    @Query() includeEngagement?: boolean,
    @Query() includeMedia?: boolean,
    @Query() genreIds?: string,
    @Query() tags?: string,
    @Query() location?: string,
    @Query() paidOnly?: boolean
  ): Promise<PaginatedResponse<any>> {
    return handleControllerRequest(this, async () => {
      return this.postsService.getPosts({
        type,
        authorId,
        cursor,
        limit: limit ?? 20,
        includeEngagement: includeEngagement ?? true,
        includeMedia: includeMedia ?? true,
        genreIds: genreIds ? genreIds.split(",") : undefined,
        tags: tags ? tags.split(",") : undefined,
        location,
        paidOnly,
      });
    });
  }

  /**
   * Get a single post by ID with full details
   * Optionally includes comments and engagement data
   */
  @Get("{id}")
  public async getPostById(
    @Path() id: string,
    @Query() includeComments?: boolean,
    @Query() commentsLimit?: number
  ): Promise<any> {
    return handleControllerRequest(this, async () => {
      return this.postsService.getPostById(id, {
        includeComments: includeComments ?? false,
        commentsLimit: commentsLimit ?? 10,
      });
    });
  }
}
