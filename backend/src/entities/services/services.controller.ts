import { Controller, Route, Tags, Get, Query } from "tsoa";
import { handleControllerRequest } from "../../utils/controller-helpers.js";
import { ServicesService } from "./services.service.js";
import { ServicesQueryDto } from "./services.dto.js";
import { ServiceResponse } from "../../types/api.types.js";
import { ServiceType } from "../../utils/supabase-helpers.js";

@Route("services")
@Tags("Services")
export class ServicesController extends Controller {
  private servicesService = new ServicesService();

  /**
   * List services with optional filters
   *
   * Returns a list of services with optional filtering by service type and location.
   * Services are public and can be viewed without authentication.
   * Services are seeded data - there is no creation endpoint.
   *
   * @summary List services
   * @param serviceType Filter by service type
   * @param location Filter by location (case-insensitive partial match)
   * @param limit Maximum number of services to return (default: 100)
   * @returns Array of services
   */
  @Get("/")
  public async getServices(
    @Query() serviceType?: ServiceType,
    @Query() location?: string,
    @Query() limit?: number
  ): Promise<{ data: ServiceResponse[] }> {
    return handleControllerRequest(
      this,
      async () => {
        const query: ServicesQueryDto = {
          serviceType,
          location,
          limit: limit || 100,
        };

        const services = await this.servicesService.getServices(query);

        return { data: services };
      },
      200
    );
  }
}
