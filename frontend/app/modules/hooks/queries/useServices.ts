import {
  useQuery,
  keepPreviousData,
  UseQueryOptions,
} from "@tanstack/react-query";
import { servicesApi } from "@/app/modules/api/servicesApi";
import { components } from "@/app/modules/types/api";

type ServiceType = components["schemas"]["ServiceType"];
type ServiceResponse = components["schemas"]["ServiceResponse"];

interface UseServicesParams {
  serviceType?: ServiceType;
  location?: string;
  limit?: number;
  enabled?: boolean;
}

// Define the response type based on what servicesApi returns
interface ServicesApiResponse {
  data: ServiceResponse[];
}

/**
 * Services hook - fetch music service offerings
 *
 * Fetches services (recording studios, rehearsal spaces, lessons, etc.)
 * with optional filtering by type and location.
 *
 * Services are seeded data and cached for 5 minutes.
 */
export function useServices<TData = ServicesApiResponse>(
  params?: UseServicesParams,
  options?: Omit<
    UseQueryOptions<
      ServicesApiResponse,
      Error,
      TData,
      ["services", UseServicesParams?]
    >,
    "queryKey" | "queryFn"
  >
) {
  return useQuery({
    queryKey: ["services", params],
    queryFn: () =>
      servicesApi.getServices(params) as Promise<ServicesApiResponse>,
    enabled: params?.enabled !== false,
    staleTime: 1000 * 60 * 5, // Cache for 5 minutes
    gcTime: 1000 * 60 * 10, // Garbage collect after 10 minutes
    // Performance optimizations
    placeholderData: keepPreviousData, // Prevents UI flicker during refetches
    refetchOnMount: false, // Don't refetch if data is fresh (within staleTime)
    refetchOnWindowFocus: false, // Services are static/seeded, no need to refetch
    // Spread user options to allow overrides
    ...options,
  });
}
