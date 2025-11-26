import {
  Controller,
  Route,
  Tags,
  Post,
  Body,
  Request,
  Security
} from "tsoa";
import { sql } from "../config/database.config.js";
import { CreatePostBody } from "../types/posts.js";
import { extractUserId } from "../services/auth.service.js";
@Route("posts")
@Tags("Posts")
export class PostsController extends Controller {
  /**
   * Creates a new post (note, request, or story)
   */
  @Security("bearerAuth")
  @Post("/")
  public async createPost(
    @Body() body: CreatePostBody,
    @Request() req: any
  ): Promise<any> {
    const userId = await extractUserId(req);

    const {
      type,
      title,
      description,
      tags,
      genres,
      location,
      paidOpportunity,
      taggedUsers,
      media
    } = body;

    // Input validation
    if (!type || !["note", "request", "story"].includes(type)) {
      this.setStatus(400);
      return { error: "Invalid post type. Must be 'note', 'request', or 'story'" };
    }

    if (!title?.trim()) {
      this.setStatus(400);
      return { error: "Title is required" };
    }

    if (title.trim().length > 100) {
      this.setStatus(400);
      return { error: "Title must be 100 characters or less" };
    }

    if (!description?.trim() || description.trim().length < 10) {
      this.setStatus(400);
      return { error: "Description is required and must be at least 10 characters" };
    }

    if (description.trim().length > 5000) {
      this.setStatus(400);
      return { error: "Description must be 5000 characters or less" };
    }

    try {
      const newPostId = await sql.begin(async (sql) => {
        const [post] = await sql`
          INSERT INTO posts (
            type,
            title,
            description,
            author_id,
            location,
            paid_opportunity
          ) VALUES (
            ${type},
            ${title.trim()},
            ${description.trim()},
            ${userId},
            ${location ?? null},
            ${type === "request" ? (paidOpportunity ?? false) : null}
          )
          RETURNING id
        `;

        const postId = post.id;

        // tags (for notes)
        if (type === "note" && Array.isArray(tags)) {
          for (const tagName of tags) {
            if (!tagName?.trim()) continue;

            let [metadata] = await sql`
              SELECT id FROM metadata
              WHERE type = 'tag' AND name = ${tagName.trim()}
            `;

            if (!metadata) {
              [metadata] = await sql`
                INSERT INTO metadata (type, name)
                VALUES ('tag', ${tagName.trim()})
                RETURNING id
              `;
            }

            await sql`
              INSERT INTO post_metadata (post_id, metadata_id)
              VALUES (${postId}, ${metadata.id})
              ON CONFLICT DO NOTHING
            `;
          }
        }

        // genres (for requests)
        if (type === "request" && Array.isArray(genres)) {
          for (const genreName of genres) {
            if (!genreName?.trim()) continue;

            let [metadata] = await sql`
              SELECT id FROM metadata
              WHERE type = 'genre' AND name = ${genreName.trim()}
            `;

            if (!metadata) {
              [metadata] = await sql`
                INSERT INTO metadata (type, name)
                VALUES ('genre', ${genreName.trim()})
                RETURNING id
              `;
            }

            await sql`
              INSERT INTO post_metadata (post_id, metadata_id)
              VALUES (${postId}, ${metadata.id})
              ON CONFLICT DO NOTHING
            `;
          }
        }

        // media
        if (Array.isArray(media)) {
          for (let i = 0; i < media.length; i++) {
            const item = media[i];
            if (!item?.url || !item?.type) continue;

            const [mediaRecord] = await sql`
              INSERT INTO media (url, thumbnail_url, type)
              VALUES (${item.url}, ${item.thumbnail_url ?? null}, ${item.type})
              RETURNING id
            `;

            await sql`
              INSERT INTO post_media (post_id, media_id, display_order)
              VALUES (${postId}, ${mediaRecord.id}, ${i})
              ON CONFLICT DO NOTHING
            `;
          }
        }

        // tagged users
        if (Array.isArray(taggedUsers)) {
          for (const taggedId of taggedUsers) {
            if (typeof taggedId !== "string") continue;

            await sql`
              INSERT INTO post_tagged_users (post_id, user_id)
              VALUES (${postId}, ${taggedId})
              ON CONFLICT DO NOTHING
            `;
          }
        }

        return postId;
      });

      // fetch full post response
      const [completePost] = await sql`
        SELECT 
          p.*,
          COALESCE(
            (SELECT json_agg(jsonb_build_object(
              'id', m.id,
              'name', m.name,
              'type', m.type
            ) ORDER BY m.name)
            FROM post_metadata pm
            JOIN metadata m ON pm.metadata_id = m.id
            WHERE pm.post_id = p.id),
            '[]'::json
          ) as metadata,
          COALESCE(
            (SELECT json_agg(jsonb_build_object(
              'id', med.id,
              'url', med.url,
              'thumbnail_url', med.thumbnail_url,
              'type', med.type,
              'display_order', pm2.display_order
            ) ORDER BY pm2.display_order)
            FROM post_media pm2
            JOIN media med ON pm2.media_id = med.id
            WHERE pm2.post_id = p.id),
            '[]'::json
          ) as media,
          COALESCE(
            (SELECT json_agg(jsonb_build_object(
              'id', u.id,
              'username', u.username,
              'first_name', u.first_name,
              'last_name', u.last_name,
              'avatar_url', u.avatar_url
            ))
            FROM post_tagged_users ptu
            JOIN profiles u ON ptu.user_id = u.id
            WHERE ptu.post_id = p.id),
            '[]'::json
          ) as tagged_users,
          jsonb_build_object(
            'id', author.id,
            'username', author.username,
            'first_name', author.first_name,
            'last_name', author.last_name,
            'avatar_url', author.avatar_url
          ) as author
        FROM posts p
        LEFT JOIN profiles author ON p.author_id = author.id
        WHERE p.id = ${newPostId}
      `;

      this.setStatus(201);
      return completePost;
    } catch (err) {
      console.error("Error creating post:", err);
      this.setStatus(500);
      return { error: "Failed to create the post" };
    }
  }
}
