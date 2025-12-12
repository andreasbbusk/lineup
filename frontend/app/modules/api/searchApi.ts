import { apiClient, handleApiError } from "@/app/modules/api/apiClient";

/**
 * Search API - Global Infrastructure
 *
 * Provides unified search functionality across all entity types.
 * These methods are reusable across the platform (search page, feed filters, discovery, etc.)
 */
export const searchApi = {
  // ============================================================================
  // Search Methods
  // ============================================================================

  /**
   * Search across all tabs (universal search method)
   *
   * @param query - Search query string
   * @param tab - Search tab type
   * @param limit - Maximum number of results to return
   * @param offset - Offset for pagination
   * @returns Search results based on selected tab
   */
  search: async (
    query: string = "",
    tab:
      | "for_you"
      | "people"
      | "collaborations"
      | "services"
      | "tags" = "for_you",
    limit: number = 20,
    offset: number = 0
  ) => {
    const { data, error, response } = await apiClient.GET("/search", {
      params: {
        query: {
          q: query,
          tab,
          limit,
          offset,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

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

  /**
   * Search for personalized results (For You tab)
   *
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Mixed search results from all entity types
   */
  searchForYou: async (query: string = "", limit: number = 20) => {
    const { data, error, response } = await apiClient.GET("/search", {
      params: {
        query: {
          q: query,
          tab: "for_you",
          limit,
          offset: 0,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  /**
   * Search for collaboration requests (Collaborations tab)
   *
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Search results for collaboration requests
   */
  searchCollaborations: async (query: string = "", limit: number = 20) => {
    const { data, error, response } = await apiClient.GET("/search", {
      params: {
        query: {
          q: query,
          tab: "collaborations",
          limit,
          offset: 0,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  /**
   * Search for services (Services tab)
   *
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Search results for services
   */
  searchServices: async (query: string = "", limit: number = 20) => {
    const { data, error, response } = await apiClient.GET("/search", {
      params: {
        query: {
          q: query,
          tab: "services",
          limit,
          offset: 0,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  /**
   * Search for tags (Tags tab)
   *
   * @param query - Search query string
   * @param limit - Maximum number of results to return
   * @returns Search results for tags
   */
  searchTags: async (query: string = "", limit: number = 20) => {
    const { data, error, response } = await apiClient.GET("/search", {
      params: {
        query: {
          q: query,
          tab: "tags",
          limit,
          offset: 0,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },
};
