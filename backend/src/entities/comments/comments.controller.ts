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
   * Each comment includes the author's profile information and like counts.
   * If authenticated, also includes whether the user has liked each comment.
   *
   * @summary Get comments for a post
   * @param postId The UUID of the post to retrieve comments for
   * @returns Array of comments with author details and like data
   * @throws 404 if post not found
   */
  @Get("post/{postId}")
  public async getPostComments(
    @Path() postId: string,
    @Request() req: ExpressRequest
  ): Promise<CommentResponse[]> {
    return handleControllerRequest(this, async () => {
      let userId: string | undefined;
      const token = req.headers.authorization?.replace("Bearer ", "");
      
      // Try to extract userId if token is present, but don't fail if not authenticated
      if (token) {
        try {
          userId = await extractUserId(req);
        } catch {
          // User not authenticated, continue without userId
          userId = undefined;
        }
      }
      
      return this.commentsService.getPostComments(postId, userId, token);
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

  /**
   * Like a comment
   *
   * Adds a like from the authenticated user to the specified comment.
   * If the comment is already liked by the user, this is a no-op.
   *
   * @summary Like a comment
   * @param commentId The UUID of the comment to like
   * @returns No content on success
   * @throws 404 if comment not found
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Post("{commentId}/like")
  public async likeComment(
    @Path() commentId: string,
    @Request() req: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        const token = req.headers.authorization?.replace("Bearer ", "") || "";
        return this.commentsService.likeComment(userId, commentId, token);
      },
      204
    );
  }

  /**
   * Unlike a comment
   *
   * Removes the like from the authenticated user for the specified comment.
   *
   * @summary Unlike a comment
   * @param commentId The UUID of the comment to unlike
   * @returns No content on success
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Delete("{commentId}/like")
  public async unlikeComment(
    @Path() commentId: string,
    @Request() req: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(req);
        const token = req.headers.authorization?.replace("Bearer ", "") || "";
        return this.commentsService.unlikeComment(userId, commentId, token);
      },
      204
    );
  }
}
