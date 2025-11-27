import { Request as ExpressRequest } from "express";
import { Controller, Get, Query, Request, Route, Security, Tags } from "tsoa";
import { extractUserId } from "../../entities/auth/auth.service.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { FeedService } from "./feed.service.js";
import { FeedPostResponse } from "../../types/api.types.js";

@Route("feed")
@Tags("Feed")
export class FeedController extends Controller {
  private feedService = new FeedService();

  /**
   * Get home feed
   *
   * Returns feed content based on the specified component:
   * - "posts": Posts from users you follow (with pagination)
   * - "recommendations": Collaboration request recommendations
   * - "stories": Stories from followed users (coming soon)
   *
   * Posts feed includes engagement data (likes, comments, bookmarks counts)
   * and user interaction state (hasLiked, hasBookmarked).
   *
   * @summary Get home feed
   * @param component The feed component to fetch (default: "posts")
   * @param cursor Cursor for pagination (ISO timestamp)
   * @param limit Maximum number of items to return (1-50, default: 20)
   * @returns Feed posts with pagination cursor, or recommendations array
   * @throws 401 if not authenticated
   */
  @Security("bearerAuth")
  @Get("/")
  public async getFeed(
    @Query() component?: "posts" | "recommendations" | "stories",
    @Query() cursor?: string,
    @Query() limit?: number,
    @Request() request?: ExpressRequest
  ): Promise<
    | { posts: FeedPostResponse[]; nextCursor?: string }
    | { recommendations: FeedPostResponse[] }
    | { stories: any[] }
  > {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token =
        request!.headers.authorization?.replace("Bearer ", "") || "";

      const feedComponent = component || "posts";
      const feedLimit = limit || 20;

      if (feedComponent === "recommendations") {
        const recommendations = await this.feedService.getRecommendations(
          userId,
          token,
          feedLimit
        );
        return { recommendations };
      }

      if (feedComponent === "stories") {
        // Stories feature coming soon
        return { stories: [] };
      }

      // Default: posts feed
      return this.feedService.getPostsFeed(userId, token, cursor, feedLimit);
    });
  }
}
