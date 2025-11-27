// src/entities/metadata/metadata.mapper.ts
import { MetadataItem } from "../../types/api.types.js";
import { Database } from "../../types/supabase.js";

type MetadataRow = Database["public"]["Tables"]["metadata"]["Row"];

/**
 * Maps database metadata row to API MetadataItem format
 */
export function mapMetadataToAPI(metadata: MetadataRow): MetadataItem {
  return {
    id: metadata.id,
    type: metadata.type as "tag" | "genre" | "artist",
    name: metadata.name,
    createdAt: metadata.created_at ?? new Date().toISOString(),
  };
}

/**
 * Maps array of database metadata rows to API MetadataItem array
 */
export function mapMetadataArrayToAPI(metadataArray: MetadataRow[]): MetadataItem[] {
  return metadataArray.map(mapMetadataToAPI);
}

