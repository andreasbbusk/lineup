import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export type ContentType = "all" | "collaborations" | "services";

interface ServiceFiltersState {
  search: string;
  location: string;
  serviceTypes: string[];
  genres: string[];
  paidOpportunity: boolean;
  contentType: ContentType;
}

interface ServiceFiltersActions {
  setSearch: (search: string) => void;
  setLocation: (location: string) => void;
  setServiceTypes: (types: string[]) => void;
  setGenres: (genres: string[]) => void;
  setPaidOpportunity: (paid: boolean) => void;
  setContentType: (type: ContentType) => void;
  toggleServiceType: (type: string) => void;
  toggleGenre: (genre: string) => void;
  clearFilters: () => void;
}

const initialState: ServiceFiltersState = {
  search: "",
  location: "",
  serviceTypes: [],
  genres: [],
  paidOpportunity: false,
  contentType: "all",
};

export const useServiceFiltersStore = create<
  ServiceFiltersState & ServiceFiltersActions
>()(
  persist(
    (set) => ({
      ...initialState,

      setSearch: (search: string) => set({ search }),

      setLocation: (location: string) => set({ location }),

      setServiceTypes: (serviceTypes: string[]) => set({ serviceTypes }),

      setGenres: (genres: string[]) => set({ genres }),

      setPaidOpportunity: (paidOpportunity: boolean) =>
        set({ paidOpportunity }),

      setContentType: (contentType: ContentType) => set({ contentType }),

      toggleServiceType: (type: string) =>
        set((state) => ({
          serviceTypes: state.serviceTypes.includes(type)
            ? state.serviceTypes.filter((t) => t !== type)
            : [...state.serviceTypes, type],
        })),

      toggleGenre: (genre: string) =>
        set((state) => ({
          genres: state.genres.includes(genre)
            ? state.genres.filter((g) => g !== genre)
            : [...state.genres, genre],
        })),

      clearFilters: () => set(initialState),
    }),
    {
      name: "lineup-service-filters", // localStorage key
      storage: createJSONStorage(() => localStorage), // For web
      // Partial persistence - exclude search for better UX
      partialize: (state) => ({
        location: state.location,
        serviceTypes: state.serviceTypes,
        genres: state.genres,
        paidOpportunity: state.paidOpportunity,
        contentType: state.contentType,
        // Exclude search - users typically want fresh search on return
      }),
    }
  )
);