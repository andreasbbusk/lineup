import { apiClient, handleApiError } from "@/app/modules/api/apiClient";
import type { SaveRecentSearchDto } from "./types";

/**
 * Recent Searches API - Search Feature Specific
 *
 * These methods are only used by the search page feature.
 * Not intended for reuse across the platform.
 */
export const recentSearchesApi = {
  /**
   * Get recent searches for authenticated user
   *
   * @param limit - Maximum number of results to return
   * @returns Array of recent searches
   */
  getRecentSearches: async (limit: number = 15) => {
    const { data, error, response } = await apiClient.GET("/search/recent", {
      params: {
        query: {
          limit,
        },
      },
    });

    if (error) return handleApiError(error, response);
    return data;
  },

  /**
   * Save a recent search
   *
   * @param searchData - Search details to save
   */
  saveRecentSearch: async (searchData: SaveRecentSearchDto) => {
    const { error, response } = await apiClient.POST("/search/recent", {
      body: searchData,
    });

    if (error) return handleApiError(error, response);
  },

  /**
   * Delete a specific recent search
   *
   * @param id - The ID of the recent search to delete
   */
  deleteRecentSearch: async (id: string) => {
    const { error, response } = await apiClient.DELETE("/search/recent/{id}", {
      params: {
        path: { id },
      },
    });

    if (error) return handleApiError(error, response);
  },

  /**
   * Clear all recent searches
   */
  clearAllRecentSearches: async () => {
    const { error, response } = await apiClient.DELETE("/search/recent/clear");

    if (error) return handleApiError(error, response);
  },
};
