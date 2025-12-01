import { ConnectionRequestRow } from "../../utils/supabase-helpers.js";
import { Connection, ConnectionStatus } from "../../types/api.types.js";

/**
 * Partial profile structure returned by Supabase select queries
 */
type PartialProfile = {
  id: string;
  username: string;
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  bio: string | null;
  location: string;
  user_type: string;
  theme_color: string | null;
  spotify_playlist_url: string | null;
  onboarding_completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
};

/**
 * Supabase connection request response with nested requester and recipient relations
 */
type SupabaseConnectionRequestWithRelations = ConnectionRequestRow & {
  requester?: PartialProfile;
  recipient?: PartialProfile;
};

/**
 * Maps a partial profile to UserProfile format (public fields only)
 */
function mapPartialProfileToUserProfile(profile: PartialProfile) {
  return {
    id: profile.id,
    username: profile.username,
    firstName: profile.first_name,
    lastName: profile.last_name,
    avatarUrl: profile.avatar_url ?? undefined,
    bio: profile.bio ?? undefined,
    aboutMe: undefined, // Not selected in query
    location: profile.location,
    userType: profile.user_type,
    themeColor: profile.theme_color ?? undefined,
    spotifyPlaylistUrl: profile.spotify_playlist_url ?? undefined,
    onboardingCompleted: profile.onboarding_completed ?? false,
    createdAt: profile.created_at ?? new Date().toISOString(),
    updatedAt: profile.updated_at ?? new Date().toISOString(),
  };
}

/**
 * Maps Supabase connection request response with nested relations to API format
 * Converts snake_case to camelCase and includes requester/recipient profile info
 */
export function mapConnectionRequestToResponse(
  connectionRequest: SupabaseConnectionRequestWithRelations
): Connection {
  return {
    id: connectionRequest.id,
    requesterId: connectionRequest.requester_id,
    recipientId: connectionRequest.recipient_id,
    status: connectionRequest.status as ConnectionStatus,
    createdAt: connectionRequest.created_at ?? new Date().toISOString(),
    updatedAt: connectionRequest.updated_at ?? new Date().toISOString(),
    requester: connectionRequest.requester
      ? mapPartialProfileToUserProfile(connectionRequest.requester)
      : undefined,
    recipient: connectionRequest.recipient
      ? mapPartialProfileToUserProfile(connectionRequest.recipient)
      : undefined,
  };
}

/**
 * Maps array of Supabase connection request responses to API format
 */
export function mapConnectionRequestsToResponse(
  connectionRequests: SupabaseConnectionRequestWithRelations[]
): Connection[] {
  return connectionRequests.map(mapConnectionRequestToResponse);
}
