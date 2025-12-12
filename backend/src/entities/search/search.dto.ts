import {
  IsString,
  IsOptional,
  IsEnum,
  IsArray,
  IsBoolean,
  Min,
  Max,
  IsInt,
  IsUUID,
  IsNotEmpty,
} from "class-validator";
import { LookingForType } from "../../utils/supabase-helpers.js";

/**
 * DTO for search query parameters
 *
 * Used when searching for users, posts, or tags.
 * Supports different tabs with various filters.
 *
 * @example
 * {
 *   "q": "guitarist",
 *   "tab": "people",
 *   "location": "New York",
 *   "genres": ["rock", "jazz"],
 *   "lookingFor": ["band_member"],
 *   "paidOnly": false
 * }
 */
export class SearchQueryDto {
  /**
   * Search query string
   * @example "guitarist"
   */
  @IsOptional()
  @IsString()
  q?: string;

  /**
   * Search tab: "for_you", "people", "collaborations", "services", or "tags"
   * @example "people"
   */
  @IsOptional()
  @IsEnum(["for_you", "people", "collaborations", "services", "tags"], {
    message:
      "Tab must be 'for_you', 'people', 'collaborations', 'services', or 'tags'",
  })
  tab?: "for_you" | "people" | "collaborations" | "services" | "tags" =
    "for_you";

  /**
   * Filter by location
   * @example "New York"
   */
  @IsOptional()
  @IsString()
  location?: string;

  /**
   * Filter by genres (array of genre names)
   * @example ["rock", "jazz"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  genres?: string[];

  /**
   * Filter by looking for types (for people tab)
   * @example ["band_member", "collaborator"]
   */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  lookingFor?: LookingForType[];

  /**
   * Filter for paid opportunities only (for collaborations tab)
   * @example false
   */
  @IsOptional()
  @IsBoolean()
  paidOnly?: boolean;

  /**
   * Maximum number of results to return (1-100, default: 20)
   * @example 20
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /**
   * Offset for pagination
   * @example 0
   */
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number = 0;
}

/**
 * DTO for saving a recent search
 *
 * Used when a user performs a search to save it to their history
 *
 * @example
 * {
 *   "query": "guitarist",
 *   "tab": "people",
 *   "entityType": "user",
 *   "entityId": "123e4567-e89b-12d3-a456-426614174000"
 * }
 */
export class SaveRecentSearchDto {
  /**
   * Search query string
   * @example "guitarist"
   */
  @IsNotEmpty()
  @IsString()
  query!: string;

  /**
   * Search tab where the search was performed
   * @example "people"
   */
  @IsNotEmpty()
  @IsEnum(["for_you", "people", "collaborations", "services", "tags"], {
    message:
      "Tab must be 'for_you', 'people', 'collaborations', 'services', or 'tags'",
  })
  tab!: "for_you" | "people" | "collaborations" | "services" | "tags";

  /**
   * Optional entity type if user clicked through to a specific result
   * @example "user"
   */
  @IsOptional()
  @IsString()
  entityType?: string;

  /**
   * Optional entity ID if user clicked through to a specific result
   * @example "123e4567-e89b-12d3-a456-426614174000"
   */
  @IsOptional()
  @IsUUID()
  entityId?: string;
}
