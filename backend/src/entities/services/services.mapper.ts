import { ServiceRow } from "../../utils/supabase-helpers.js";
import { ServiceResponse } from "../../types/api.types.js";

/**
 * Maps Supabase service response (snake_case) to API response format (camelCase)
 * Transforms database format to API contract format
 */
export function mapServiceToResponse(service: ServiceRow): ServiceResponse {
  return {
    id: service.id,
    providerId: service.provider_id,
    providerName: service.provider_name,
    title: service.title,
    description: service.description,
    mediaUrl: service.media_url,
    location: service.location,
    serviceType: service.service_type,
    createdAt: service.created_at,
    updatedAt: service.updated_at,
  };
}

/**
 * Maps array of Supabase service responses to API format
 */
export function mapServicesToResponse(
  services: ServiceRow[]
): ServiceResponse[] {
  return services.map(mapServiceToResponse);
}
