"use client";

import { useState, useEffect } from "react";
import { Button } from "@/app/modules/components/buttons";
import { Toggle } from "@/app/modules/components/toggle";
import { MediaUploader } from "./media-uploader";
import { GenreSelector } from "./genre-selector";
import { UserTagger } from "./user-tagger";
import { Combobox } from "@/app/modules/components/combobox";
import { Tags } from "@/app/modules/components/tags";
import { useRequestDraftAutoSave } from "../hooks/useDraftAutoSave";
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

  const [isGenreSelectorOpen, setIsGenreSelectorOpen] = useState(false);
  const [isUserTaggerOpen, setIsUserTaggerOpen] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);

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

      {/* Genres */}
      <div
        className={
          isGenreSelectorOpen
            ? "rounded-[1.875rem] border border-[rgba(0,0,0,0.07)] flex flex-col gap-[0.62rem] w-full min-h-full border-t border-gray-200 px-[0.9375rem] py-[0.625rem]"
            : "flex justify-between items-center"
        }>
        {!isGenreSelectorOpen ? (
          <div className="flex justify-between w-full px-[0.625rem]">
            {genres.map((genre) => (
              <div key={genre} className="flex gap-[0.625rem]">
                <Tags text={genre} hashTag={false} onClick={() => {}} />
                <button
                  type="button"
                  onClick={() => updateGenres(genres.filter((g) => g !== genre))}
                  aria-label={`Remove ${genre} genre`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="10"
                    height="10"
                    viewBox="0 0 10 10"
                    fill="none">
                    <path
                      d="M0.30029 8.04125C0.107819 8.23373 -0.000310721 8.49477 -0.000310383 8.76697C-0.000310383 9.03916 0.107819 9.30021 0.30029 9.49268C0.492762 9.68516 0.75381 9.79328 1.02601 9.79328C1.2982 9.79328 1.55925 9.68516 1.75172 9.49268L4.89648 6.34792L8.04125 9.49268C8.23372 9.68516 8.49477 9.79328 8.76696 9.79328C9.03916 9.79328 9.30021 9.68516 9.49268 9.49268C9.68515 9.30021 9.79328 9.03916 9.79328 8.76697C9.79328 8.49477 9.68515 8.23373 9.49268 8.04125L6.34791 4.89649L9.49268 1.75173C9.68515 1.55925 9.79328 1.29821 9.79328 1.02601C9.79328 0.753815 9.68515 0.492767 9.49268 0.300296C9.30021 0.107824 9.03916 -0.00030525 8.76696 -0.000305219C8.49477 -0.000305535 8.23372 0.107824 8.04125 0.300296L4.89648 3.44506L1.75172 0.300296C1.55925 0.107824 1.2982 -0.000305535 1.02601 -0.000305219C0.753809 -0.00030525 0.492762 0.107824 0.30029 0.300296C0.107819 0.492767 -0.000310773 0.753815 -0.000310742 1.02601C-0.000310721 1.29821 0.107819 1.55925 0.30029 1.75173L3.44505 4.89649L0.30029 8.04125Z"
                      fill="#BABABA"
                    />
                  </svg>
                </button>
              </div>
            ))}
            <button
              type="button"
              className="flex items-center gap-[0.2125rem]"
              onClick={() => setIsGenreSelectorOpen(true)}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none">
                <path
                  d="M12 5V19M5 12H19"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Add genres
            </button>
          </div>
        ) : (
          <GenreSelector
            selectedGenres={genres}
            onGenresChange={updateGenres}
            isOpen={true}
            onClose={() => setIsGenreSelectorOpen(false)}
          />
        )}
      </div>

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
      <UserTagger
        selectedUsers={taggedUsers}
        onUsersChange={updateTaggedUsers}
        isOpen={isUserTaggerOpen}
        onClose={() => setIsUserTaggerOpen(false)}
      />
    </form>
  );
}
