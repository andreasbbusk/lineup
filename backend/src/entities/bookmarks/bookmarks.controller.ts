import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Delete,
  Path,
  Body,
  Request,
  Route,
  Security,
  Tags,
} from "tsoa";
import { extractUserId } from "../../entities/auth/auth.service.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { BookmarksService } from "./bookmarks.service.js";
import { CreateBookmarkDto } from "./bookmarks.dto.js";
import { BookmarkResponse } from "../../types/api.types.js";

@Route("bookmarks")
@Tags("Bookmarks")
export class BookmarksController extends Controller {
  private bookmarksService = new BookmarksService();

  /**
   * Get all bookmarks for the authenticated user
   *
   * Returns a list of all bookmarks created by the authenticated user.
   * Each bookmark includes the post details and author information.
   *
   * @summary Get user's bookmarks
   * @returns Array of bookmarks with post details
   */
  @Security("bearerAuth")
  @Get("/")
  public async getBookmarks(
    @Request() request: ExpressRequest
  ): Promise<BookmarkResponse[]> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request);
      const token = request.headers.authorization?.replace("Bearer ", "") || "";

      return this.bookmarksService.getUserBookmarks(userId, token);
    });
  }

  /**
   * Create a bookmark for a post
   *
   * Allows the authenticated user to bookmark a post for later reference.
   * The post must exist and must not already be bookmarked by the user.
   *
   * @summary Create a bookmark
   * @param body The bookmark data containing the post ID to bookmark
   * @returns The created bookmark
   * @throws 404 if the post does not exist
   * @throws 409 if the post is already bookmarked
   */
  @Security("bearerAuth")
  @Post("/")
  public async createBookmark(
    @Body() body: CreateBookmarkDto,
    @Request() request: ExpressRequest
  ): Promise<BookmarkResponse> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.bookmarksService.createBookmark(
          userId,
          body.post_id,
          token
        );
      },
      201
    );
  }

  /**
   * Remove a bookmark
   *
   * Deletes a bookmark for a specific post. Only the user who created
   * the bookmark can remove it.
   *
   * @summary Delete a bookmark
   * @param postId The UUID of the post to unbookmark
   * @returns No content on success
   * @throws 404 if the bookmark does not exist or does not belong to the user
   */
  @Security("bearerAuth")
  @Delete("{postId}")
  public async deleteBookmark(
    @Path() postId: string,
    @Request() request: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(
      this,
      async () => {
        const userId = await extractUserId(request);
        const token =
          request.headers.authorization?.replace("Bearer ", "") || "";

        return this.bookmarksService.deleteBookmark(userId, postId, token);
      },
      204
    );
  }
}
