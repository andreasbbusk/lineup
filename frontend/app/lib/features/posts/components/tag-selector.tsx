"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Modal } from "./modal";
import { Tags } from "@/app/components/tags";
import { Button } from "@/app/components/buttons";
import { Combobox } from "@/app/components/combobox";

interface TagSelectorProps {
  selectedTags: string[];
  onTagsChange: (tags: string[]) => void;
  isOpen: boolean;
  onClose: () => void;
  maxTags?: number;
}

// Fetch metadata API
async function fetchMetadata() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const response = await fetch(`${baseUrl}/api/metadata`);
  if (!response.ok) throw new Error("Failed to fetch metadata");
  return response.json();
}

export function TagSelector({
  selectedTags,
  onTagsChange,
  isOpen,
  onClose,
  maxTags = 10,
}: TagSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const { data: metadata, isLoading } = useQuery({
    queryKey: ["metadata"],
    queryFn: fetchMetadata,
    staleTime: Infinity, // Cache forever
  });

  // Filter tags based on search
  const availableTags = metadata?.tags || [];
  const filteredTags = availableTags.filter((tag: { name: string }) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleToggleTag = (tagName: string) => {
    if (selectedTags.includes(tagName)) {
      // Remove tag
      onTagsChange(selectedTags.filter((t) => t !== tagName));
    } else {
      // Add tag (check limit)
      if (selectedTags.length >= maxTags) {
        alert(`You can only select up to ${maxTags} tags`);
        return;
      }
      onTagsChange([...selectedTags, tagName]);
    }
  };

  const handleAddCustomTag = () => {
    const trimmed = searchQuery.trim();
    if (!trimmed) return;

    // Check if already selected
    if (selectedTags.includes(trimmed)) {
      setSearchQuery("");
      return;
    }

    // Check limit
    if (selectedTags.length >= maxTags) {
      alert(`You can only select up to ${maxTags} tags`);
      return;
    }

    // Add custom tag
    onTagsChange([...selectedTags, trimmed]);
    setSearchQuery("");
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Tags">
      <div className="space-y-4">
        {/* Search input */}
        <div className="space-y-2">
          <Combobox
            value={searchQuery}
            onAction={setSearchQuery}
            options={filteredTags.map((tag: { name: string }) => ({
              value: tag.name,
              label: tag.name,
            }))}
            placeholder="Search or create tags..."
          />
          {searchQuery.trim() &&
            !selectedTags.includes(searchQuery.trim()) &&
            !availableTags.some(
              (tag: { name: string }) => tag.name === searchQuery.trim()
            ) && (
              <Button
                variant="secondary"
                onClick={handleAddCustomTag}
                className="w-full"
              >
                Add "{searchQuery.trim()}"
              </Button>
            )}
        </div>

        {/* Selected tags */}
        {selectedTags.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Selected Tags</h3>
            <div className="flex flex-wrap gap-2">
              {selectedTags.map((tag) => (
                <Tags
                  key={tag}
                  text={tag}
                  selected={true}
                  hashTag={true}
                  onClick={() => handleToggleTag(tag)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Available tags */}
        {filteredTags.length > 0 && (
          <div>
            <h3 className="mb-2 text-sm font-medium">Available Tags</h3>
            <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
              {filteredTags
                .filter((tag: { name: string }) => !selectedTags.includes(tag.name))
                .map((tag: { name: string }) => (
                  <Tags
                    key={tag.name}
                    text={tag.name}
                    selected={false}
                    hashTag={true}
                    onClick={() => handleToggleTag(tag.name)}
                  />
                ))}
            </div>
          </div>
        )}

        {isLoading && <p className="text-sm text-gray-500">Loading tags...</p>}

        {/* Footer */}
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="secondary" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
}

