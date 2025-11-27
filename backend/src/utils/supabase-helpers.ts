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

// Message Read Receipts table types
export type MessageReadReceiptRow =
  Database["public"]["Tables"]["message_read_receipts"]["Row"];
export type MessageReadReceiptInsert =
  Database["public"]["Tables"]["message_read_receipts"]["Insert"];
export type MessageReadReceiptUpdate =
  Database["public"]["Tables"]["message_read_receipts"]["Update"];

// Notifications table types
export type NotificationRow =
  Database["public"]["Tables"]["notifications"]["Row"];
export type NotificationInsert =
  Database["public"]["Tables"]["notifications"]["Insert"];
export type NotificationUpdate =
  Database["public"]["Tables"]["notifications"]["Update"];

// Enums
export type PostType = Database["public"]["Enums"]["post_type"];
export type MediaType = Database["public"]["Enums"]["media_type"];
export type MetadataType = Database["public"]["Enums"]["metadata_type"];
export type ConversationType = Database["public"]["Enums"]["conversation_type"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type LookingForType = Database["public"]["Enums"]["looking_for_type"];
