import { apiClient, handleApiError } from "../../api/api-client";
import type { components } from "@/app/lib/types/api";

// Export types from generated schema
export type UserProfile = components["schemas"]["UserProfile"];
export type ProfileUpdateRequest = components["schemas"]["UpdateProfileDto"];
export type CollaborationResponse = components["schemas"]["CollaborationResponse"];
export type ReviewResponse = components["schemas"]["ReviewResponse"];
export type UserSocialMediaResponse = components["schemas"]["UserSocialMediaResponse"];
export type UserFaqResponse = components["schemas"]["UserFaqResponse"];
export type FaqQuestionResponse = components["schemas"]["FaqQuestionResponse"];
export type UserLookingForResponse = components["schemas"]["UserLookingForResponse"];

/**
 * Get user profile by username
 * Public endpoint - returns public data unless viewing own profile
 */
export async function getUserProfile(username: string): Promise<UserProfile> {
  const { data, error, response } = await apiClient.GET("/users/{username}", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data;
}

/**
 * Update user profile
 * Requires authentication
 */
export async function updateUserProfile(
  username: string,
  updates: ProfileUpdateRequest
): Promise<UserProfile> {

  const { data, error, response } = await apiClient.PUT("/users/{username}", {
    params: {
      path: { username },
    },
    body: updates,
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Get user's collaborations by user ID
 * Public endpoint - returns all collaborations for a user
 */
export async function getUserCollaborations(userId: string): Promise<CollaborationResponse[]> {
  const { data, error, response } = await apiClient.GET("/collaborations/{userId}", {
    params: {
      path: { userId },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data || [];
}

/**
 * Delete a collaboration
 * Requires authentication
 */
export async function deleteCollaboration(collaborationId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/collaborations/{collaborationId}", {
    params: {
      path: { collaborationId },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Get user's reviews by username
 * Public endpoint - returns all reviews for a user
 */
export async function getUserReviews(username: string): Promise<ReviewResponse[]> {
  const { data, error, response } = await apiClient.GET("/users/{username}/reviews", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data || [];
}

/**
 * Get user's social media links by username
 * Public endpoint - returns all social media links for a user
 */
export async function getUserSocialMedia(username: string): Promise<UserSocialMediaResponse> {
  const { data, error, response } = await apiClient.GET("/users/{username}/social-media", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data;
}

/**
 * Update user's social media links
 * Requires authentication
 */
export async function updateUserSocialMedia(
  username: string,
  updates: Partial<Omit<UserSocialMediaResponse, 'userId'>>
): Promise<UserSocialMediaResponse> {
  const { data, error, response } = await apiClient.PUT("/users/{username}/social-media", {
    params: {
      path: { username },
    },
    body: updates,
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Get user's FAQ answers by username
 * Public endpoint - returns all FAQ answers with questions for a user
 */
export async function getUserFaq(username: string): Promise<UserFaqResponse[]> {
  const { data, error, response } = await apiClient.GET("/users/{username}/faq", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data || [];
}

/**
 * Create or update user's FAQ answer
 * Requires authentication
 */
export async function upsertUserFaq(
  username: string,
  faqData: { questionId: string; answer: string }
): Promise<UserFaqResponse> {
  const { data, error, response } = await apiClient.POST("/users/{username}/faq", {
    params: {
      path: { username },
    },
    body: faqData,
  });

  if (error) {
    handleApiError(error, response);
  }

  if (!data) {
    throw new Error("No data returned from API");
  }

  return data;
}

/**
 * Delete user's FAQ answer
 * Requires authentication
 */
export async function deleteUserFaq(username: string, questionId: string): Promise<void> {
  const { error, response } = await apiClient.DELETE("/users/{username}/faq/{questionId}", {
    params: {
      path: { username, questionId },
    },
  });

  if (error) {
    handleApiError(error, response);
  }
}

/**
 * Get user's looking for preferences by username
 * Public endpoint - returns what the user is looking for
 */
export async function getUserLookingFor(username: string): Promise<UserLookingForResponse[]> {
  const { data, error, response } = await apiClient.GET("/users/{username}/looking-for", {
    params: {
      path: { username },
    },
  });

  if (error) {
    handleApiError(error, response);
  }

  return data || [];
}

/**
 * Get all available FAQ questions
 * Public endpoint - returns all active FAQ questions
 */
export async function getAllFaqQuestions(): Promise<FaqQuestionResponse[]> {
  const { data, error, response } = await apiClient.GET("/faq-questions");

  if (error) {
    handleApiError(error, response);
  }

  return data || [];
}
