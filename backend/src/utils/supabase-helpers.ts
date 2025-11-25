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

// Enums
export type PostType = Database["public"]["Enums"]["post_type"];
export type MediaType = Database["public"]["Enums"]["media_type"];
export type MetadataType = Database["public"]["Enums"]["metadata_type"];
export type ConversationType = Database["public"]["Enums"]["conversation_type"];
export type NotificationType = Database["public"]["Enums"]["notification_type"];
export type LookingForType = Database["public"]["Enums"]["looking_for_type"];
