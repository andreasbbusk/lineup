import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import { SearchResponse } from "../../types/api.types.js";
import { SearchQueryDto } from "./search.dto.js";
import { LookingForType } from "../../utils/supabase-helpers.js";
import {
  mapForYouResultToResponse,
  mapPeopleResultToResponse,
  mapCollaborationResultToResponse,
  mapTagResultToResponse,
} from "./search.mapper.js";

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
   * Search "For You" tab - personalized results
   */
  private async searchForYou(
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
  private async searchPeople(
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
  private async searchCollaborations(
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
  private async searchTags(
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
}
