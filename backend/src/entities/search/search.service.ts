import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import { SearchResponse, RecentSearch } from "../../types/api.types.js";
import { SearchQueryDto } from "./search.dto.js";
import { LookingForType } from "../../utils/supabase-helpers.js";
import {
  mapForYouResultToResponse,
  mapPeopleResultToResponse,
  mapCollaborationResultToResponse,
  mapServiceResultToResponse,
  mapTagResultToResponse,
} from "./search.mapper.js";

/**
 * Type for recent search database record
 */
type RecentSearchRecord = {
  id: string;
  user_id: string;
  search_query: string;
  search_tab: string | null;
  entity_type: string | null;
  entity_id: string | null;
  created_at: string | null;
};

export class SearchService {
  /**
   * Search for users, posts, or tags based on the specified tab
   * Returns polymorphic results based on the search tab
   */
  async search(
    userId: string | undefined,
    query: SearchQueryDto,
    token?: string
  ): Promise<SearchResponse> {
    const searchTab = query.tab || "for_you";
    const searchQuery = query.q || "";
    const limit = query.limit || 20;
    const offset = query.offset || 0;

    // For authenticated searches, use authenticated client
    const client = token ? createAuthenticatedClient(token) : supabase;

    switch (searchTab) {
      case "for_you":
        return this.searchForYou(
          userId || "",
          searchQuery,
          limit,
          offset,
          client
        );
      case "people":
        return this.searchPeople(
          userId || "",
          searchQuery,
          query.location,
          query.genres,
          query.lookingFor,
          limit,
          offset,
          client
        );
      case "collaborations":
        return this.searchCollaborations(
          userId || "",
          searchQuery,
          query.location,
          query.genres,
          query.paidOnly,
          limit,
          offset,
          client
        );
      case "services":
        return this.searchServices(searchQuery, limit, offset, client);
      case "tags":
        return this.searchTags(
          searchQuery,
          query.genres?.[0] as any,
          limit,
          offset
        );
      default:
        throw createHttpError({
          message: "Invalid search tab",
          statusCode: 400,
          code: "VALIDATION_ERROR",
        });
    }
  }

  /**
   * Search "For You" tab - personalized results or recommendations
   */
  public async searchForYou(
    userId: string,
    query: string,
    limit: number,
    offset: number,
    client: any
  ): Promise<SearchResponse> {
    const { data, error } = await client.rpc("search_for_you", {
      p_user_id: userId,
      search_query: query || null,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      throw createHttpError({
        message: `Failed to search: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    const results = (data || []).map(mapForYouResultToResponse);

    return { results };
  }

  /**
   * Search people tab - search for users
   */
  public async searchPeople(
    userId: string,
    query: string,
    location?: string,
    genres?: string[],
    lookingFor?: LookingForType[],
    limit: number = 20,
    offset: number = 0,
    client: any = supabase
  ): Promise<SearchResponse> {
    const { data, error } = await client.rpc("search_people", {
      p_user_id: userId,
      search_query: query || null,
      filter_location: location || null,
      filter_genres: genres || null,
      filter_looking_for: lookingFor || null,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      throw createHttpError({
        message: `Failed to search people: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    const results = (data || []).map(mapPeopleResultToResponse);

    return { results };
  }

  /**
   * Search collaborations tab - search for collaboration requests
   */
  public async searchCollaborations(
    userId: string,
    query: string,
    location?: string,
    genres?: string[],
    paidOnly?: boolean,
    limit: number = 20,
    offset: number = 0,
    client: any = supabase
  ): Promise<SearchResponse> {
    const { data, error } = await client.rpc("search_collaborations", {
      p_user_id: userId,
      search_query: query || null,
      filter_location: location || null,
      filter_genres: genres || null,
      filter_paid_only: paidOnly || null,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      throw createHttpError({
        message: `Failed to search collaborations: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    const results = (data || []).map(mapCollaborationResultToResponse);

    return { results };
  }

  /**
   * Search tags tab - search for metadata (tags, genres, artists)
   */
  public async searchTags(
    query: string,
    filterType?: "tag" | "genre" | "artist",
    limit: number = 20,
    offset: number = 0
  ): Promise<SearchResponse> {
    const { data, error } = await supabase.rpc("search_tags", {
      search_query: query || undefined,
      filter_type: filterType || undefined,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      throw createHttpError({
        message: `Failed to search tags: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    const results = (data || []).map(mapTagResultToResponse);

    return { results };
  }

  /**
   * Search services tab - search for services
   */
  public async searchServices(
    query: string,
    limit: number = 20,
    offset: number = 0,
    client: any = supabase
  ): Promise<SearchResponse> {
    const { data, error } = await client.rpc("search_services", {
      search_query: query || null,
      limit_count: limit,
      offset_count: offset,
    });

    if (error) {
      throw createHttpError({
        message: `Failed to search services: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    const results = (data || []).map(mapServiceResultToResponse);

    return { results };
  }

  /**
   * Get recent searches for a user
   * Returns searches ordered by most recent first
   */
  public async getRecentSearches(
    userId: string,
    limit: number = 15,
    token?: string
  ): Promise<RecentSearch[]> {
    const client = token ? createAuthenticatedClient(token) : supabase;

    const { data, error } = await client
      .from("recent_searches")
      .select(
        "id, user_id, search_query, search_tab, entity_type, entity_id, created_at"
      )
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw createHttpError({
        message: `Failed to fetch recent searches: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    return (data || []).map(this.mapRecentSearchToResponse);
  }

  /**
   * Save a recent search
   * Deduplicates by deleting existing identical query+tab combination
   */
  public async saveSearch(
    userId: string,
    searchQuery: string,
    searchTab: "for_you" | "people" | "collaborations" | "services" | "tags",
    entityType?: string,
    entityId?: string,
    token?: string
  ): Promise<void> {
    const client = token ? createAuthenticatedClient(token) : supabase;

    // Delete existing identical search to move it to top
    await this.deleteExistingSearch(userId, searchQuery, searchTab, client);

    // Insert new search record
    const { error } = await client.from("recent_searches").insert({
      user_id: userId,
      search_query: searchQuery,
      search_tab: searchTab,
      entity_type: entityType || null,
      entity_id: entityId || null,
    });

    if (error) {
      throw createHttpError({
        message: `Failed to save recent search: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }

  /**
   * Delete a specific recent search by ID
   */
  public async deleteRecentSearch(
    userId: string,
    searchId: string,
    token?: string
  ): Promise<void> {
    const client = token ? createAuthenticatedClient(token) : supabase;

    const { error } = await client
      .from("recent_searches")
      .delete()
      .eq("id", searchId)
      .eq("user_id", userId);

    if (error) {
      throw createHttpError({
        message: `Failed to delete recent search: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }

  /**
   * Clear all recent searches for a user
   */
  public async clearAllRecentSearches(
    userId: string,
    token?: string
  ): Promise<void> {
    const client = token ? createAuthenticatedClient(token) : supabase;

    const { error } = await client
      .from("recent_searches")
      .delete()
      .eq("user_id", userId);

    if (error) {
      throw createHttpError({
        message: `Failed to clear recent searches: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }
  }

  /**
   * Private helper to delete existing search with same query+tab
   * Used for deduplication when saving new search
   */
  private async deleteExistingSearch(
    userId: string,
    searchQuery: string,
    searchTab: string,
    client: any
  ): Promise<void> {
    const { error } = await client
      .from("recent_searches")
      .delete()
      .eq("user_id", userId)
      .eq("search_query", searchQuery)
      .eq("search_tab", searchTab);

    if (error) {
      // Log but don't throw - this is a non-critical operation
      console.error("Failed to delete existing search:", error.message);
    }
  }

  /**
   * Map database record to API response format
   */
  private mapRecentSearchToResponse(record: RecentSearchRecord): RecentSearch {
    return {
      id: record.id,
      userId: record.user_id,
      searchQuery: record.search_query,
      searchTab: (record.search_tab as any) || "for_you",
      entityType: record.entity_type || undefined,
      entityId: record.entity_id || undefined,
      createdAt: record.created_at || new Date().toISOString(),
    };
  }
}
