import { Request as ExpressRequest } from "express";
import { Controller, Get, Query, Request, Route, Tags } from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { SearchService } from "./search.service.js";
import { SearchQueryDto } from "./search.dto.js";
import { SearchResponse } from "../../types/api.types.js";

@Route("search")
@Tags("Search")
export class SearchController extends Controller {
  private searchService = new SearchService();

  /**
   * Search for users, posts, or tags
   *
   * Performs a search across different entity types based on the specified tab.
   * Returns polymorphic results that vary by tab type.
   *
   * - **for_you**: Personalized results combining people and collaboration requests
   * - **people**: Search for users with filters (location, genres, looking for)
   * - **collaborations**: Search for collaboration request posts
   * - **tags**: Search for metadata (tags, genres, artists)
   *
   * @summary Search across users, posts, and tags
   * @param q Search query string
   * @param tab Search tab: "for_you", "people", "collaborations", or "tags" (default: "for_you")
   * @param location Filter by location
   * @param genres Filter by genres (array)
   * @param lookingFor Filter by looking for types (for people tab)
   * @param paidOnly Filter for paid opportunities only (for collaborations tab)
   * @param limit Maximum number of results (1-100, default: 20)
   * @param offset Offset for pagination (default: 0)
   * @returns Search results based on the selected tab
   */
  @Get("/")
  public async search(
    @Query() q?: string,
    @Query() tab?: "for_you" | "people" | "collaborations" | "tags",
    @Query() location?: string,
    @Query() genres?: string[],
    @Query() lookingFor?: string[],
    @Query() paidOnly?: boolean,
    @Query() limit?: number,
    @Query() offset?: number,
    @Request() request?: ExpressRequest
  ): Promise<SearchResponse> {
    return handleControllerRequest(this, async () => {
      // Try to extract userId if authenticated, but search can work without auth
      let userId: string | undefined;
      let token: string | undefined;

      try {
        if (request?.headers.authorization) {
          userId = await extractUserId(request);
          token = request.headers.authorization?.replace("Bearer ", "") || "";
        }
      } catch {
        // Not authenticated, continue with public search
      }

      const searchQuery: SearchQueryDto = {
        q,
        tab: tab || "for_you",
        location,
        genres,
        lookingFor: lookingFor as any,
        paidOnly,
        limit: limit || 20,
        offset: offset || 0,
      };

      return this.searchService.search(userId, searchQuery, token);
    });
  }
}
