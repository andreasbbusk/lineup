import { Controller, Get, Route, Tags } from "tsoa";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { MetadataService } from "./metadata.service.js";
import { MetadataResponse } from "../../types/api.types.js";

@Route("metadata")
@Tags("Metadata")
export class MetadataController extends Controller {
  private metadataService = new MetadataService();

  /**
   * Get all metadata
   *
   * Returns all tags, genres, and artists grouped by type.
   * Used for dropdowns, autocomplete, and tag/genre selectors.
   * This endpoint is public and does not require authentication.
   *
   * @summary Get all metadata
   * @returns Metadata grouped by type (tags, genres, artists)
   */
  @Get("/")
  public async getMetadata(): Promise<MetadataResponse> {
    return handleControllerRequest(this, () =>
      this.metadataService.getAllMetadata()
    );
  }
}
