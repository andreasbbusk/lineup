import { IsOptional, IsEnum, IsString, IsInt, Min, Max } from "class-validator";
import { ServiceType } from "../../utils/supabase-helpers.js";

const SERVICE_TYPES = [
  "rehearsal_space",
  "studio",
  "recording",
  "art",
  "venue",
  "teaching",
  "equipment_rental",
] as const;

/**
 * DTO for querying services
 *
 * Used when listing services with optional filters.
 * Supports filtering by service type and location.
 *
 * @example
 * {
 *   "serviceType": "recording",
 *   "location": "Copenhagen",
 *   "limit": 50
 * }
 */
export class ServicesQueryDto {
  /**
   * Filter by service type
   * @example "recording"
   */
  @IsOptional()
  @IsEnum(SERVICE_TYPES, {
    message: `Service type must be one of: ${SERVICE_TYPES.join(", ")}`,
  })
  serviceType?: ServiceType;

  /**
   * Filter by location (case-insensitive partial match)
   * @example "Copenhagen"
   */
  @IsOptional()
  @IsString()
  location?: string;

  /**
   * Maximum number of services to return (1-100, default: 100)
   * @example 50
   */
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 100;
}
