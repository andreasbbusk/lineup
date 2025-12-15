import { apiClient, handleApiError } from "@/app/modules/api/apiClient";
import { components, operations } from "@/app/modules/types/api";

type ServiceType = components["schemas"]["ServiceType"];
type GetServicesParams = operations["GetServices"]["parameters"]["query"];

/**
 * Services API - Global Infrastructure
 *
 * Provides access to music-related service offerings (recording studios,
 * rehearsal spaces, lessons, etc.). Services are seeded/read-only data.
 */
export const servicesApi = {
  // ============================================================================
  // Services Methods
  // ============================================================================

  /**
   * Get all services with optional filters
   *
   * @param serviceType - Filter by service type
   * @param location - Filter by location (case-insensitive partial match)
   * @param limit - Maximum number of results to return (default: 100)
   * @returns List of services
   */
  getServices: async (params?: GetServicesParams) => {
    const { data, error, response } = await apiClient.GET("/services", {
      params: {
        query: {
          serviceType: params?.serviceType,
          location: params?.location,
          limit: params?.limit || 100,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  /**
   * Get services by type
   *
   * @param serviceType - Service type to filter by
   * @param limit - Maximum number of results to return
   * @returns List of services of specified type
   */
  getServicesByType: async (
    serviceType: ServiceType,
    limit: number = 100
  ) => {
    const { data, error, response } = await apiClient.GET("/services", {
      params: {
        query: {
          serviceType,
          limit,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  /**
   * Get services by location
   *
   * @param location - Location to filter by (case-insensitive partial match)
   * @param limit - Maximum number of results to return
   * @returns List of services in specified location
   */
  getServicesByLocation: async (location: string, limit: number = 100) => {
    const { data, error, response } = await apiClient.GET("/services", {
      params: {
        query: {
          location,
          limit,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },
};
