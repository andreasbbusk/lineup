import type { PostResponse } from "@/app/modules/api/postsApi";
import type { components } from "@/app/modules/types/api";
import { extractCity } from "@/app/modules/utils/date";
import type { ContentType } from "../stores/serviceFiltersStore";

type ServiceResponse = components["schemas"]["ServiceResponse"];

export interface ServiceFilters {
  search: string;
  location: string;
  serviceTypes: string[];
  genres: string[];
  paidOpportunity: boolean;
  contentType?: ContentType;
}

/**
 * Filter collaboration requests based on active filters
 */
export function filterCollaborationRequests(
  requests: PostResponse[],
  filters: ServiceFilters
): PostResponse[] {
  // Early return if wrong content type
  if (filters.contentType === "services") return [];

  return requests.filter((request) => {
    // Search filter - check title, description, and author name
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const authorName =
        request.author?.firstName ||
        request.author?.username ||
        "";
      const matchesSearch =
        request.title?.toLowerCase().includes(searchLower) ||
        request.description?.toLowerCase().includes(searchLower) ||
        authorName.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Location filter
    if (filters.location) {
      const requestCity = extractCity(request.location || "");
      if (requestCity !== filters.location) return false;
    }

    // Genre filter
    if (filters.genres.length > 0) {
      const requestGenres = request.metadata
        ?.filter((m) => m.type === "genre")
        .map((m) => m.name.toLowerCase()) || [];

      const hasMatchingGenre = filters.genres.some((genre) =>
        requestGenres.includes(genre.toLowerCase())
      );

      if (!hasMatchingGenre) return false;
    }

    // Paid opportunity filter
    if (filters.paidOpportunity && !request.paidOpportunity) {
      return false;
    }

    return true;
  });
}

/**
 * Filter services based on active filters
 */
export function filterServices(
  services: ServiceResponse[],
  filters: ServiceFilters
): ServiceResponse[] {
  // Early return if wrong content type
  if (filters.contentType === "collaborations") return [];

  return services.filter((service) => {
    // Search filter - check title, description, and provider name
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const providerName = service.providerName || "";
      const matchesSearch =
        service.title?.toLowerCase().includes(searchLower) ||
        service.description?.toLowerCase().includes(searchLower) ||
        providerName.toLowerCase().includes(searchLower);

      if (!matchesSearch) return false;
    }

    // Location filter
    if (filters.location) {
      const serviceCity = extractCity(service.location || "");
      if (serviceCity !== filters.location) return false;
    }

    // Service type filter
    if (filters.serviceTypes.length > 0) {
      if (!service.serviceType || !filters.serviceTypes.includes(service.serviceType)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Extract unique cities from requests and services
 */
export function extractUniqueCities(
  requests: PostResponse[],
  services: ServiceResponse[]
): string[] {
  const cities = new Set<string>();

  requests.forEach((request) => {
    const city = extractCity(request.location || "");
    if (city) cities.add(city);
  });

  services.forEach((service) => {
    const city = extractCity(service.location || "");
    if (city) cities.add(city);
  });

  return Array.from(cities).sort();
}

/**
 * Extract unique genres from collaboration requests
 */
export function extractUniqueGenres(requests: PostResponse[]): string[] {
  const genres = new Set<string>();

  requests.forEach((request) => {
    request.metadata?.forEach((meta) => {
      if (meta.type === "genre") {
        genres.add(meta.name);
      }
    });
  });

  return Array.from(genres).sort();
}

/**
 * Service type options with display labels
 */
export const SERVICE_TYPE_OPTIONS = [
  { value: "rehearsal_space", label: "Rehearsal Space" },
  { value: "studio", label: "Studio" },
  { value: "recording", label: "Recording" },
  { value: "art", label: "Art" },
  { value: "venue", label: "Venue" },
  { value: "teaching", label: "Teaching" },
  { value: "equipment_rental", label: "Equipment Rental" },
] as const;

/**
 * Get display label for service type
 */
export function getServiceTypeLabel(value: string): string {
  const option = SERVICE_TYPE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

/**
 * Calculate the number of active filters (excluding search)
 */
export function getActiveFilterCount(filters: ServiceFilters): number {
  return (
    (filters.location ? 1 : 0) +
    filters.serviceTypes.length +
    filters.genres.length +
    (filters.paidOpportunity ? 1 : 0) +
    (filters.contentType && filters.contentType !== "all" ? 1 : 0)
  );
}

/**
 * Check if any filters are currently active
 */
export function hasActiveFilters(filters: ServiceFilters): boolean {
  return (
    filters.search !== "" ||
    filters.location !== "" ||
    filters.serviceTypes.length > 0 ||
    filters.genres.length > 0 ||
    filters.paidOpportunity ||
    (filters.contentType !== undefined && filters.contentType !== "all")
  );
}
