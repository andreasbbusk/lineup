import { Controller, Get, Route, Tags } from "tsoa";
import { supabase } from "../config/supabase.config.js";
import { MetadataResponse, MetadataItem } from "../types/api.types.js";

@Route("metadata")
@Tags("Metadata")
export class MetadataController extends Controller {
  /**
   * Get all tags, genres, artists, interests for dropdowns/autocomplete
   * Returns metadata grouped by type with usage counts
   */
  @Get("/")
  public async getMetadata(): Promise<MetadataResponse | { error: string }> {
    try {
      // Get all metadata grouped by type
      const { data: allMetadata, error: metadataError } = await supabase
        .from("metadata")
        .select("*")
        .order("name", { ascending: true });

      if (metadataError) {
        this.setStatus(500);
        return { error: metadataError.message };
      }

      if (!allMetadata || allMetadata.length === 0) {
        this.setStatus(200);
        return {
          tags: [],
          genres: [],
          artists: [],
        };
      }

      // Group by type
      const tags = allMetadata.filter((m) => m.type === "tag");
      const genres = allMetadata.filter((m) => m.type === "genre");
      const artists = allMetadata.filter((m) => m.type === "artist");
      const interests = allMetadata.filter((m) => m.type === "interest");

      // Map to MetadataItem format
      const mapToMetadataItem = (items: any[]): MetadataItem[] => {
        return items.map((item) => ({
          id: item.id,
          type: item.type as "tag" | "genre" | "artist",
          name: item.name,
          createdAt: item.created_at,
        }));
      };

      this.setStatus(200);
      return {
        tags: mapToMetadataItem(tags),
        genres: mapToMetadataItem(genres),
        artists: mapToMetadataItem(artists),
      };
    } catch (error) {
      this.setStatus(500);
      return { error: (error as Error).message };
    }
  }
}
