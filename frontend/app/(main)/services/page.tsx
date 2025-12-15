"use client";

import { useMemo } from "react";
import { usePosts } from "@/app/modules/hooks/queries/usePosts";
import { useServices } from "@/app/modules/hooks/queries/useServices";
import { useStartChat } from "@/app/modules/hooks";
import { LoadingSpinner } from "@/app/modules/components/loading-spinner";
import { ServicesList } from "@/app/modules/features/services/components/services-list";
import { SearchBar } from "@/app/modules/features/services/components/search-bar";
import { FiltersPanel } from "@/app/modules/features/services/components/filters-panel";
import { ActiveFilters } from "@/app/modules/features/services/components/active-filters";
import { useServiceFiltersStore } from "@/app/modules/features/services/stores/serviceFiltersStore";
import {
  filterCollaborationRequests,
  filterServices,
  extractUniqueCities,
  extractUniqueGenres,
  getActiveFilterCount,
  hasActiveFilters as checkHasActiveFilters,
} from "@/app/modules/features/services/utils/filterHelpers";

export default function ServicesPage() {
  const { data: requestsData, isLoading: loadingRequests } = usePosts({
    type: "request",
    status: "active",
  });

  const { data: servicesData, isLoading: loadingServices } = useServices();

  const startChat = useStartChat();

  // Get filters from Zustand store
  const {
    search,
    location,
    serviceTypes,
    genres,
    paidOpportunity,
    contentType,
    setSearch,
    setLocation,
    setServiceTypes,
    setGenres,
    setPaidOpportunity,
    setContentType,
    clearFilters,
  } = useServiceFiltersStore();

  // Get raw data
  const allCollaborationRequests = useMemo(
    () => requestsData?.data || [],
    [requestsData?.data]
  );
  const allServices = useMemo(
    () => servicesData?.data || [],
    [servicesData?.data]
  );

  // Extract unique options for filters
  const availableCities = useMemo(
    () => extractUniqueCities(allCollaborationRequests, allServices),
    [allCollaborationRequests, allServices]
  );

  const availableGenres = useMemo(
    () => extractUniqueGenres(allCollaborationRequests),
    [allCollaborationRequests]
  );

  // Combine filters for filtering
  const filters = useMemo(
    () => ({
      search,
      location,
      serviceTypes,
      genres,
      paidOpportunity,
      contentType,
    }),
    [search, location, serviceTypes, genres, paidOpportunity, contentType]
  );

  // Apply filters
  const filteredCollaborationRequests = useMemo(
    () => filterCollaborationRequests(allCollaborationRequests, filters),
    [allCollaborationRequests, filters]
  );

  const filteredServices = useMemo(
    () => filterServices(allServices, filters),
    [allServices, filters]
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(
    () => checkHasActiveFilters(filters),
    [filters]
  );

  // Count active filters (excluding search)
  const activeFilterCount = useMemo(
    () => getActiveFilterCount(filters),
    [filters]
  );

  // Remove individual filter
  const removeFilter = (filterType: string, value?: string) => {
    switch (filterType) {
      case "search":
        setSearch("");
        break;
      case "location":
        setLocation("");
        break;
      case "serviceTypes":
        if (value) {
          setServiceTypes(serviceTypes.filter((t) => t !== value));
        }
        break;
      case "genres":
        if (value) {
          setGenres(genres.filter((g) => g !== value));
        }
        break;
      case "paidOpportunity":
        setPaidOpportunity(false);
        break;
      case "contentType":
        setContentType("all");
        break;
    }
  };

  if (loadingRequests || loadingServices) {
    return <LoadingSpinner />;
  }

  return (
    <div className="bg-background">
      {/* Sticky Filter Bar */}
      <div className="sticky top-16 z-30 bg-background pb-1 pt-2 mb-3 shadow-sm">
        <div className="px-4">
          {/* Search and Filters Row */}
          <div className="flex gap-2 mb-2">
            <div className="flex-1">
              <SearchBar value={search} onChange={setSearch} />
            </div>
            <FiltersPanel
              location={location}
              serviceTypes={serviceTypes}
              genres={genres}
              paidOpportunity={paidOpportunity}
              contentType={contentType}
              availableCities={availableCities}
              availableGenres={availableGenres}
              onLocationChange={setLocation}
              onServiceTypesChange={setServiceTypes}
              onGenresChange={setGenres}
              onPaidOpportunityChange={setPaidOpportunity}
              onContentTypeChange={setContentType}
              onClearFilters={clearFilters}
              activeFilterCount={activeFilterCount}
              hasActiveFilters={hasActiveFilters}
            />
          </div>

          {/* Active Filters */}
          {hasActiveFilters && (
            <div className="mb-2">
              <ActiveFilters
                filters={filters}
                onRemoveFilter={removeFilter}
                onClearAll={clearFilters}
              />
            </div>
          )}
        </div>
      </div>

      {/* Services List */}
      <ServicesList
        collaborationRequests={filteredCollaborationRequests}
        services={filteredServices}
        onChatClick={startChat}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={clearFilters}
      />
    </div>
  );
}
