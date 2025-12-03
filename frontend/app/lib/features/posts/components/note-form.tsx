"use client";

import { useState } from "react";
import { Button } from "@/app/components/buttons";
// import { Tags } from "@/app/components/tags"; // Disabled - metadata not ready
import { MediaUploader } from "./media-uploader";
// import { TagSelector } from "./tag-selector"; // Disabled - metadata not ready
import { UserTagger } from "./user-tagger";
import type { UploadedMedia } from "../types";

interface NoteFormProps {
  onSubmit: (data: {
    title: string;
    description: string;
    tags?: string[];
    taggedUsers?: string[];
    media?: UploadedMedia[];
  }) => void;
  isSubmitting?: boolean;
}

export function NoteForm({ onSubmit, isSubmitting = false }: NoteFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [taggedUsers, setTaggedUsers] = useState<string[]>([]);
  const [media, setMedia] = useState<UploadedMedia[]>([]);
  const [isTagSelectorOpen, setIsTagSelectorOpen] = useState(false);
  const [isUserTaggerOpen, setIsUserTaggerOpen] = useState(false);

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
      tags: tags.length > 0 ? tags : undefined,
      taggedUsers: taggedUsers.length > 0 ? taggedUsers : undefined,
      media: media.length > 0 ? media : undefined,
    });
  };

  const remainingChars = 5000 - description.length;

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Write a title..."
          maxLength={100}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base placeholder:text-gray-400 focus:border-crocus-yellow focus:outline-none focus:ring-2 focus:ring-crocus-yellow/20"
        />
        <p className="mt-1 text-right text-sm text-gray-500">
          {title.length} / 100
        </p>
      </div>

      {/* Description */}
      <div>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Write a description..."
          rows={6}
          maxLength={5000}
          className="w-full rounded-lg border border-gray-300 px-4 py-3 text-base placeholder:text-gray-400 focus:border-crocus-yellow focus:outline-none focus:ring-2 focus:ring-crocus-yellow/20"
        />
        <p
          className={`mt-1 text-right text-sm ${
            remainingChars < 100 ? "text-red-500" : "text-gray-500"
          }`}
        >
          {remainingChars} characters remaining
        </p>
      </div>

      {/* Tags - DISABLED: Metadata endpoint not ready */}
      {/* 
      <div className="space-y-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setIsTagSelectorOpen(true)}
        >
          + Add tags
        </Button>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag) => (
              <Tags
                key={tag}
                text={tag}
                hashTag={true}
                selected={true}
                onClick={() => setTags(tags.filter((t) => t !== tag))}
              />
            ))}
          </div>
        )}
      </div>
      */}

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
      <MediaUploader media={media} onMediaChange={setMedia} />

      {/* Submit */}
      <div className="flex justify-end pt-4">
        <Button
          type="submit"
          variant="primary"
          disabled={isSubmitting || !title.trim() || description.trim().length < 10}
          onClick={() => {}} // Required by Button component, form handles submit
        >
          {isSubmitting ? "Posting..." : "Post"}
        </Button>
      </div>

      {/* Modals */}
      {/* TagSelector disabled - metadata not ready */}
      {/* 
      <TagSelector
        selectedTags={tags}
        onTagsChange={setTags}
        isOpen={isTagSelectorOpen}
        onClose={() => setIsTagSelectorOpen(false)}
      />
      */}

      <UserTagger
        selectedUsers={taggedUsers}
        onUsersChange={setTaggedUsers}
        isOpen={isUserTaggerOpen}
        onClose={() => setIsUserTaggerOpen(false)}
      />
    </form>
  );
}

