// src/utils/supabase-helpers.ts
import { Database } from "../types/supabase.js";

// Posts table types
export type PostRow = Database["public"]["Tables"]["posts"]["Row"];
export type PostInsert = Database["public"]["Tables"]["posts"]["Insert"];
export type PostUpdate = Database["public"]["Tables"]["posts"]["Update"];

// Profiles table types
export type ProfileRow = Database["public"]["Tables"]["profiles"]["Row"];
export type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];
export type ProfileUpdate = Database["public"]["Tables"]["profiles"]["Update"];

// Metadata table types
export type MetadataRow = Database["public"]["Tables"]["metadata"]["Row"];
export type MetadataInsert = Database["public"]["Tables"]["metadata"]["Insert"];
export type MetadataUpdate = Database["public"]["Tables"]["metadata"]["Update"];

// Comments table types
export type CommentRow = Database["public"]["Tables"]["comments"]["Row"];
export type CommentInsert = Database["public"]["Tables"]["comments"]["Insert"];
export type CommentUpdate = Database["public"]["Tables"]["comments"]["Update"];

// Media table types
export type MediaRow = Database["public"]["Tables"]["media"]["Row"];
export type MediaInsert = Database["public"]["Tables"]["media"]["Insert"];
export type MediaUpdate = Database["public"]["Tables"]["media"]["Update"];

// Bookmarks table types
export type BookmarkRow = Database["public"]["Tables"]["bookmarks"]["Row"];
export type BookmarkInsert =
  Database["public"]["Tables"]["bookmarks"]["Insert"];
export type BookmarkUpdate =
  Database["public"]["Tables"]["bookmarks"]["Update"];

// User Collaborations table types
export type CollaborationRow =
  Database["public"]["Tables"]["user_collaborations"]["Row"];
export type CollaborationInsert =
  Database["public"]["Tables"]["user_collaborations"]["Insert"];
export type CollaborationUpdate =
  Database["public"]["Tables"]["user_collaborations"]["Update"];

// Connection Requests table types
export type ConnectionRequestRow =
  Database["public"]["Tables"]["connection_requests"]["Row"];
export type ConnectionRequestInsert =
  Database["public"]["Tables"]["connection_requests"]["Insert"];
export type ConnectionRequestUpdate =
  Database["public"]["Tables"]["connection_requests"]["Update"];

// Conversations table types
export type ConversationRow =
  Database["public"]["Tables"]["conversations"]["Row"];
export type ConversationInsert =
  Database["public"]["Tables"]["conversations"]["Insert"];
export type ConversationUpdate =
  Database["public"]["Tables"]["conversations"]["Update"];

// Conversation Participants table types
export type ConversationParticipantRow =
  Database["public"]["Tables"]["conversation_participants"]["Row"];
export type ConversationParticipantInsert =
  Database["public"]["Tables"]["conversation_participants"]["Insert"];
export type ConversationParticipantUpdate =
  Database["public"]["Tables"]["conversation_participants"]["Update"];

// Messages table types
export type MessageRow = Database["public"]["Tables"]["messages"]["Row"];
export type MessageInsert = Database["public"]["Tables"]["messages"]["Insert"];
export type MessageUpdate = Database["public"]["Tables"]["messages"]["Update"];

// Notifications table types
export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

// User Reviews table types
export type ReviewRow = Database["public"]["Tables"]["user_reviews"]["Row"];
export type ReviewInsert =
  Database["public"]["Tables"]["user_reviews"]["Insert"];
export type ReviewUpdate =
  Database["public"]["Tables"]["user_reviews"]["Update"];

// Recent Searches table types
export type RecentSearchRow =
  Database["public"]["Tables"]["recent_searches"]["Row"];
export type RecentSearchInsert =
  Database["public"]["Tables"]["recent_searches"]["Insert"];
export type RecentSearchUpdate =
  Database["public"]["Tables"]["recent_searches"]["Update"];

// Services table types
export type ServiceRow = Database["public"]["Tables"]["services"]["Row"];
export type ServiceInsert = Database["public"]["Tables"]["services"]["Insert"];
export type ServiceUpdate = Database["public"]["Tables"]["services"]["Update"];

// Enums
export type PostType = Database["public"]["Enums"]["post_type"];
export type MediaType = Database["public"]["Enums"]["media_type"];
export type MetadataType = Database["public"]["Enums"]["metadata_type"];
export type ConversationType = Database["public"]["Enums"]["conversation_type"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type LookingForType = Database["public"]["Enums"]["looking_for_type"];
export type ServiceType = Database["public"]["Enums"]["service_type_ext"];
