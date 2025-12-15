"use client";

import { Button } from "@/app/modules/components/buttons";
import { CheckboxCircle } from "@/app/modules/components/checkbox-circle";
import { Combobox } from "@/app/modules/components/combobox";
import { Popover, PopoverContent, PopoverTrigger } from "@/app/modules/components/radix-popover";
import { Toggle } from "@/app/modules/components/toggle";
import { ListFilter } from "lucide-react";
import { memo, useState } from "react";
import { SERVICE_TYPE_OPTIONS } from "../utils/filterHelpers";
import type { ContentType } from "../stores/serviceFiltersStore";

interface FiltersPanelProps {
  location: string;
  serviceTypes: string[];
  genres: string[];
  paidOpportunity: boolean;
  contentType: ContentType;
  availableCities: string[];
  availableGenres: string[];
  onLocationChange: (location: string) => void;
  onServiceTypesChange: (types: string[]) => void;
  onGenresChange: (genres: string[]) => void;
  onPaidOpportunityChange: (paid: boolean) => void;
  onContentTypeChange: (type: ContentType) => void;
  onClearFilters: () => void;
  activeFilterCount: number;
  hasActiveFilters: boolean;
}

function FiltersPanelComponent({
  location,
  serviceTypes,
  genres,
  paidOpportunity,
  contentType,
  availableCities,
  availableGenres,
  onLocationChange,
  onServiceTypesChange,
  onGenresChange,
  onPaidOpportunityChange,
  onContentTypeChange,
  onClearFilters,
  activeFilterCount,
  hasActiveFilters,
}: FiltersPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Local state for staging filter changes
  const [localFilters, setLocalFilters] = useState({
    location,
    serviceTypes,
    genres,
    paidOpportunity,
    contentType,
  });

  // Handle popover open/close
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Reset local state to current values when opening
    if (open) {
      setLocalFilters({ location, serviceTypes, genres, paidOpportunity, contentType });
    }
  };

  const cityOptions = availableCities.map((city) => ({
    value: city,
    label: city,
  }));

  const handleServiceTypeToggle = (type: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      serviceTypes: prev.serviceTypes.includes(type)
        ? prev.serviceTypes.filter((t) => t !== type)
        : [...prev.serviceTypes, type],
    }));
  };

  const handleGenreToggle = (genre: string) => {
    setLocalFilters((prev) => ({
      ...prev,
      genres: prev.genres.includes(genre)
        ? prev.genres.filter((g) => g !== genre)
        : [...prev.genres, genre],
    }));
  };

  const handleApplyFilters = () => {
    onLocationChange(localFilters.location);
    onServiceTypesChange(localFilters.serviceTypes);
    onGenresChange(localFilters.genres);
    onPaidOpportunityChange(localFilters.paidOpportunity);
    onContentTypeChange(localFilters.contentType);
    setIsOpen(false);
  };

  const handleClearAll = () => {
    setLocalFilters({
      location: "",
      serviceTypes: [],
      genres: [],
      paidOpportunity: false,
      contentType: "all",
    });
    onClearFilters();
    setIsOpen(false);
  };

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex items-center gap-2 rounded-lg py-1 text-base hover:opacity-70 transition-opacity shrink-0"
          aria-label="Open filters"
        >
          <ListFilter className="h-5 w-5" />
          <span className="text-black">Filter</span>
          {activeFilterCount > 0 && (
            <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-crocus-yellow px-1 text-xs font-semibold text-black">
              {activeFilterCount}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent
        className="max-h-[60dvh] bg-white border border-grey/10 p-4 overflow-y-auto no-scrollbar"
        align="end"
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <div className="flex flex-col gap-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-black">Filters</h3>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={handleClearAll}
                className="text-sm text-black/70 hover:text-black transition-colors"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Content Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Show</label>
            <div className="flex flex-col gap-2">
              {[
                { value: "all", label: "All" },
                { value: "collaborations", label: "Collaborations" },
                { value: "services", label: "Services" },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setLocalFilters((prev) => ({
                      ...prev,
                      contentType: option.value as ContentType,
                    }))
                  }
                  className="flex items-center gap-2.5 text-left text-black hover:bg-black/10 rounded-lg p-2 transition-colors"
                >
                  <div
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                      localFilters.contentType === option.value
                        ? "border-crocus-yellow"
                        : "border-black/20"
                    }`}
                  >
                    {localFilters.contentType === option.value && (
                      <div className="h-2.5 w-2.5 rounded-full bg-crocus-yellow" />
                    )}
                  </div>
                  <span className="text-base">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Location Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Location</label>
            <Combobox
              value={localFilters.location}
              onAction={(value) =>
                setLocalFilters((prev) => ({ ...prev, location: value }))
              }
              options={cityOptions}
              placeholder="Select city..."
              className="w-full text-black"
            />
          </div>

          {/* Service Type Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Service Type</label>
            <div className="flex flex-col gap-2">
              {SERVICE_TYPE_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => handleServiceTypeToggle(option.value)}
                  className="flex items-center gap-2.5 text-left text-black hover:bg-black/10 rounded-lg p-2 transition-colors"
                >
                  <CheckboxCircle checked={localFilters.serviceTypes.includes(option.value)} />
                  <span className="text-base">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Genre Filter */}
          {availableGenres.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium text-black">Genre</label>
              <div className="flex flex-col gap-2">
                {availableGenres.map((genre) => (
                  <button
                    key={genre}
                    type="button"
                    onClick={() => handleGenreToggle(genre)}
                    className="flex items-center gap-2.5 text-left text-black hover:bg-black/10 rounded-lg p-2 transition-colors"
                  >
                    <CheckboxCircle checked={localFilters.genres.includes(genre)} />
                    <span className="text-base">{genre}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Paid Opportunity Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-black">Paid Opportunities Only</label>
            <Toggle
              isOn={localFilters.paidOpportunity}
              onToggle={() =>
                setLocalFilters((prev) => ({
                  ...prev,
                  paidOpportunity: !prev.paidOpportunity,
                }))
              }
            />
          </div>

          {/* Apply Button */}
          <Button
            variant="secondary"
            onClick={handleApplyFilters}
            className="w-full"
          >
            Apply Filters
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

export const FiltersPanel = memo(FiltersPanelComponent);