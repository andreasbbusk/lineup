import { IsString, IsUUID, IsEnum } from "class-validator";
import { ConnectionStatus } from "../../types/api.types.js";

/**
 * DTO for creating a connection request
 *
 * Used when sending a connection request to another user.
 * The requester_id is automatically extracted from the authentication token.
 *
 * @example
 * {
 *   "recipientId": "a1b2c3d4-e5f6-7890-1234-567890abcdef"
 * }
 */
export class CreateConnectionRequestDto {
  /**
   * The ID of the user to send the connection request to (UUID format)
   * @example "a1b2c3d4-e5f6-7890-1234-567890abcdef"
   */
  @IsUUID(4, { message: "Recipient ID must be a valid UUID" })
  @IsString({ message: "Recipient ID is required" })
  recipientId!: string;
}

/**
 * DTO for updating a connection request status
 *
 * Used when accepting or rejecting a connection request.
 * Only the recipient can update the status.
 *
 * @example
 * {
 *   "status": "accepted"
 * }
 */
export class UpdateConnectionRequestDto {
  /**
   * The new status for the connection request
   * @example "accepted"
   */
  @IsEnum(["pending", "accepted", "rejected"], {
    message: "Status must be 'pending', 'accepted', or 'rejected'",
  })
  status!: ConnectionStatus;
}
