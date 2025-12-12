-- Drop existing function first to avoid signature conflicts
-- Drop both versions (uuid[] and text[] for filter_genres)
DROP FUNCTION IF EXISTS search_people(uuid, text, text, uuid[], looking_for_type[], integer, integer);
DROP FUNCTION IF EXISTS search_people(uuid, text, text, text[], looking_for_type[], integer, integer);

-- Create the search_people function
CREATE OR REPLACE FUNCTION search_people(
  p_user_id UUID,
  search_query TEXT,
  filter_location TEXT,
  filter_genres TEXT[],
  filter_looking_for looking_for_type[],
  limit_count INT,
  offset_count INT
)
RETURNS TABLE(
  id TEXT,
  username TEXT,
  first_name TEXT,
  last_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  location TEXT,
  genres JSONB,
  looking_for TEXT[],
  is_connected BOOLEAN,
  relevance REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id::TEXT,
    p.username,
    p.first_name,
    p.last_name,
    p.avatar_url,
    p.bio,
    p.location,
    (
      SELECT jsonb_agg(m.name)
      FROM user_metadata um
      JOIN metadata m ON m.id = um.metadata_id
      WHERE um.user_id = p.id AND m.type = 'genre'
    ) as genres,
    (
      SELECT ARRAY_AGG(ulf.looking_for_value::TEXT)
      FROM user_looking_for ulf
      WHERE ulf.user_id = p.id
    ) as looking_for,
    EXISTS (
      SELECT 1 FROM connection_requests cr
      WHERE cr.status = 'accepted'
      AND (
        (cr.requester_id = p_user_id AND cr.recipient_id = p.id)
        OR (cr.recipient_id = p_user_id AND cr.requester_id = p.id)
      )
    ) as is_connected,
    -- Relevance based on search match
    (CASE 
      WHEN search_query IS NOT NULL 
      THEN ts_rank(p.search_vector, plainto_tsquery('english', search_query)) * 5.0
      ELSE 1.0
    END)::REAL as relevance
  FROM profiles p
  WHERE p.id != p_user_id
    AND NOT (p_user_id = ANY(p.blocked_users))
    AND NOT EXISTS (
      SELECT 1 FROM profiles p2
      WHERE p2.id = p_user_id 
      AND p.id = ANY(p2.blocked_users)
    )
    AND (
      search_query IS NULL 
      OR p.search_vector @@ plainto_tsquery('english', search_query)
      OR p.username ILIKE '%' || search_query || '%'
      OR p.first_name ILIKE '%' || search_query || '%'
      OR p.last_name ILIKE '%' || search_query || '%'
    )
    AND (
      filter_location IS NULL
      OR p.location ILIKE '%' || filter_location || '%'
    )
    AND (
      filter_genres IS NULL
      OR EXISTS (
        SELECT 1 FROM user_metadata um
        JOIN metadata m ON m.id = um.metadata_id
        WHERE um.user_id = p.id
        AND m.name = ANY(filter_genres)
      )
    )
    AND (
      filter_looking_for IS NULL
      OR EXISTS (
        SELECT 1 FROM user_looking_for ulf
        WHERE ulf.user_id = p.id
        AND ulf.looking_for_value = ANY(filter_looking_for)
      )
    )
  ORDER BY relevance DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
