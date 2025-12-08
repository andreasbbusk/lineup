// src/entities/posts/posts.service.ts
import { getSupabaseClient, supabase, SupabaseClient } from "../../config/supabase.config.js";
import { CreatePostBody, PostsQueryDto } from "./posts.dto.js";
import { PostInsert, MediaType, PostRow } from "../../utils/supabase-helpers.js";
import { mapPostToResponse } from "./posts.mapper.js";
import { PostResponse, PaginatedResponse, CommentResponse } from "../../types/api.types.js";
import { createHttpError } from "../../utils/error-handler.js";
import { Database } from "../../types/supabase.js";
import { mapCommentsToResponse } from "../comments/comments.mapper.js";

export class PostsService {
  /**
   * Creates a new post with related metadata, media, and tagged users
   */
  async createPost(
    userId: string,
    postData: CreatePostBody,
    token: string
  ): Promise<PostResponse> {
    // Get authenticated Supabase client for RLS
    // This creates a lightweight client instance with the user's token
    const supabase = getSupabaseClient(token);
    const {
      type,
      title,
      description,
      tags,
      genres,
      location,
      paidOpportunity,
      expiresAt,
      taggedUsers,
      media,
    } = postData;

    // Insert the post
    const postInsert: PostInsert = {
      author_id: userId,
      type: type,
      title: title.trim(),
      description: description.trim(),
      location: location ?? null,
      paid_opportunity: type === "request" ? paidOpportunity ?? false : null,
      expires_at: expiresAt ?? null,
    };

    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert(postInsert)
      .select()
      .single();

    if (postError || !newPost) {
      throw createHttpError({
        message: `Failed to create post: ${postError?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    const postId = newPost.id;

    // Handle tags (for notes)
    if (type === "note" && Array.isArray(tags) && tags.length > 0) {
      const metadataPromises = tags
        .filter((tagName) => tagName?.trim())
        .map(async (tagName) => {
          // Find or create metadata
          const { data: existingMetadata } = await supabase
            .from("metadata")
            .select("id")
            .eq("type", "tag")
            .eq("name", tagName.trim())
            .single();

          let metadataId: string;

          if (existingMetadata) {
            metadataId = existingMetadata.id;
          } else {
            const { data: newMetadata, error: metadataError } = await supabase
              .from("metadata")
              .insert({
                type: "tag",
                name: tagName.trim(),
              })
              .select("id")
              .single();

            if (metadataError || !newMetadata) {
              throw createHttpError({
                message: `Failed to create metadata: ${metadataError?.message}`,
                statusCode: 500,
                code: "DATABASE_ERROR",
              });
            }
            metadataId = newMetadata.id;
          }

          // Link to post
          await supabase.from("post_metadata").insert({
            post_id: postId,
            metadata_id: metadataId,
          });
        });

      await Promise.all(metadataPromises);
    }

    // Handle genres (for requests)
    if (type === "request" && Array.isArray(genres) && genres.length > 0) {
      const metadataPromises = genres
        .filter((genreName) => genreName?.trim())
        .map(async (genreName) => {
          // Find or create metadata
          const { data: existingMetadata } = await supabase
            .from("metadata")
            .select("id")
            .eq("type", "genre")
            .eq("name", genreName.trim())
            .single();

          let metadataId: string;

          if (existingMetadata) {
            metadataId = existingMetadata.id;
          } else {
            const { data: newMetadata, error: metadataError } = await supabase
              .from("metadata")
              .insert({
                type: "genre",
                name: genreName.trim(),
              })
              .select("id")
              .single();

            if (metadataError || !newMetadata) {
              throw createHttpError({
                message: `Failed to create metadata: ${metadataError?.message}`,
                statusCode: 500,
                code: "DATABASE_ERROR",
              });
            }
            metadataId = newMetadata.id;
          }

          // Link to post
          await supabase.from("post_metadata").insert({
            post_id: postId,
            metadata_id: metadataId,
          });
        });

      await Promise.all(metadataPromises);
    }

    // Handle media
    if (Array.isArray(media) && media.length > 0) {
      const mediaPromises = media.map(async (item, index) => {
        if (!item?.url || !item?.type) return;

        // Insert media
        const { data: mediaRecord, error: mediaError } = await supabase
          .from("media")
          .insert({
            url: item.url,
            thumbnail_url: item.thumbnailUrl ?? null,
            type: item.type as MediaType,
          })
          .select("id")
          .single();

        if (mediaError || !mediaRecord) {
          throw createHttpError({
            message: `Failed to create media: ${mediaError?.message}`,
            statusCode: 500,
            code: "DATABASE_ERROR",
          });
        }

        // Link to post
        await supabase.from("post_media").insert({
          post_id: postId,
          media_id: mediaRecord.id,
          display_order: index,
        });
      });

      await Promise.all(mediaPromises);
    }

    // Handle tagged users
    if (Array.isArray(taggedUsers) && taggedUsers.length > 0) {
      const taggedUserPromises = taggedUsers
        .filter((id) => typeof id === "string")
        .map((taggedId) =>
          supabase.from("post_tagged_users").insert({
            post_id: postId,
            user_id: taggedId,
          })
        );

      await Promise.all(taggedUserPromises);
    }

    // Fetch complete post with relations
    const { data: completePost, error: fetchError } = await supabase
      .from("posts")
      .select(
        `
        *,
        author:profiles!posts_author_id_fkey(id, username, first_name, last_name, avatar_url),
        metadata:post_metadata(
          metadata:metadata(id, name, type)
        ),
        media:post_media(
          display_order,
          media:media(id, url, thumbnail_url, type)
        ),
        tagged_users:post_tagged_users(
          user:profiles!post_tagged_users_user_id_fkey(id, username, first_name, last_name, avatar_url)
        )
      `
      )
      .eq("id", postId)
      .single();

    if (fetchError || !completePost) {
      throw createHttpError({
        message: `Failed to fetch post: ${fetchError?.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    // Transform the response to match expected format
    return mapPostToResponse(completePost);
  }

  /**
   * List posts with filters and pagination
   * 
   * Returns a paginated list of posts with optional filters.
   * Supports public access (no auth required) but can include engagement data if authenticated.
   */
  async listPosts(
    query: PostsQueryDto,
    userId?: string,
    token?: string
  ): Promise<PaginatedResponse<PostResponse>> {
    // Use authenticated client if token provided, otherwise use public client
    const client = token ? getSupabaseClient(token) : supabase;

    const {
      type,
      authorId,
      cursor,
      limit = 20,
      includeEngagement = false,
      includeMedia = true,
      genreIds,
      tags,
      location,
      paidOnly,
    } = query;

    // Build the base query
    let postsQuery = client
      .from("posts")
      .select(
        `
        *,
        author:profiles!posts_author_id_fkey(id, username, first_name, last_name, avatar_url)${
          includeMedia
            ? `,
        metadata:post_metadata(
          metadata:metadata(id, name, type)
        ),
        media:post_media(
          display_order,
          media:media(id, url, thumbnail_url, type)
        ),
        tagged_users:post_tagged_users(
          user:profiles!post_tagged_users_user_id_fkey(id, username, first_name, last_name, avatar_url)
        )`
            : ""
        }
      `
      )
      .order("created_at", { ascending: false })
      .limit(limit + 1); // Fetch one extra to determine if there's a next page

    // Apply filters
    if (type) {
      postsQuery = postsQuery.eq("type", type);
    }

    if (authorId) {
      postsQuery = postsQuery.eq("author_id", authorId);
    }

    if (location) {
      postsQuery = postsQuery.ilike("location", `%${location}%`);
    }

    if (paidOnly !== undefined && type === "request") {
      postsQuery = postsQuery.eq("paid_opportunity", paidOnly);
    }

    // Apply cursor for pagination
    if (cursor) {
      postsQuery = postsQuery.lt("created_at", cursor);
    }

    // Execute the query
    const { data: posts, error: postsError } = await postsQuery;

    if (postsError) {
      throw createHttpError({
        message: `Failed to fetch posts: ${postsError.message}`,
        statusCode: 500,
        code: "DATABASE_ERROR",
      });
    }

    if (!posts || posts.length === 0) {
      return {
        data: [],
        pagination: {
          hasMore: false,
        },
      };
    }

    // Check if there's a next page
    const hasNextPage = posts.length > limit;
    const postsToReturn = (hasNextPage ? posts.slice(0, limit) : posts) as (PostRow & any)[];
    const nextCursor = hasNextPage
      ? (postsToReturn[postsToReturn.length - 1] as PostRow & any).created_at ?? undefined
      : undefined;

    // Filter by genres if provided
    let filteredPosts = postsToReturn;
    if (genreIds && genreIds.length > 0) {
      const postIdsWithGenres = await this.getPostIdsByGenreIds(
        genreIds,
        client
      );
      filteredPosts = postsToReturn.filter((post) =>
        postIdsWithGenres.has((post as PostRow & any).id)
      );
    }

    // Filter by tags if provided
    if (tags && tags.length > 0) {
      const postIdsWithTags = await this.getPostIdsByTagNames(tags, client);
      filteredPosts = filteredPosts.filter((post) =>
        postIdsWithTags.has((post as PostRow & any).id)
      );
    }

    // Map posts to response format
    const mappedPosts = filteredPosts.map((post) =>
      mapPostToResponse(post as PostRow & any)
    );

    // Optionally include engagement data if authenticated
    if (includeEngagement && userId && token) {
      const postIds = mappedPosts.map((p) => p.id);
      const engagementData = await this.getEngagementData(
        postIds,
        userId,
        token
      );

      // Add engagement data to posts
      mappedPosts.forEach((post) => {
        const engagement = engagementData.get(post.id);
        if (engagement) {
          (post as any).likesCount = engagement.likesCount;
          (post as any).commentsCount = engagement.commentsCount;
          (post as any).bookmarksCount = engagement.bookmarksCount;
          (post as any).hasLiked = engagement.hasLiked;
          (post as any).hasBookmarked = engagement.hasBookmarked;
        }
      });
    }

    return {
      data: mappedPosts,
      pagination: {
        nextCursor,
        hasMore: hasNextPage,
      },
    };
  }

  /**
   * Get post IDs that have the specified genre IDs
   */
  private async getPostIdsByGenreIds(
    genreIds: string[],
    client: SupabaseClient<Database>
  ): Promise<Set<string>> {
    const { data: postMetadata } = await client
      .from("post_metadata")
      .select("post_id")
      .in("metadata_id", genreIds);

    return new Set(postMetadata?.map((pm) => pm.post_id) || []);
  }

  /**
   * Get post IDs that have the specified tag names
   */
  private async getPostIdsByTagNames(
    tagNames: string[],
    client: SupabaseClient<Database>
  ): Promise<Set<string>> {
    // First, get metadata IDs for the tag names
    const { data: metadata } = await client
      .from("metadata")
      .select("id")
      .eq("type", "tag")
      .in("name", tagNames);

    if (!metadata || metadata.length === 0) {
      return new Set();
    }

    const metadataIds = metadata.map((m) => m.id);

    // Then get post IDs that have these metadata IDs
    const { data: postMetadata } = await client
      .from("post_metadata")
      .select("post_id")
      .in("metadata_id", metadataIds);

    return new Set(postMetadata?.map((pm) => pm.post_id) || []);
  }

  /**
   * Get engagement data (likes, comments, bookmarks) for posts
   */
  private async getEngagementData(
    postIds: string[],
    userId: string,
    token: string
  ): Promise<
    Map<
      string,
      {
        likesCount: number;
        commentsCount: number;
        bookmarksCount: number;
        hasLiked: boolean;
        hasBookmarked: boolean;
      }
    >
  > {
    const authedClient = getSupabaseClient(token);

    // Get likes
    const { data: likesData } = await authedClient
      .from("likes")
      .select("post_id, user_id")
      .in("post_id", postIds);

    // Get bookmarks
    const { data: bookmarksData } = await authedClient
      .from("bookmarks")
      .select("post_id, user_id")
      .in("post_id", postIds);

    // Get comments
    const { data: commentsData } = await authedClient
      .from("comments")
      .select("post_id")
      .in("post_id", postIds);

    // Build engagement maps
    const engagementMap = new Map<
      string,
      {
        likesCount: number;
        commentsCount: number;
        bookmarksCount: number;
        hasLiked: boolean;
        hasBookmarked: boolean;
      }
    >();

    // Initialize all posts
    postIds.forEach((postId) => {
      engagementMap.set(postId, {
        likesCount: 0,
        commentsCount: 0,
        bookmarksCount: 0,
        hasLiked: false,
        hasBookmarked: false,
      });
    });

    // Count likes and check if user liked
    likesData?.forEach((like) => {
      const engagement = engagementMap.get(like.post_id);
      if (engagement) {
        engagement.likesCount++;
        if (like.user_id === userId) {
          engagement.hasLiked = true;
        }
      }
    });

    // Count bookmarks and check if user bookmarked
    bookmarksData?.forEach((bookmark) => {
      const engagement = engagementMap.get(bookmark.post_id);
      if (engagement) {
        engagement.bookmarksCount++;
        if (bookmark.user_id === userId) {
          engagement.hasBookmarked = true;
        }
      }
    });

    // Count comments
    commentsData?.forEach((comment) => {
      const engagement = engagementMap.get(comment.post_id);
      if (engagement) {
        engagement.commentsCount++;
      }
    });

    return engagementMap;
  }

  /**
   * Get a single post by ID
   * 
   * Returns a post with full details including author, metadata, media, and tagged users.
   * Can optionally include comments and engagement data.
   */
  async getPostById(
    postId: string,
    options: {
      includeComments?: boolean;
      commentsLimit?: number;
    } = {},
    userId?: string,
    token?: string
  ): Promise<
    PostResponse & {
      comments?: CommentResponse[];
      likesCount?: number;
      commentsCount?: number;
      bookmarksCount?: number;
      hasLiked?: boolean;
      hasBookmarked?: boolean;
    }
  > {
    const { includeComments = false, commentsLimit = 50 } = options;

    // Use authenticated client if token provided, otherwise use public client
    const client = token ? getSupabaseClient(token) : supabase;

    // Fetch the post with all relations
    const { data: post, error: postError } = await client
      .from("posts")
      .select(
        `
        *,
        author:profiles!posts_author_id_fkey(id, username, first_name, last_name, avatar_url),
        metadata:post_metadata(
          metadata:metadata(id, name, type)
        ),
        media:post_media(
          display_order,
          media:media(id, url, thumbnail_url, type)
        ),
        tagged_users:post_tagged_users(
          user:profiles!post_tagged_users_user_id_fkey(id, username, first_name, last_name, avatar_url)
        )
      `
      )
      .eq("id", postId)
      .single();

    if (postError || !post) {
      throw createHttpError({
        message: `Post not found: ${postError?.message || "Post does not exist"}`,
        statusCode: 404,
        code: "NOT_FOUND",
      });
    }

    // Map post to response format
    const mappedPost = mapPostToResponse(post as PostRow & any);

    // Optionally include comments
    let comments: any[] | undefined;
    if (includeComments) {
      const { data: commentsData, error: commentsError } = await client
        .from("comments")
        .select(
          `
          *,
          author:profiles!comments_author_id_fkey(
            id,
            username,
            first_name,
            last_name,
            avatar_url
          )
        `
        )
        .eq("post_id", postId)
        .order("created_at", { ascending: true })
        .limit(commentsLimit);

      if (!commentsError && commentsData) {
        // Map comments to response format using the comments mapper
        comments = mapCommentsToResponse(commentsData as any);
      }
    }

    // Optionally include engagement data if authenticated
    if (userId && token) {
      const engagementData = await this.getEngagementData(
        [postId],
        userId,
        token
      );
      const engagement = engagementData.get(postId);

      if (engagement) {
        return {
          ...mappedPost,
          comments,
          likesCount: engagement.likesCount,
          commentsCount: engagement.commentsCount,
          bookmarksCount: engagement.bookmarksCount,
          hasLiked: engagement.hasLiked,
          hasBookmarked: engagement.hasBookmarked,
        };
      }
    }

    // If engagement data not requested or not authenticated, return without it
    return {
      ...mappedPost,
      comments,
    };
  }
}
