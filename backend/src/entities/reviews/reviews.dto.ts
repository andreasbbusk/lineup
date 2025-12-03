import { IsInt, IsString, IsOptional, Min, Max, Length } from "class-validator";
import { ReviewInsert } from "../../utils/supabase-helpers.js";

/**
 * DTO for creating a review
 *
 * Used when writing a review for a user.
 * The reviewer_id is automatically extracted from the authentication token.
 *
 * @example
 * {
 *   "rating": 5,
 *   "description": "Great collaborator, very professional!"
 * }
 */
export class CreateReviewDto
  implements
    Omit<ReviewInsert, "reviewer_id" | "user_id" | "created_at" | "id">
{
  /**
   * Rating from 1 to 5 stars
   * @example 5
   */
  @IsInt()
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  rating!: number;

  /**
   * Optional review description (max 500 characters)
   * @example "Great collaborator, very professional!"
   */
  @IsOptional()
  @IsString()
  @Length(0, 500, {
    message: "Description must be 500 characters or less",
  })
  description?: string | null;
}

/**
 * DTO for updating a review
 *
 * Used when editing your own review.
 *
 * @example
 * {
 *   "rating": 4,
 *   "description": "Updated review description"
 * }
 */
export class UpdateReviewDto {
  /**
   * Updated rating from 1 to 5 stars
   * @example 4
   */
  @IsOptional()
  @IsInt()
  @Min(1, { message: "Rating must be at least 1" })
  @Max(5, { message: "Rating must be at most 5" })
  rating?: number;

  /**
   * Updated review description (max 500 characters)
   * @example "Updated review description"
   */
  @IsOptional()
  @IsString()
  @Length(0, 500, {
    message: "Description must be 500 characters or less",
  })
  description?: string | null;
}
