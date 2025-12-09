import { apiClient, handleApiError } from "@/app/modules/api/apiClient";

/**
 * Search API
 *
 * NOTE: This currently only implements the "people" tab search functionality.
 * The backend /search endpoint supports multiple tabs:
 * - "people" (implemented)
 * - "for-you" (TODO)
 * - "collaborations" (TODO)
 * - "services" (TODO)
 * - "tags" (TODO)
 *
 * Future implementation should add methods for each tab type and handle
 * their specific result types and filters.
 */
export const searchApi = {
  /**
   * Search for users (People tab)
   *
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Search results for people
   */
  searchUsers: async (query: string = "", limit: number = 50) => {
    const { data, error, response } = await apiClient.GET("/search", {
      params: {
        query: {
          q: query,
          tab: "people",
          limit,
          offset: 0,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  // TODO: Implement remaining search tabs
  // searchForYou: async (query: string = "", limit: number = 50) => { ... }
  // searchCollaborations: async (query: string = "", limit: number = 50) => { ... }
  // searchServices: async (query: string = "", limit: number = 50) => { ... }
  // searchTags: async (query: string = "", limit: number = 50) => { ... }
};
