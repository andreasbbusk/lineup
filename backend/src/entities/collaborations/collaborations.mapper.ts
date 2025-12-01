import { CollaborationRow } from "../../utils/supabase-helpers.js";
import { CollaborationResponse } from "../../types/api.types.js";

/**
 * Supabase collaboration response with nested collaborator relation
 */
type SupabaseCollaborationWithRelations = CollaborationRow & {
  collaborator?: {
    id: string;
    username: string;
    first_name: string | null;
    last_name: string | null;
    avatar_url: string | null;
  };
};

/**
 * Maps Supabase collaboration response with nested relations to API format
 * Converts snake_case to camelCase and includes collaborator profile info
 */
export function mapCollaborationToResponse(
  collaboration: SupabaseCollaborationWithRelations
): CollaborationResponse {
  return {
    id: collaboration.id,
    userId: collaboration.user_id,
    collaboratorId: collaboration.collaborator_id,
    description: collaboration.description,
    createdAt: collaboration.created_at,
    collaborator: collaboration.collaborator
      ? {
          id: collaboration.collaborator.id,
          username: collaboration.collaborator.username,
          firstName: collaboration.collaborator.first_name ?? null,
          lastName: collaboration.collaborator.last_name ?? null,
          avatarUrl: collaboration.collaborator.avatar_url ?? null,
        }
      : undefined,
  };
}

/**
 * Maps array of Supabase collaboration responses to API format
 */
export function mapCollaborationsToResponse(
  collaborations: SupabaseCollaborationWithRelations[]
): CollaborationResponse[] {
  return collaborations.map(mapCollaborationToResponse);
}
