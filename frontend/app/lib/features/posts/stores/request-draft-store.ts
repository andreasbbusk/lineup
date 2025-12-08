import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { UploadedMedia } from "../types";

interface RequestDraftState {
  title: string;
  description: string;
  location: string;
  genres: string[];
  paidOpportunity: boolean;
  taggedUsers: string[];
  media: UploadedMedia[];
  lastSaved: number | null;
}

interface RequestDraftActions {
  updateTitle: (title: string) => void;
  updateDescription: (description: string) => void;
  updateLocation: (location: string) => void;
  updateGenres: (genres: string[]) => void;
  updatePaidOpportunity: (paid: boolean) => void;
  updateTaggedUsers: (users: string[]) => void;
  updateMedia: (media: UploadedMedia[]) => void;
  clearDraft: () => void;
  getDraft: () => RequestDraftState;
}

const initialState: RequestDraftState = {
  title: "",
  description: "",
  location: "",
  genres: [],
  paidOpportunity: false,
  taggedUsers: [],
  media: [],
  lastSaved: null,
};

export const useRequestDraftStore = create<
  RequestDraftState & RequestDraftActions
>()(
  persist(
    (set, get) => ({
      ...initialState,

      updateTitle: (title: string) =>
        set({ title, lastSaved: Date.now() }),

      updateDescription: (description: string) =>
        set({ description, lastSaved: Date.now() }),

      updateLocation: (location: string) =>
        set({ location, lastSaved: Date.now() }),

      updateGenres: (genres: string[]) =>
        set({ genres, lastSaved: Date.now() }),

      updatePaidOpportunity: (paidOpportunity: boolean) =>
        set({ paidOpportunity, lastSaved: Date.now() }),

      updateTaggedUsers: (taggedUsers: string[]) =>
        set({ taggedUsers, lastSaved: Date.now() }),

      updateMedia: (media: UploadedMedia[]) =>
        set({ media, lastSaved: Date.now() }),

      clearDraft: () => set(initialState),

      getDraft: () => {
        const state = get();
        return {
          title: state.title,
          description: state.description,
          location: state.location,
          genres: state.genres,
          paidOpportunity: state.paidOpportunity,
          taggedUsers: state.taggedUsers,
          media: state.media,
          lastSaved: state.lastSaved,
        };
      },
    }),
    {
      name: "lineup_request_draft",
      storage: createJSONStorage(() =>
        typeof window !== "undefined"
          ? localStorage
          : { getItem: () => null, setItem: () => {}, removeItem: () => {} }
      ),
    }
  )
);

