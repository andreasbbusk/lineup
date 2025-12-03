// src/entities/posts/posts.controller.ts
import { Controller, Route, Tags, Post, Body, Request, Security } from "tsoa";
import { Request as ExpressRequest } from "express";
import { CreatePostBody } from "./posts.dto.js";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { PostsService } from "./posts.service.js";
import { PostResponse } from "../../types/api.types.js";

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
        return this.postsService.createPost(userId, body);
      },
      201
    );
  }
}
