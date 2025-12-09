"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/modules/components/buttons";
import { Toggle } from "@/app/modules/components/toggle";
import { MediaUploader } from "./media-uploader";
// import { TagSelector } from "./tag-selector"; // Disabled - metadata not ready
import { UserTagger } from "./user-tagger";
import { Combobox } from "@/app/modules/components/combobox";
import { useRequestDraftAutoSave } from "../hooks/use-draft-auto-save";
import type { UploadedMedia } from "../types";

interface RequestFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    location?: string;
    genres?: string[];
    paidOpportunity?: boolean;
    taggedUsers?: string[];
    media?: UploadedMedia[];
  }) => void;
  isSubmitting?: boolean;
}

// Fetch metadata for genres - DISABLED: Metadata endpoint not ready
/*
async function fetchGenres() {
  const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";
  const response = await fetch(`${baseUrl}/api/metadata`);
  if (!response.ok) throw new Error("Failed to fetch metadata");
  const data = await response.json();
  return data.genres || [];
}
*/

export function RequestForm({
  onSubmit,
  isSubmitting = false,
}: RequestFormProps) {
  const {
    title,
    description,
    location,
    genres,
    paidOpportunity,
    taggedUsers,
    media,
    updateTitle,
    updateDescription,
    updateLocation,
    updateGenres,
    updatePaidOpportunity,
    updateTaggedUsers,
    updateMedia,
    clearDraft,
    restoreDraft,
  } = useRequestDraftAutoSave();

  // const [isGenreSelectorOpen, setIsGenreSelectorOpen] = useState(false); // Disabled
  const [isUserTaggerOpen, setIsUserTaggerOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  // const [availableGenres, setAvailableGenres] = useState<{ name: string }[]>([]); // Disabled

  // Restore draft on mount
  useEffect(() => {
    const loadDraft = async () => {
      try {
        const draft = await restoreDraft();
        if (draft.title || draft.description || draft.media.length > 0) {
          // Draft exists, values are already in store from restoreDraft
          // The store will have the restored values
        }
      } catch (error) {
        console.error("Failed to restore draft:", error);
      } finally {
        setIsRestoring(false);
      }
    };

    loadDraft();
  }, [restoreDraft]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }

    if (description.trim().length < 10) {
      alert("Description must be at least 10 characters");
      return;
    }

    if (description.trim().length > 5000) {
      alert("Description must be less than 5000 characters");
      return;
    }

    onSubmit({
      title: title.trim(),
      description: description.trim(),
      location: location.trim() || undefined,
      genres: genres.length > 0 ? genres : undefined,
      paidOpportunity: paidOpportunity || undefined,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      media: media.length > 0 ? media : undefined,
    });

    // Clear draft after successful submission
    clearDraft();
  };

  const remainingChars = 5000 - description.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => updateTitle(e.target.value)}
          placeholder="Write a title..."
          maxLength={100}
          disabled={isRestoring}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base placeholder:text-gray-400 focus:border-crocus-yellow focus:outline-none focus:ring-2 focus:ring-crocus-yellow/20 disabled:opacity-50"
        />
        <p className="mt-1 text-right text-sm text-gray-500">
          {title.length} / 100
        </p>
      </div>

      {/* Description */}
      <div>
        <textarea
          value={description}
          onChange={(e) => updateDescription(e.target.value)}
          placeholder="Write a description..."
          rows={6}
          maxLength={5000}
          disabled={isRestoring}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base placeholder:text-gray-400 focus:border-crocus-yellow focus:outline-none focus:ring-2 focus:ring-crocus-yellow/20 disabled:opacity-50"
        />
        <p
          className={`mt-1 text-right text-sm ${
            remainingChars < 100 ? "text-red-500" : "text-gray-500"
          }`}
        >
          {remainingChars} characters remaining
        </p>
      </div>

      {/* Location */}
      <div>
        <Combobox
          value={location}
          onAction={updateLocation}
          options={[]} // TODO: Add location autocomplete
          placeholder="Location (optional)"
        />
      </div>

      {/* Genres - DISABLED: Metadata endpoint not ready */}
      {/* 
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsGenreSelectorOpen(true)}
        >
          + Add genres
        </Button>
        {genres.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {genres.map((genre) => (
              <span
                key={genre}
                className="rounded-full border border-gray-300 bg-gray-50 px-3 py-1 text-sm"
              >
                {genre}
                <button
                  type="button"
                  onClick={() => setGenres(genres.filter((g) => g !== genre))}
                  className="ml-2 text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}
      </div>
      */}

      {/* Paid Opportunity */}
      <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
        <div>
          <p className="font-medium">Paid Opportunity</p>
          <p className="text-sm text-gray-500">
            Indicate if this is a paid collaboration
          </p>
        </div>
        <Toggle
          isOn={paidOpportunity}
          onToggle={() => updatePaidOpportunity(!paidOpportunity)}
        />
      </div>

      {/* Tag People */}
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsUserTaggerOpen(true)}
        >
          + Add people
        </Button>
        {taggedUsers.length > 0 && (
          <p className="text-sm text-gray-600">
            {taggedUsers.length} user{taggedUsers.length > 1 ? "s" : ""} tagged
          </p>
        )}
      </div>

      {/* Media */}
      <MediaUploader media={media} onMediaChange={updateMedia} />

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={
            isSubmitting || !title.trim() || description.trim().length < 10
          }
          onClick={() => {}} // Required by Button component, form handles submit
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>

      {/* Modals */}
      {/* TagSelector disabled - metadata not ready */}
      {/* 
      <TagSelector
        selectedTags={genres}
        onTagsChange={setGenres}
        isOpen={isGenreSelectorOpen}
        onClose={() => setIsGenreSelectorOpen(false)}
      />
      */}

      <UserTagger
        selectedUsers={taggedUsers}
        onUsersChange={updateTaggedUsers}
        isOpen={isUserTaggerOpen}
        onClose={() => setIsUserTaggerOpen(false)}
      />
    </form>
  );
}
