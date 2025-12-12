import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UploadedMedia } from "../types";

interface TaggedUser {
  id: string;
  username: string;
  firstName?: string | null;
  lastName?: string | null;
  avatarUrl?: string | null;
}

interface NoteDraftState {
  title: string;
  description: string;
  tags: string[];
  taggedUsers: string[];
  taggedUserObjects: TaggedUser[];
  media: UploadedMedia[];
  lastSaved: number | null;
}

interface NoteDraftActions {
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateTags: (tags: string[]) => void;
  updateTaggedUsers: (users: string[]) => void;
  updateTaggedUserObjects: (users: TaggedUser[]) => void;
  updateMedia: (media: UploadedMedia[]) => void;
  clearDraft: () => void;
  getDraft: () => NoteDraftState;
}

const initialState: NoteDraftState = {
  title: "",
  description: "",
  tags: [],
  taggedUsers: [],
  taggedUserObjects: [],
  media: [],
  lastSaved: null,
};

export const useNoteDraftStore = create<NoteDraftState & NoteDraftActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateTitle: (title: string) =>
        set({ title, lastSaved: Date.now() }),

      updateDescription: (description: string) =>
        set({ description, lastSaved: Date.now() }),

      updateTags: (tags: string[]) =>
        set({ tags, lastSaved: Date.now() }),

      updateTaggedUsers: (taggedUsers: string[]) =>
        set({ taggedUsers, lastSaved: Date.now() }),

      updateTaggedUserObjects: (taggedUserObjects: TaggedUser[]) =>
        set({ taggedUserObjects, lastSaved: Date.now() }),

      updateMedia: (media: UploadedMedia[]) =>
        set({ media, lastSaved: Date.now() }),

      clearDraft: () => set(initialState),

      getDraft: () => {
        const state = get();
        return {
          title: state.title,
          description: state.description,
          tags: state.tags,
          taggedUsers: state.taggedUsers,
          taggedUserObjects: state.taggedUserObjects,
          media: state.media,
          lastSaved: state.lastSaved,
        };
      },
    }),
    {
      name: "lineup_note_draft",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);

