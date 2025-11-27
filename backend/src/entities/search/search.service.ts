import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  SearchResponse,
  UserSearchResult,
  CollaborationSearchResult,
  TagSearchResult,
  ForYouSearchResult,
} from "../../types/api.types.js";
import { SearchQueryDto } from "./search.dto.js";
import { LookingForType } from "../../utils/supabase-helpers.js";

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

    const results: ForYouSearchResult[] = (data || []).map((item: any) => ({
      type: "for_you",
      entityType: item.entity_type as "user" | "collaboration",
      entityId: item.entity_id,
      title: item.title,
      subtitle: item.subtitle,
      avatarUrl: item.avatar_url ?? undefined,
      matchReason: item.match_reason,
      additionalInfo: item.additional_info,
      relevance: item.relevance,
    }));

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

    const results: UserSearchResult[] = (data || []).map((item: any) => ({
      type: "user",
      id: item.id,
      username: item.username || "",
      firstName: item.first_name || "",
      lastName: item.last_name || "",
      avatarUrl: item.avatar_url ?? undefined,
      bio: item.bio ?? undefined,
      location: item.location ?? undefined,
      genres: item.genres,
      lookingFor: item.looking_for || [],
      isConnected: item.is_connected || false,
      relevance: item.relevance,
    }));

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

    const results: CollaborationSearchResult[] = (data || []).map(
      (item: any) => ({
        type: "collaboration",
        id: item.id,
        title: item.title || "",
        description: item.description || "",
        authorId: item.author_id,
        authorUsername: item.author_username || "",
        authorAvatarUrl: item.author_avatar_url ?? undefined,
        location: item.location ?? undefined,
        paidOpportunity: item.paid_opportunity || false,
        genres: item.genres,
        createdAt: item.created_at || new Date().toISOString(),
        relevance: item.relevance,
      })
    );

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

    const results: TagSearchResult[] = (data || []).map((item: any) => ({
      type: item.type as "tag" | "genre" | "artist",
      id: item.id,
      name: item.name,
      usageCount: item.usage_count || 0,
      relevance: item.relevance,
    }));

    return { results };
  }
}
