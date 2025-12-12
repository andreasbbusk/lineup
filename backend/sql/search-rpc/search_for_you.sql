-- Drop existing function first to avoid signature conflicts
DROP FUNCTION IF EXISTS search_for_you(uuid, text, integer, integer);

-- Create the corrected function
CREATE OR REPLACE FUNCTION search_for_you(
  p_user_id UUID,
  search_query TEXT,
  limit_count INT,
  offset_count INT
)
RETURNS TABLE(
  entity_type TEXT,
  entity_id TEXT,
  title TEXT,
  subtitle TEXT,
  avatar_url TEXT,
  match_reason TEXT,
  additional_info JSONB,
  relevance REAL
)
LANGUAGE plpgsql
AS $$
DECLARE
  user_genres UUID[];
  user_looking_for looking_for_type[];
BEGIN
  -- Get current user's preferences (only genres)
  SELECT ARRAY_AGG(DISTINCT metadata_id) INTO user_genres
  FROM user_metadata um
  JOIN metadata m ON m.id = um.metadata_id
  WHERE um.user_id = p_user_id AND m.type = 'genre';
  
  SELECT ARRAY_AGG(DISTINCT looking_for_value) INTO user_looking_for
  FROM user_looking_for
  WHERE user_id = p_user_id;

  RETURN QUERY
  
  -- PEOPLE with shared genres
  SELECT 
    'user'::TEXT as entity_type,
    p.id::TEXT as entity_id,
    p.username as title,
    (p.first_name || ' ' || p.last_name) as subtitle,
    p.avatar_url,
    CASE 
      WHEN (SELECT COUNT(*) FROM user_metadata um WHERE um.user_id = p.id AND um.metadata_id = ANY(user_genres)) > 2
      THEN 'Shares ' || (SELECT COUNT(*) FROM user_metadata um WHERE um.user_id = p.id AND um.metadata_id = ANY(user_genres))::TEXT || ' genres'
      WHEN (SELECT COUNT(*) FROM user_metadata um WHERE um.user_id = p.id AND um.metadata_id = ANY(user_genres)) > 0
      THEN 'Shared genres'
      ELSE 'Recommended'
    END as match_reason,
    jsonb_build_object(
      'type', 'user',
      'id', p.id,
      'username', p.username,
      'firstName', p.first_name,
      'lastName', p.last_name,
      'avatarUrl', p.avatar_url,
      'bio', p.bio,
      'location', p.location,
      'genres', (
        SELECT jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name))
        FROM user_metadata um
        JOIN metadata m ON m.id = um.metadata_id
        WHERE um.user_id = p.id AND m.type = 'genre'
      ),
      'lookingFor', (
        SELECT ARRAY_AGG(DISTINCT looking_for_value)
        FROM user_looking_for
        WHERE user_id = p.id
      ),
      'isConnected', EXISTS(
        SELECT 1 FROM connections 
        WHERE (user_id = p_user_id AND connected_user_id = p.id)
           OR (user_id = p.id AND connected_user_id = p_user_id)
      ),
      'relevance', 0
    ) as additional_info,
    -- Relevance based on shared genres + search match
    (
      COALESCE(
        (SELECT COUNT(*)::REAL FROM user_metadata um 
         WHERE um.user_id = p.id AND um.metadata_id = ANY(user_genres)), 0
      ) * 3.0 + -- Genres weighted heavily
      CASE 
        WHEN search_query IS NOT NULL 
        THEN ts_rank(p.search_vector, plainto_tsquery('english', search_query)) * 5.0
        ELSE 0
      END
    )::REAL as relevance
  FROM profiles p
  WHERE p.id != p_user_id
    AND NOT (p_user_id = ANY(p.blocked_users))
    -- ✅ FIXED: Changed to use EXISTS with correct array syntax
    AND NOT EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = p_user_id 
      AND p.id = ANY(blocked_users)
    )
    AND (
      -- Has shared genres OR there's a search query OR user has no genres
      EXISTS (
        SELECT 1 FROM user_metadata um
        WHERE um.user_id = p.id
          AND um.metadata_id = ANY(user_genres)
      )
      OR search_query IS NOT NULL
      OR user_genres IS NULL
      OR CARDINALITY(user_genres) = 0
    )
    AND (
      search_query IS NULL 
      OR p.search_vector @@ plainto_tsquery('english', search_query)
      OR p.username ILIKE '%' || search_query || '%'
    )
  
  UNION ALL
  
  -- COLLABORATIONS (Requests matching user's genres)
  SELECT 
    'collaboration'::TEXT as entity_type,
    po.id::TEXT as entity_id,
    po.title as title,
    LEFT(po.description, 100) as subtitle,
    prof.avatar_url,
    'Matches your genres' as match_reason,
    jsonb_build_object(
      'type', 'collaboration',
      'id', po.id,
      'title', po.title,
      'description', po.description,
      'authorId', po.author_id,
      'authorUsername', prof.username,
      'authorFirstName', prof.first_name,
      'authorAvatarUrl', prof.avatar_url,
      'location', po.location,
      'paidOpportunity', po.paid_opportunity,
      'genres', (
        SELECT jsonb_agg(jsonb_build_object('id', m.id, 'name', m.name))
        FROM post_metadata pm
        JOIN metadata m ON m.id = pm.metadata_id
        WHERE pm.post_id = po.id AND m.type = 'genre'
      ),
      'createdAt', po.created_at,
      'relevance', 0
    ) as additional_info,
    (
      COALESCE(
        (SELECT COUNT(*)::REAL FROM post_metadata pm 
         WHERE pm.post_id = po.id AND pm.metadata_id = ANY(user_genres)), 0
      ) * 3.0 + -- Matching genres heavily weighted
      CASE 
        WHEN search_query IS NOT NULL 
        THEN ts_rank(po.search_vector, plainto_tsquery('english', search_query)) * 5.0
        ELSE 0
      END
    )::REAL as relevance
  FROM posts po
  JOIN profiles prof ON prof.id = po.author_id
  WHERE po.type = 'request'
    AND po.author_id != p_user_id
    AND (
      -- Has matching genres OR there's a search query OR user has no genres
      EXISTS (
        SELECT 1 FROM post_metadata pm
        WHERE pm.post_id = po.id
          AND pm.metadata_id = ANY(user_genres)
      )
      OR search_query IS NOT NULL
      OR user_genres IS NULL
      OR CARDINALITY(user_genres) = 0
    )
    AND (
      search_query IS NULL 
      OR po.search_vector @@ plainto_tsquery('english', search_query)
      OR po.title ILIKE '%' || search_query || '%'
    )
  
  UNION ALL
  
  -- SERVICES matching search query
  SELECT 
    'service'::TEXT as entity_type,
    s.id::TEXT as entity_id,
    s.title as title,
    LEFT(s.description, 100) as subtitle,
    prof.avatar_url,
    'Recommended for you' as match_reason,
    jsonb_build_object(
      'type', 'service',
      'id', s.id,
      'title', s.title,
      'description', s.description,
      'serviceType', s.service_type,
      'providerId', s.provider_id,
      'providerName', COALESCE(prof.first_name || ' ' || prof.last_name, prof.username, 'Service Provider'),
      'providerUsername', prof.username,
      'providerAvatarUrl', prof.avatar_url,
      'location', s.location,
      'createdAt', s.created_at,
      'relevance', 0
    ) as additional_info,
    (
      CASE 
        WHEN search_query IS NOT NULL 
        THEN ts_rank(s.search_vector, plainto_tsquery('english', search_query)) * 5.0
        ELSE 1.0 -- Base relevance for services when no search query
      END
    )::REAL as relevance
  FROM services s
  LEFT JOIN profiles prof ON prof.id = s.provider_id
  WHERE (s.provider_id IS NULL OR s.provider_id != p_user_id)
    AND (
      search_query IS NULL 
      OR s.search_vector @@ plainto_tsquery('english', search_query)
      OR s.title ILIKE '%' || search_query || '%'
    )
  
  ORDER BY relevance DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
