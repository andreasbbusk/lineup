// Database Types matching Supabase Schema

export interface Profile {
  id: string; // UUID, foreign key to auth.users
  username: string; // unique, 3-30 alphanumeric + underscore
  first_name: string;
  last_name: string;
  avatar_url?: string;
  bio?: string; // max 100 chars
  about_me?: string; // max 500 chars
  phone_country_code: number;
  phone_number: number; // bigint
  year_of_birth: number; // must be 13+
  location: string; // max 100 chars
  user_type: string; // default 'musician'
  theme_color?: string; // hex color format
  spotify_playlist_url?: string;
  onboarding_completed: boolean; // default false
  created_at: string;
  updated_at: string;
  blocked_users: string[]; // UUID array
}

export interface Metadata {
  id: string;
  type: "tag" | "genre" | "artist";
  name: string;
  created_at: string;
}

export interface UserMetadata {
  user_id: string;
  metadata_id: string;
  created_at: string;
}

export interface UserLookingFor {
  user_id: string;
  looking_for_value: "connect" | "promote" | "find-band" | "find-services";
}

export interface UserSocialMedia {
  user_id: string;
  instagram?: string;
  twitter?: string;
  youtube?: string;
  facebook?: string;
  tiktok?: string;
  soundcloud?: string;
  bandcamp?: string;
  updated_at: string;
}

export interface Post {
  id: string;
  type: "note" | "request" | "story";
  title: string; // max 100 chars
  description: string; // 10-5000 chars
  author_id: string;
  location?: string;
  paid_opportunity?: boolean;
  expires_at?: string; // for stories
  created_at: string;
  updated_at: string;
}

export interface PostMedia {
  post_id: string;
  media_id: string;
  display_order: number;
  created_at: string;
}

export interface Media {
  id: string;
  url: string;
  thumbnail_url?: string;
  type: "image" | "video";
  created_at: string;
}

export interface ConnectionRequest {
  id: string;
  requester_id: string;
  recipient_id: string;
  status: "pending" | "accepted" | "rejected";
  created_at: string;
  updated_at: string;
}

export interface Like {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Bookmark {
  post_id: string;
  user_id: string;
  created_at: string;
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  content: string; // 1-1000 chars
  created_at: string;
  updated_at: string;
}

export interface UserReview {
  id: string;
  user_id: string; // user being reviewed
  reviewer_id: string;
  rating: number; // 1-5
  description?: string; // max 500 chars
  created_at: string;
}

export interface UserCollaboration {
  id: string;
  user_id: string;
  collaborator_id: string;
  description?: string; // max 200 chars
  created_at: string;
}

export interface Conversation {
  id: string;
  type: "direct" | "group";
  name?: string;
  avatar_url?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  last_message_id?: string;
  last_message_preview?: string;
  last_message_at?: string;
}

export interface ConversationParticipant {
  conversation_id: string;
  user_id: string;
  joined_at: string;
  left_at?: string;
  is_admin: boolean;
  last_read_message_id?: string;
  last_read_at?: string;
  notifications_enabled: boolean;
  is_muted: boolean;
  is_typing: boolean;
  last_typing_at?: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content?: string; // 1-5000 chars
  media_ids?: string[];
  is_edited: boolean;
  edited_at?: string;
  is_deleted: boolean;
  deleted_at?: string;
  reply_to_message_id?: string;
  created_at: string;
  sent_via_websocket: boolean;
}

export interface Notification {
  id: string;
  recipient_id: string;
  actor_id?: string;
  type:
    | "like"
    | "comment"
    | "connection_request"
    | "connection_accepted"
    | "tagged_in_post"
    | "review"
    | "collaboration_request"
    | "message";
  entity_type?: string;
  entity_id?: string;
  title: string;
  body?: string;
  action_url?: string;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  sent_via_websocket: boolean;
}

export interface StoryView {
  story_id: string;
  viewer_id: string;
  viewed_at: string;
}

export interface RecentSearch {
  id: string;
  user_id: string;
  search_query: string;
  search_tab?: "for_you" | "people" | "collaborations" | "tags";
  entity_type?: string;
  entity_id?: string;
  created_at: string;
}

// Helper type for database queries with relationships
export interface ProfileWithRelations extends Profile {
  user_metadata?: UserMetadata[];
  user_looking_for?: UserLookingFor[];
  user_social_media?: UserSocialMedia;
}
