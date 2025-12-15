import { supabase } from "../../config/supabase.config.js";
import { ServiceRow } from "../../utils/supabase-helpers.js";
import { mapServicesToResponse } from "./services.mapper.js";
import { ServiceResponse } from "../../types/api.types.js";
import { createHttpError } from "../../utils/error-handler.js";
import { ServicesQueryDto } from "./services.dto.js";

/**
 * Services are seeded data with standalone provider names.
 * There is no creation endpoint - services are managed via database seeds.
 */
export class ServicesService {
  /**
   * Get services with optional filters
   *
   * Returns a list of services with optional filtering by service type and location.
   *
   * @param query Query parameters including filters and options
   * @returns Array of services
   */
  async getServices(query: ServicesQueryDto): Promise<ServiceResponse[]> {
    const { serviceType, location, limit = 100 } = query;

    // Build the base query with explicit fields
    let servicesQuery = supabase
      .from("services")
      .select(
        `
        id,
        provider_id,
        provider_name,
        title,
        description,
        media_url,
        location,
        service_type,
        created_at,
        updated_at
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit);

    // Apply filters
    if (serviceType) {
      servicesQuery = servicesQuery.eq("service_type", serviceType);
    }

    if (location) {
      servicesQuery = servicesQuery.ilike("location", `%${location}%`);
    }

    // Execute the query
    const { data: services, error: servicesError } = await servicesQuery;

    if (servicesError) {
      throw createHttpError({
        message: `Failed to fetch services: ${servicesError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!services || services.length === 0) {
      return [];
    }

    // Map services to response format
    return mapServicesToResponse(services as ServiceRow[]);
  }
}
