import { useQuery } from "@tanstack/react-query";
import { servicesApi } from "@/app/modules/api/servicesApi";
import { components } from "@/app/modules/types/api";

type ServiceType = components["schemas"]["ServiceType"];

interface UseServicesParams {
  serviceType?: ServiceType;
  location?: string;
  limit?: number;
  enabled?: boolean;
}

/**
 * Services hook - fetch music service offerings
 *
 * Fetches services (recording studios, rehearsal spaces, lessons, etc.)
 * with optional filtering by type and location.
 *
 * Services are seeded data and cached for 5 minutes.
 */
export function useServices(params?: UseServicesParams) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () => servicesApi.getServices(params),
    enabled: params?.enabled !== false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
  });
}
