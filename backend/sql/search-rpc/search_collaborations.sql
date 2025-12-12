-- Drop existing function first to avoid signature conflicts
-- Drop both versions (uuid[] and text[] for filter_genres)
DROP FUNCTION IF EXISTS search_collaborations(uuid, text, text, uuid[], boolean, integer, integer);
DROP FUNCTION IF EXISTS search_collaborations(uuid, text, text, text[], boolean, integer, integer);

-- Create the search_collaborations function
CREATE OR REPLACE FUNCTION search_collaborations(
  p_user_id UUID,
  search_query TEXT,
  filter_location TEXT,
  filter_genres TEXT[],
  filter_paid_only BOOLEAN,
  limit_count INT,
  offset_count INT
)
RETURNS TABLE(
  id UUID,
  title TEXT,
  description TEXT,
  author_id UUID,
  author_username TEXT,
  author_first_name TEXT,
  author_avatar_url TEXT,
  location TEXT,
  paid_opportunity BOOLEAN,
  genres JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    po.id,
    po.title,
    po.description,
    po.author_id,
    prof.username as author_username,
    prof.first_name as author_first_name,
    prof.avatar_url as author_avatar_url,
    po.location,
    po.paid_opportunity,
    (
      SELECT jsonb_agg(m.name)
      FROM post_metadata pm
      JOIN metadata m ON m.id = pm.metadata_id
      WHERE pm.post_id = po.id AND m.type = 'genre'
    ) as genres,
    po.created_at,
    -- Relevance based on search match and recency
    (
      (
        CASE 
          WHEN search_query IS NOT NULL 
          THEN ts_rank(po.search_vector, plainto_tsquery('english', search_query)) * 5.0
          ELSE 1.0
        END +
        -- Boost recent posts
        (EXTRACT(EPOCH FROM (NOW() - po.created_at)) / 86400.0) * -0.1
      )::REAL
    ) as relevance
  FROM posts po
  JOIN profiles prof ON prof.id = po.author_id
  WHERE po.type = 'request'
    AND po.author_id != p_user_id
    AND (
      search_query IS NULL 
      OR po.search_vector @@ plainto_tsquery('english', search_query)
      OR po.title ILIKE '%' || search_query || '%'
      OR po.description ILIKE '%' || search_query || '%'
    )
    AND (
      filter_location IS NULL
      OR po.location ILIKE '%' || filter_location || '%'
    )
    AND (
      filter_genres IS NULL
      OR EXISTS (
        SELECT 1 FROM post_metadata pm
        JOIN metadata m ON m.id = pm.metadata_id
        WHERE pm.post_id = po.id
        AND m.name = ANY(filter_genres)
      )
    )
    AND (
      filter_paid_only IS NULL
      OR filter_paid_only = false
      OR po.paid_opportunity = true
    )
  ORDER BY relevance DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
