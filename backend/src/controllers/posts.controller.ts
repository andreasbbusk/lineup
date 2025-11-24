import { Request, Response } from "express";
import { sql } from "../config/database.config.js";

// create a new post (note or request (story in the future))

export const createPost = async (req: Request, res: Response) => {
  try {
    const userId = req.userId;
    const {
      type, title, description, tags, genres, location, paidOpportunity, taggedUsers, media,
    } = req.body;

    // 1. Input validation
    if (!type || !['note', 'request', 'story'].includes(type)) {
      return res.status(400).json({ error: "Invalid post type. Must be 'note', 'request', or 'story'" });
    }
    
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return res.status(400).json({ error: "Title is required" });
    }
    
    if (title.trim().length > 100) {
      return res.status(400).json({ error: "Title must be 100 characters or less" });
    }
    
    if (!description || typeof description !== 'string' || description.trim().length < 10) {
      return res.status(400).json({ error: "Description is required and must be at least 10 characters" });
    }
    
    if (description.trim().length > 5000) {
      return res.status(400).json({ error: "Description must be 5000 characters or less" });
    }

    // Ensure userId exists
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    // 2. Use transaction
    const result = await sql.begin(async (sql) => {
      // Create post
      const [post] = await sql`
        INSERT INTO posts (
          type,
          title,
          description,
          author_id,
          location,
          paid_opportunity
        ) VALUES (
          ${type as 'note' | 'request' | 'story'},
          ${title.trim()},
          ${description.trim()},
          ${userId},
          ${location ?? null},
          ${type === "request" ? (paidOpportunity ?? false) : null}
        )
        RETURNING id
      `;

      const newPostId = post.id;

      // Handle tags for notes
      if (type === "note" && tags && Array.isArray(tags) && tags.length > 0) {
        for (const tagName of tags) {
          if (typeof tagName !== 'string' || !tagName.trim()) continue;
          
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
            VALUES (${newPostId}, ${metadata.id})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      // Handle genres for requests
      if (type === "request" && genres && Array.isArray(genres) && genres.length > 0) {
        for (const genreName of genres) {
          if (typeof genreName !== 'string' || !genreName.trim()) continue;
          
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
            VALUES (${newPostId}, ${metadata.id})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      // Handle media
      if (media && Array.isArray(media) && media.length > 0) {
        for (let i = 0; i < media.length; i++) {
          const mediaItem = media[i];
          if (!mediaItem?.url || !mediaItem?.type) continue;

          const [mediaRecord] = await sql`
            INSERT INTO media (url, thumbnail_url, type)
            VALUES (${mediaItem.url}, ${mediaItem.thumbnail_url || null}, ${mediaItem.type})
            RETURNING id
          `;

          await sql`
            INSERT INTO post_media (post_id, media_id, display_order)
            VALUES (${newPostId}, ${mediaRecord.id}, ${i})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      // Handle tagged users
      if (taggedUsers && Array.isArray(taggedUsers) && taggedUsers.length > 0) {
        for (const taggedUserId of taggedUsers) {
          // Remove .trim() - UUIDs shouldn't be trimmed
          if (typeof taggedUserId !== 'string') continue;
          
          await sql`
            INSERT INTO post_tagged_users (post_id, user_id)
            VALUES (${newPostId}, ${taggedUserId})
            ON CONFLICT DO NOTHING
          `;
        }
      }

      return newPostId;
    });

    // Fetch complete post with all relations
    const [completePost] = await sql`
      SELECT 
        p.*,
        COALESCE(
          (SELECT json_agg(jsonb_build_object(
            'id', m.id,
            'name', m.name,
            'type', m.type
          ) ORDER BY m.name)
          FROM post_metadata pmd2
          JOIN metadata m ON pmd2.metadata_id = m.id
          WHERE pmd2.post_id = p.id),
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
          FROM post_tagged_users ptu2
          JOIN profiles u ON ptu2.user_id = u.id
          WHERE ptu2.post_id = p.id),
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
      WHERE p.id = ${result}
    `;

    // Debug logging
    console.log("Complete post response:", JSON.stringify(completePost, null, 2));

    res.status(200).json(completePost);
  } catch (error) {
    console.error("Error creating post:", error);
    res.status(500).json({ error: "Failed to create the post" });
  }
};


// Get all posts with filters and pagination
// export const getPosts

// export const getPostById


