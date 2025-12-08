import { useEffect, useCallback, useRef } from "react";
import { useNoteDraftStore } from "../stores/note-draft-store";
import { useRequestDraftStore } from "../stores/request-draft-store";
import { storeMediaBlob, getMediaBlob } from "@/app/lib/utils/indexeddb";
import type { UploadedMedia } from "../types";

const DEBOUNCE_MS = 500;

/**
 * Hook for auto-saving note drafts
 */
export function useNoteDraftAutoSave() {
  const store = useNoteDraftStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save media blobs to IndexedDB when media changes
  useEffect(() => {
    const saveMediaBlobs = async () => {
      for (const media of store.media) {
        try {
          // Check if blob already exists
          const existing = await getMediaBlob(media.url);
          if (existing) continue;

          // Fetch the media file and store as blob
          const response = await fetch(media.url);
          if (response.ok) {
            const blob = await response.blob();
            await storeMediaBlob(
              media.url,
              media.type,
              media.thumbnailUrl || null,
              blob
            );
          }
        } catch (error) {
          console.error("Failed to save media blob:", error);
        }
      }
    };

    if (store.media.length > 0) {
      saveMediaBlobs();
    }
  }, [store.media]);

  const debouncedUpdate = useCallback(
    <T,>(updater: (value: T) => void, value: T) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updater(value);
      }, DEBOUNCE_MS);
    },
    []
  );

  return {
    title: store.title,
    description: store.description,
    tags: store.tags,
    taggedUsers: store.taggedUsers,
    media: store.media,
    updateTitle: (title: string) => debouncedUpdate(store.updateTitle, title),
    updateDescription: (description: string) =>
      debouncedUpdate(store.updateDescription, description),
    updateTags: (tags: string[]) => debouncedUpdate(store.updateTags, tags),
    updateTaggedUsers: (users: string[]) =>
      debouncedUpdate(store.updateTaggedUsers, users),
    updateMedia: (media: UploadedMedia[]) => store.updateMedia(media), // No debounce for media
    clearDraft: store.clearDraft,
    restoreDraft: useCallback(async () => {
      const draft = store.getDraft();
      
      // Restore media from IndexedDB if URLs are stored but blobs exist
      // Note: Media URLs from Supabase are already persisted in the store
      // This is mainly for handling cases where we need to restore blob URLs
      const restoredMedia: UploadedMedia[] = [];
      for (const mediaItem of draft.media) {
        try {
          // Try to get blob from IndexedDB (for draft media that hasn't been uploaded yet)
          const blobData = await getMediaBlob(mediaItem.url);
          if (blobData) {
            // Create object URL from blob for preview
            const objectUrl = URL.createObjectURL(blobData.blob);
            restoredMedia.push({
              url: objectUrl,
              type: blobData.type,
              thumbnailUrl: blobData.thumbnailUrl,
            });
          } else {
            // If blob doesn't exist, use the original URL (likely already uploaded to Supabase)
            restoredMedia.push(mediaItem);
          }
        } catch (error) {
          console.error("Failed to restore media:", error);
          // Fallback to original media
          restoredMedia.push(mediaItem);
        }
      }

      // Update store with restored media if different
      if (restoredMedia.length !== draft.media.length || 
          restoredMedia.some((m, i) => m.url !== draft.media[i]?.url)) {
        store.updateMedia(restoredMedia);
      }

      return {
        ...draft,
        media: restoredMedia,
      };
    }, [store]),
  };
}

/**
 * Hook for auto-saving request drafts
 */
export function useRequestDraftAutoSave() {
  const store = useRequestDraftStore();
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Save media blobs to IndexedDB when media changes
  useEffect(() => {
    const saveMediaBlobs = async () => {
      for (const media of store.media) {
        try {
          // Check if blob already exists
          const existing = await getMediaBlob(media.url);
          if (existing) continue;

          // Fetch the media file and store as blob
          const response = await fetch(media.url);
          if (response.ok) {
            const blob = await response.blob();
            await storeMediaBlob(
              media.url,
              media.type,
              media.thumbnailUrl || null,
              blob
            );
          }
        } catch (error) {
          console.error("Failed to save media blob:", error);
        }
      }
    };

    if (store.media.length > 0) {
      saveMediaBlobs();
    }
  }, [store.media]);

  const debouncedUpdate = useCallback(
    <T,>(updater: (value: T) => void, value: T) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        updater(value);
      }, DEBOUNCE_MS);
    },
    []
  );

  return {
    title: store.title,
    description: store.description,
    location: store.location,
    genres: store.genres,
    paidOpportunity: store.paidOpportunity,
    taggedUsers: store.taggedUsers,
    media: store.media,
    updateTitle: (title: string) => debouncedUpdate(store.updateTitle, title),
    updateDescription: (description: string) =>
      debouncedUpdate(store.updateDescription, description),
    updateLocation: (location: string) =>
      debouncedUpdate(store.updateLocation, location),
    updateGenres: (genres: string[]) =>
      debouncedUpdate(store.updateGenres, genres),
    updatePaidOpportunity: (paid: boolean) =>
      debouncedUpdate(store.updatePaidOpportunity, paid),
    updateTaggedUsers: (users: string[]) =>
      debouncedUpdate(store.updateTaggedUsers, users),
    updateMedia: (media: UploadedMedia[]) => store.updateMedia(media), // No debounce for media
    clearDraft: store.clearDraft,
    restoreDraft: useCallback(async () => {
      const draft = store.getDraft();
      
      // Restore media from IndexedDB if URLs are stored but blobs exist
      // Note: Media URLs from Supabase are already persisted in the store
      // This is mainly for handling cases where we need to restore blob URLs
      const restoredMedia: UploadedMedia[] = [];
      for (const mediaItem of draft.media) {
        try {
          // Try to get blob from IndexedDB (for draft media that hasn't been uploaded yet)
          const blobData = await getMediaBlob(mediaItem.url);
          if (blobData) {
            // Create object URL from blob for preview
            const objectUrl = URL.createObjectURL(blobData.blob);
            restoredMedia.push({
              url: objectUrl,
              type: blobData.type,
              thumbnailUrl: blobData.thumbnailUrl,
            });
          } else {
            // If blob doesn't exist, use the original URL (likely already uploaded to Supabase)
            restoredMedia.push(mediaItem);
          }
        } catch (error) {
          console.error("Failed to restore media:", error);
          // Fallback to original media
          restoredMedia.push(mediaItem);
        }
      }

      // Update store with restored media if different
      if (restoredMedia.length !== draft.media.length || 
          restoredMedia.some((m, i) => m.url !== draft.media[i]?.url)) {
        store.updateMedia(restoredMedia);
      }

      return {
        ...draft,
        media: restoredMedia,
      };
    }, [store]),
  };
}

