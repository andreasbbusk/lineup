import { IsString, IsUUID, IsOptional, Length } from "class-validator";

/**
 * DTO for creating a collaboration
 *
 * Represents a past collaboration between the authenticated user and another user.
 * The description is optional and limited to 200 characters.
 *
 * @example
 * {
 *   "collaboratorId": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
 *   "description": "Worked together on a jazz album in 2023"
 * }
 */
export class CreateCollaborationDto {
  /**
   * The ID of the user you collaborated with (UUID format)
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID(4, { message: "Collaborator ID must be a valid UUID" })
  @IsString({ message: "Collaborator ID is required" })
  collaboratorId!: string;

  /**
   * Optional description of the collaboration (max 200 characters)
   * @example "Worked together on a jazz album in 2023"
   */
  @IsOptional()
  @IsString()
  @Length(0, 200, {
    message: "Description must be 200 characters or less",
  })
  description?: string | null;
}
