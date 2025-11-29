// src/entities/posts/posts.controller.ts
import { Controller, Route, Tags, Post, Body, Request, Security } from "tsoa";
import { Request as ExpressRequest } from "express";
import { CreatePostBody } from "./posts.dto.js";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { PostsService } from "./posts.service.js";

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
}
