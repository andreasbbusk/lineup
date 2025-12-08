// Service for user details (social media, FAQ, looking for)
import {
  createAuthenticatedClient,
  supabase,
} from "../../config/supabase.config.js";
import { createHttpError } from "../../utils/error-handler.js";
import {
  UserSocialMediaResponse,
  UserFaqResponse,
  UserLookingForResponse,
  FaqQuestionResponse,
} from "../../types/api.types.js";
import { UpdateSocialMediaDto, UpsertFaqDto } from "./user-details.dto.js";

export class UserDetailsService {
  /**
   * Get user's social media links
   */
  async getUserSocialMedia(userId: string): Promise<UserSocialMediaResponse> {
    const { data, error } = await supabase
      .from("user_social_media")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") {
      // PGRST116 = not found (which is ok, means no social media yet)
      throw createHttpError({
        message: "Failed to fetch social media",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }

    // Return empty object if no social media found
    if (!data) {
      return {
        userId,
        instagram: null,
        twitter: null,
        facebook: null,
        youtube: null,
        soundcloud: null,
        tiktok: null,
        bandcamp: null,
      };
    }

    return {
      userId: data.user_id,
      instagram: data.instagram,
      twitter: data.twitter,
      facebook: data.facebook,
      youtube: data.youtube,
      soundcloud: data.soundcloud,
      tiktok: data.tiktok,
      bandcamp: data.bandcamp,
    };
  }

  /**
   * Update user's social media links
   */
  async updateUserSocialMedia(
    userId: string,
    updates: UpdateSocialMediaDto,
    token: string
  ): Promise<UserSocialMediaResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // Upsert social media (insert or update)
    const { data, error } = await authedSupabase
      .from("user_social_media")
      .upsert(
        {
          user_id: userId,
          instagram: updates.instagram,
          twitter: updates.twitter,
          facebook: updates.facebook,
          youtube: updates.youtube,
          soundcloud: updates.soundcloud,
          tiktok: updates.tiktok,
          bandcamp: updates.bandcamp,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )
      .select()
      .single();

    if (error || !data) {
      throw createHttpError({
        message: "Failed to update social media",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }

    return {
      userId: data.user_id,
      instagram: data.instagram,
      twitter: data.twitter,
      facebook: data.facebook,
      youtube: data.youtube,
      soundcloud: data.soundcloud,
      tiktok: data.tiktok,
      bandcamp: data.bandcamp,
    };
  }

  /**
   * Get user's FAQ answers with questions
   */
  async getUserFaq(userId: string): Promise<UserFaqResponse[]> {
    console.log("=== getUserFaq called for userId:", userId);
    
    // Get user's FAQ answers with questions using JOIN
    const { data, error } = await supabase
      .from("user_faq")
      .select(
        `
        id,
        question_id,
        answer,
        created_at,
        faq_questions!user_faq_question_id_fkey (
          id,
          question,
          display_order
        )
      `
      )
      .eq("user_id", userId);
    
    console.log("=== getUserFaq query result - error:", error, "data length:", data?.length);

    if (error) {
      console.error("FAQ fetch error:", error);
      throw createHttpError({
        message: "Failed to fetch FAQ",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }

    if (!data || data.length === 0) {
      return [];
    }

    // Debug: Log the raw data to see the structure
    console.log("FAQ data from DB:", JSON.stringify(data, null, 2));
    
    // Debug: Check if questions exist in the database
    const questionIds = data.map(faq => faq.question_id);
    console.log("Looking for question IDs:", questionIds);
    
    const { data: questionsCheck, error: questionsError } = await supabase
      .from("faq_questions")
      .select("*")
      .in("id", questionIds);
    
    console.log("Questions found in DB:", JSON.stringify(questionsCheck, null, 2));
    console.log("Questions error:", questionsError);
    
    // Check what questions actually exist
    const { data: allQuestions } = await supabase
      .from("faq_questions")
      .select("*");
    console.log("ALL questions in faq_questions table:", JSON.stringify(allQuestions, null, 2));

    // Map and sort by display_order
    return data
      .map(faq => {
        console.log("Processing FAQ:", faq.id, "faq_questions:", faq.faq_questions);
        return {
          id: faq.id,
          questionId: faq.question_id,
          question: (faq.faq_questions as any)?.question || "Question not found",
          answer: faq.answer,
          createdAt: faq.created_at,
          displayOrder: (faq.faq_questions as any)?.display_order ?? 999,
        };
      })
      .sort((a, b) => a.displayOrder - b.displayOrder)
      .map(({ displayOrder, ...rest }) => rest);
  }

  /**
   * Upsert (create or update) user's FAQ answer
   */
  async upsertUserFaq(
    userId: string,
    faqData: UpsertFaqDto,
    token: string
  ): Promise<UserFaqResponse> {
    const authedSupabase = createAuthenticatedClient(token);

    // First check if question exists
    const { data: question } = await supabase
      .from("faq_questions")
      .select("*")
      .eq("id", faqData.questionId)
      .single();

    if (!question) {
      throw createHttpError({
        message: "Question not found",
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Upsert the FAQ answer
    const { data, error } = await authedSupabase
      .from("user_faq")
      .upsert(
        {
          user_id: userId,
          question_id: faqData.questionId,
          answer: faqData.answer,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id,question_id" }
      )
      .select(
        `
        id,
        question_id,
        answer,
        created_at,
        faq_questions (
          id,
          question
        )
      `
      )
      .single();

    if (error || !data) {
      throw createHttpError({
        message: "Failed to save FAQ answer",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }

    return {
      id: data.id,
      questionId: data.question_id,
      question: (data.faq_questions as any).question,
      answer: data.answer,
      createdAt: data.created_at,
    };
  }

  /**
   * Delete user's FAQ answer
   */
  async deleteUserFaq(
    userId: string,
    questionId: string,
    token: string
  ): Promise<void> {
    const authedSupabase = createAuthenticatedClient(token);

    const { error } = await authedSupabase
      .from("user_faq")
      .delete()
      .eq("user_id", userId)
      .eq("question_id", questionId);

    if (error) {
      throw createHttpError({
        message: "Failed to delete FAQ answer",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }
  }

  /**
   * Get what user is looking for
   */
  async getUserLookingFor(userId: string): Promise<UserLookingForResponse[]> {
    const { data, error } = await supabase
      .from("user_looking_for")
      .select("looking_for_value")
      .eq("user_id", userId);

    if (error) {
      throw createHttpError({
        message: "Failed to fetch looking for preferences",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }

    return (data || []).map((item) => ({
      userId,
      lookingForValue: item.looking_for_value,
    }));
  }

  /**
   * Get all available FAQ questions
   */
  async getAllFaqQuestions(): Promise<FaqQuestionResponse[]> {
    const { data, error } = await supabase
      .from("faq_questions")
      .select("*")
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      throw createHttpError({
        message: "Failed to fetch FAQ questions",
        statusCode: 500,
        code: "DATABASE_ERROR",
        details: error,
      });
    }

    return (data || []).map((question) => ({
      id: question.id,
      question: question.question,
      displayOrder: question.display_order,
      isActive: question.is_active ?? true,
    }));
  }
}
