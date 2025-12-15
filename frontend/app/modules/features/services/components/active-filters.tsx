"use client";

import { memo } from "react";
import { X } from "lucide-react";
import type { ServiceFilters } from "../utils/filterHelpers";
import { getServiceTypeLabel } from "../utils/filterHelpers";

interface ActiveFiltersProps {
  filters: ServiceFilters;
  onRemoveFilter: (filterType: string, value?: string) => void;
  onClearAll: () => void;
}

function ActiveFiltersComponent({
  filters,
  onRemoveFilter,
  onClearAll,
}: ActiveFiltersProps) {
  const activeFilters: Array<{
    type: string;
    label: string;
    value?: string;
  }> = [];

  // Add location filter
  if (filters.location) {
    activeFilters.push({
      type: "location",
      label: `Location: ${filters.location}`,
    });
  }

  // Add service type filters
  filters.serviceTypes.forEach((type) => {
    activeFilters.push({
      type: "serviceTypes",
      label: `Type: ${getServiceTypeLabel(type)}`,
      value: type,
    });
  });

  // Add genre filters
  filters.genres.forEach((genre) => {
    activeFilters.push({
      type: "genres",
      label: `Genre: ${genre}`,
      value: genre,
    });
  });

  // Add paid opportunity filter
  if (filters.paidOpportunity) {
    activeFilters.push({
      type: "paidOpportunity",
      label: "Paid opportunities",
    });
  }

  // Add content type filter
  if (filters.contentType === "collaborations") {
    activeFilters.push({
      type: "contentType",
      label: "Collaborations",
    });
  } else if (filters.contentType === "services") {
    activeFilters.push({
      type: "contentType",
      label: "Services",
    });
  }

  if (activeFilters.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      {activeFilters.map((filter, index) => (
        <button
          key={`${filter.type}-${filter.value || ""}-${index}`}
          type="button"
          onClick={() => onRemoveFilter(filter.type, filter.value)}
          className="flex items-center gap-1.5 rounded-full bg-grey/10 px-3 py-1.5 text-sm text-grey hover:bg-grey/20 transition-colors"
          aria-label={`Remove ${filter.label} filter`}
        >
          <span>{filter.label}</span>
          <X className="h-3.5 w-3.5" />
        </button>
      ))}
      {activeFilters.length > 1 && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-sm text-grey hover:text-black transition-colors underline"
        >
          Clear all
        </button>
      )}
    </div>
  );
}

export const ActiveFilters = memo(ActiveFiltersComponent);
