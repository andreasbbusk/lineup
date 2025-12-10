import {
  ForYouSearchResult,
  UserSearchResult,
  CollaborationSearchResult,
  ServiceSearchResult,
  TagSearchResult,
} from "../../types/api.types.js";

/**
 * Type for search_for_you RPC function result
 */
type SearchForYouResult = {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string;
  avatar_url: string | null;
  match_reason: string;
  additional_info: any;
  relevance: number;
};

/**
 * Type for search_people RPC function result
 */
type SearchPeopleResult = {
  id: string;
  username: string | null;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string | null;
  genres: any;
  looking_for: string[] | null;
  is_connected: boolean;
  relevance: number;
};

/**
 * Type for search_collaborations RPC function result
 */
type SearchCollaborationsResult = {
  id: string;
  title: string | null;
  description: string;
  author_id: string;
  author_username: string | null;
  author_avatar_url: string | null;
  location: string | null;
  paid_opportunity: boolean;
  genres: any;
  created_at: string;
  relevance: number;
};

/**
 * Type for search_tags RPC function result
 */
type SearchTagsResult = {
  id: string;
  name: string;
  type: string;
  usage_count: number;
  relevance: number;
};

/**
 * Type for search_services RPC function result
 */
type SearchServicesResult = {
  id: string;
  title: string;
  description: string;
  service_type: string | null;
  relevance: number;
};

/**
 * Maps search_for_you RPC result to API format
 */
export function mapForYouResultToResponse(
  item: SearchForYouResult
): ForYouSearchResult {
  return {
    type: "for_you",
    entityType: item.entity_type as "user" | "collaboration",
    entityId: item.entity_id,
    title: item.title,
    subtitle: item.subtitle,
    avatarUrl: item.avatar_url ?? null,
    matchReason: item.match_reason,
    additionalInfo: item.additional_info,
    relevance: item.relevance,
  };
}

/**
 * Maps search_people RPC result to API format
 */
export function mapPeopleResultToResponse(
  item: SearchPeopleResult
): UserSearchResult {
  return {
    type: "user",
    id: item.id,
    username: item.username || "",
    firstName: item.first_name || "",
    lastName: item.last_name || "",
    avatarUrl: item.avatar_url ?? null,
    bio: item.bio ?? null,
    location: item.location ?? null,
    genres: item.genres,
    lookingFor: item.looking_for || [],
    isConnected: item.is_connected || false,
    relevance: item.relevance,
  };
}

/**
 * Maps search_collaborations RPC result to API format
 */
export function mapCollaborationResultToResponse(
  item: SearchCollaborationsResult
): CollaborationSearchResult {
  return {
    type: "collaboration",
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    authorId: item.author_id,
    authorUsername: item.author_username || "",
    authorAvatarUrl: item.author_avatar_url ?? null,
    location: item.location ?? null,
    paidOpportunity: item.paid_opportunity || false,
    genres: item.genres,
    createdAt: item.created_at || new Date().toISOString(),
    relevance: item.relevance,
  };
}

/**
 * Maps search_tags RPC result to API format
 */
export function mapTagResultToResponse(
  item: SearchTagsResult
): TagSearchResult {
  return {
    type: item.type as "tag" | "genre" | "artist",
    id: item.id,
    name: item.name,
    usageCount: item.usage_count || 0,
    relevance: item.relevance,
  };
}

/**
 * Maps search_services RPC result to API format
 */
export function mapServiceResultToResponse(
  item: SearchServicesResult
): ServiceSearchResult {
  return {
    type: "service",
    id: item.id,
    title: item.title || "",
    description: item.description || "",
    serviceType: item.service_type ?? null,
    relevance: item.relevance,
  };
}
