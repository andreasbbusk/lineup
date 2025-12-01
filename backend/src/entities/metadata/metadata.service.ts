import { supabase } from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import { MetadataResponse } from "../../types/api.types.js";
import { mapMetadataArrayToAPI } from "./metadata.mapper.js";
import { MetadataRow } from "../../utils/supabase-helpers.js";

export class MetadataService {
  /**
   * Get all metadata grouped by type
   * Returns tags, genres, and artists for use in dropdowns/autocomplete
   */
  async getAllMetadata(): Promise<MetadataResponse> {
    const { data: allMetadata, error } = await supabase
      .from("metadata")
      .select("*")
      .order("name", { ascending: true });

    if (error) {
      throw createHttpError({
        message: `Failed to fetch metadata: ${error.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!allMetadata || allMetadata.length === 0) {
      return {
        tags: [],
        genres: [],
        artists: [],
      };
    }

    // Group by type
    const tags = allMetadata.filter((m) => m.type === "tag") as MetadataRow[];
    const genres = allMetadata.filter(
      (m) => m.type === "genre"
    ) as MetadataRow[];
    const artists = allMetadata.filter(
      (m) => m.type === "artist"
    ) as MetadataRow[];

    return {
      tags: mapMetadataArrayToAPI(tags),
      genres: mapMetadataArrayToAPI(genres),
      artists: mapMetadataArrayToAPI(artists),
    };
  }
}
