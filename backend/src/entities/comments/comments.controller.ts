import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Path,
  Body,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { CommentsService } from "./comments.service.js";
import { CreateCommentDto, UpdateCommentDto } from "./comments.dto.js";
import { CommentResponse } from "../../types/api.types.js";

@Route("comments")
@Tags("Comments")
export class CommentsController extends Controller {
  private commentsService = new CommentsService();

  /**
   * Get all comments for a post
   *
   * Returns all comments on a specific post, ordered by creation date (oldest first).
   * Each comment includes the author's profile information.
   *
   * @summary Get comments for a post
   * @param postId The UUID of the post to retrieve comments for
   * @returns Array of comments with author details
   * @throws 404 if post not found
   */
  @Get("post/{postId}")
  public async getPostComments(
    @Path() postId: string
  ): Promise<CommentResponse[]> {
    return handleControllerRequest(this, async () => {
      return this.commentsService.getPostComments(postId);
    });
  }

  /**
   * Get all comments by a user
   *
   * Returns all comments created by a specific user, ordered by creation date (newest first).
   * Each comment includes the author's profile information.
   *
   * @summary Get comments by user
   * @param userId The UUID of the user to retrieve comments for
   * @returns Array of comments with author details
   */
  @Get("user/{userId}")
  public async getUserComments(
    @Path() userId: string
  ): Promise<CommentResponse[]> {
    return handleControllerRequest(this, async () => {
      return this.commentsService.getUserComments(userId);
    });
  }

  /**
   * Create a comment on a post
   *
   * Allows the authenticated user to create a comment on a post.
   * The post must exist and the comment content must be between 1 and 1000 characters.
   *
   * @summary Create a comment
   * @param body Comment data including post ID and content
   * @returns The created comment with author details
   * @throws 400 if validation fails
   * @throws 404 if post not found
   */
  @Security("bearerAuth")
  @Post("/")
  public async createComment(
    @Body() body: CreateCommentDto,
    @Request() request: ExpressRequest
  ): Promise<CommentResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.commentsService.createComment(userId, body, token);
      },
      201
    );
  }

  /**
   * Update a comment
   *
   * Allows the authenticated user to update their own comment.
   * Only the comment author can update their comment.
   *
   * @summary Update a comment
   * @param commentId The UUID of the comment to update
   * @param body Updated comment content
   * @returns The updated comment
   * @throws 400 if validation fails
   * @throws 403 if user doesn't own the comment
   * @throws 404 if comment not found
   */
  @Security("bearerAuth")
  @Put("{commentId}")
  public async updateComment(
    @Path() commentId: string,
    @Body() body: UpdateCommentDto,
    @Request() request: ExpressRequest
  ): Promise<CommentResponse> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.commentsService.updateComment(commentId, userId, body, token);
    });
  }

  /**
   * Delete a comment
   *
   * Removes a comment. Only the comment author can delete their own comment.
   *
   * @summary Delete a comment
   * @param commentId The UUID of the comment to delete
   * @returns No content on success
   * @throws 403 if user doesn't own the comment
   * @throws 404 if comment not found
   */
  @Security("bearerAuth")
  @Delete("{commentId}")
  public async deleteComment(
    @Path() commentId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.commentsService.deleteComment(commentId, userId, token);
      },
      204
    );
  }
}
