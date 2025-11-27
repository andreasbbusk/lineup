// src/entities/posts/posts.service.ts
import { supabase } from "../../config/supabase.js";
import { CreatePostBody } from "./posts.dto.js";
import {
  PostRow,
  PostInsert,
  PostType,
  MediaType,
} from "../../utils/supabase-helpers.js";
import { mapPostToResponse } from "../../utils/mappers/index.js";

export class PostsService {
  /**
   * Creates a new post with related metadata, media, and tagged users
   */
  async createPost(
    userId: string,
    postData: CreatePostBody
  ): Promise<
    PostRow & {
      metadata?: any[];
      media?: any[];
      tagged_users?: any[];
      author?: any;
    }
  > {
    const {
      type,
      title,
      description,
      tags,
      genres,
      location,
      paid_opportunity,
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
      paid_opportunity: type === "request" ? paid_opportunity ?? false : null,
    };

    const { data: newPost, error: postError } = await supabase
      .from("posts")
      .insert(postInsert)
      .select()
      .single();

    if (postError || !newPost) {
      throw new Error(`Failed to create post: ${postError?.message}`);
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
              throw new Error(
                `Failed to create metadata: ${metadataError?.message}`
              );
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
              throw new Error(
                `Failed to create metadata: ${metadataError?.message}`
              );
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
            thumbnail_url: item.thumbnail_url ?? null,
            type: item.type as MediaType,
          })
          .select("id")
          .single();

        if (mediaError || !mediaRecord) {
          throw new Error(`Failed to create media: ${mediaError?.message}`);
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
      throw new Error(`Failed to fetch post: ${fetchError?.message}`);
    }

    // Transform the response to match expected format
    return mapPostToResponse(completePost);
  }
}
