import { useEffect, useCallback } from "react";
import { useNoteDraftStore } from "../stores/noteDraftStore";
import { useRequestDraftStore } from "../stores/requestDraftStore";
import { storeMediaBlob, getMediaBlob } from "@/app/modules/utils/indexeddb";
import type { UploadedMedia } from "../types";

/**
 * Hook for auto-saving note drafts
 */
export function useNoteDraftAutoSave() {
  const store = useNoteDraftStore();

  // Save media blobs to IndexedDB when media changes
  // Only save if media has File objects (draft media with blob URLs)
  useEffect(() => {
    const saveMediaBlobs = async () => {
      for (const media of store.media) {
        try {
          // Only save if it's a draft media (has File object and blob URL)
          // Don't fetch from Supabase URLs - those are already uploaded
          if (!media.file || !media.url.startsWith("blob:")) {
            continue;
          }

          // Check if blob already exists
          const existing = await getMediaBlob(media.url);
          if (existing) continue;

          // Get blob from File object directly (no need to fetch)
          const blob = new Blob([media.file], { type: media.file.type });
          await storeMediaBlob(
            media.url,
            media.type,
            media.thumbnailUrl || null,
            blob
          );
        } catch (error) {
          console.error("Failed to save media blob:", error);
        }
      }
    };

    if (store.media.length > 0) {
      saveMediaBlobs();
    }
  }, [store.media]);

  // Update store immediately for responsive UI, but debounce persistence
  // Zustand's persist middleware will handle localStorage writes
  // We update immediately so typing feels instant
  return {
    title: store.title,
    description: store.description,
    tags: store.tags,
    taggedUsers: store.taggedUsers,
    taggedUserObjects: store.taggedUserObjects,
    media: store.media,
    updateTitle: (title: string) => store.updateTitle(title),
    updateDescription: (description: string) =>
      store.updateDescription(description),
    updateTags: (tags: string[]) => store.updateTags(tags),
    updateTaggedUsers: (users: string[]) => store.updateTaggedUsers(users),
    updateTaggedUserObjects: (users: any[]) => store.updateTaggedUserObjects(users),
    updateMedia: (media: UploadedMedia[]) => store.updateMedia(media),
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
      if (
        restoredMedia.length !== draft.media.length ||
        restoredMedia.some((m, i) => m.url !== draft.media[i]?.url)
      ) {
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

  // Save media blobs to IndexedDB when media changes
  // Only save if media has File objects (draft media with blob URLs)
  useEffect(() => {
    const saveMediaBlobs = async () => {
      for (const media of store.media) {
        try {
          // Only save if it's a draft media (has File object and blob URL)
          // Don't fetch from Supabase URLs - those are already uploaded
          if (!media.file || !media.url.startsWith("blob:")) {
            continue;
          }

          // Check if blob already exists
          const existing = await getMediaBlob(media.url);
          if (existing) continue;

          // Get blob from File object directly (no need to fetch)
          const blob = new Blob([media.file], { type: media.file.type });
          await storeMediaBlob(
            media.url,
            media.type,
            media.thumbnailUrl || null,
            blob
          );
        } catch (error) {
          console.error("Failed to save media blob:", error);
        }
      }
    };

    if (store.media.length > 0) {
      saveMediaBlobs();
    }
  }, [store.media]);

  // Update store immediately for responsive UI, but debounce persistence
  // Zustand's persist middleware will handle localStorage writes
  // We update immediately so typing feels instant
  return {
    title: store.title,
    description: store.description,
    location: store.location,
    genres: store.genres,
    paidOpportunity: store.paidOpportunity,
    taggedUsers: store.taggedUsers,
    media: store.media,
    updateTitle: (title: string) => store.updateTitle(title),
    updateDescription: (description: string) =>
      store.updateDescription(description),
    updateLocation: (location: string) => store.updateLocation(location),
    updateGenres: (genres: string[]) => store.updateGenres(genres),
    updatePaidOpportunity: (paid: boolean) => store.updatePaidOpportunity(paid),
    updateTaggedUsers: (users: string[]) => store.updateTaggedUsers(users),
    updateMedia: (media: UploadedMedia[]) => store.updateMedia(media),
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
      if (
        restoredMedia.length !== draft.media.length ||
        restoredMedia.some((m, i) => m.url !== draft.media[i]?.url)
      ) {
        store.updateMedia(restoredMedia);
      }

      return {
        ...draft,
        media: restoredMedia,
      };
    }, [store]),
  };
}
