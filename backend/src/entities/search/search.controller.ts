import { Request as ExpressRequest } from "express";
import {
  Controller,
  Get,
  Post,
  Delete,
  Query,
  Body,
  Path,
  Request,
  Route,
  Tags,
  Security,
} from "tsoa";
import { extractUserId } from "../../utils/auth-helpers.js";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { SearchService } from "./search.service.js";
import { SearchQueryDto, SaveRecentSearchDto } from "./search.dto.js";
import { SearchResponse, RecentSearch } from "../../types/api.types.js";

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
   * - **services**: Search for services
   * - **tags**: Search for metadata (tags, genres, artists)
   *
   * @summary Search across users, posts, services, and tags
   * @param q Search query string
   * @param tab Search tab: "for_you", "people", "collaborations", "services", or "tags" (default: "for_you")
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
    @Query() tab?: "for_you" | "people" | "collaborations" | "services" | "tags",
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

  /**
   * Get recent searches for the authenticated user
   *
   * Returns the user's recent search history, ordered by most recent first.
   * Limited to the last 15 searches by default.
   *
   * @summary Get recent searches
   * @param limit Maximum number of results (default: 15)
   * @returns Array of recent searches
   */
  @Get("/recent")
  @Security("jwt")
  public async getRecentSearches(
    @Query() limit?: number,
    @Request() request?: ExpressRequest
  ): Promise<RecentSearch[]> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token = request!.headers.authorization?.replace("Bearer ", "") || "";

      return this.searchService.getRecentSearches(userId, limit || 15, token);
    });
  }

  /**
   * Save a recent search
   *
   * Saves a search query to the user's recent search history.
   * Automatically deduplicates identical query+tab combinations.
   *
   * @summary Save recent search
   * @param body Search details to save
   */
  @Post("/recent")
  @Security("jwt")
  public async saveRecentSearch(
    @Body() body: SaveRecentSearchDto,
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token = request!.headers.authorization?.replace("Bearer ", "") || "";

      await this.searchService.saveSearch(
        userId,
        body.query,
        body.tab,
        body.entityType,
        body.entityId,
        token
      );

      this.setStatus(204);
    });
  }

  /**
   * Delete a specific recent search
   *
   * Removes a single search entry from the user's recent search history.
   *
   * @summary Delete recent search
   * @param id The ID of the recent search to delete
   */
  @Delete("/recent/{id}")
  @Security("jwt")
  public async deleteRecentSearch(
    @Path() id: string,
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token = request!.headers.authorization?.replace("Bearer ", "") || "";

      await this.searchService.deleteRecentSearch(userId, id, token);

      this.setStatus(204);
    });
  }

  /**
   * Clear all recent searches
   *
   * Removes all search entries from the user's recent search history.
   *
   * @summary Clear all recent searches
   */
  @Delete("/recent/clear")
  @Security("jwt")
  public async clearAllRecentSearches(
    @Request() request?: ExpressRequest
  ): Promise<void> {
    return handleControllerRequest(this, async () => {
      const userId = await extractUserId(request!);
      const token = request!.headers.authorization?.replace("Bearer ", "") || "";

      await this.searchService.clearAllRecentSearches(userId, token);

      this.setStatus(204);
    });
  }
}
