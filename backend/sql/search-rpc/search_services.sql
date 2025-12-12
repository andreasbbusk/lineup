-- Drop existing function first to avoid signature conflicts
-- Drop both possible signatures (3 and 4 parameters)
DROP FUNCTION IF EXISTS search_services(text, integer, integer);
DROP FUNCTION IF EXISTS search_services(text, text, integer, integer);

-- Create the search_services function
CREATE OR REPLACE FUNCTION search_services(
  search_query TEXT,
  limit_count INT,
  offset_count INT
)
RETURNS TABLE(
  id TEXT,
  title TEXT,
  description TEXT,
  service_type TEXT,
  provider_id UUID,
  provider_name TEXT,
  provider_username TEXT,
  provider_avatar_url TEXT,
  location TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  relevance REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    s.id::TEXT,
    s.title,
    s.description,
    s.service_type::TEXT,
    s.provider_id,
    COALESCE(s.provider_name, prof.first_name, prof.username) as provider_name,
    prof.username as provider_username,
    prof.avatar_url as provider_avatar_url,
    s.location,
    s.created_at,
    -- Relevance based on search match
    (CASE 
      WHEN search_query IS NOT NULL 
      THEN ts_rank(s.search_vector, plainto_tsquery('english', search_query))
      ELSE 1.0
    END)::REAL as relevance
  FROM services s
  LEFT JOIN profiles prof ON prof.id = s.provider_id
  WHERE 
    search_query IS NULL 
    OR s.search_vector @@ plainto_tsquery('english', search_query)
    OR s.title ILIKE '%' || search_query || '%'
    OR s.description ILIKE '%' || search_query || '%'
  ORDER BY relevance DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
