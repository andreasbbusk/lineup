-- Drop existing function first to avoid signature conflicts
-- Drop all possible function signatures
DROP FUNCTION IF EXISTS search_tags(text, text, integer, integer);
DROP FUNCTION IF EXISTS search_tags(integer, integer, text);
DROP FUNCTION IF EXISTS search_tags(text, integer, integer);
DROP FUNCTION IF EXISTS search_tags();

-- Create the search_tags function
CREATE OR REPLACE FUNCTION search_tags(
  search_query TEXT DEFAULT NULL,
  filter_type TEXT DEFAULT NULL,
  limit_count INT DEFAULT 20,
  offset_count INT DEFAULT 0
)
RETURNS TABLE(
  id UUID,
  name TEXT,
  type TEXT,
  usage_count BIGINT,
  relevance REAL
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    m.id,
    m.name,
    m.type::TEXT,
    COALESCE(
      (SELECT COUNT(*) FROM post_metadata pm WHERE pm.metadata_id = m.id),
      0
    ) as usage_count,
    -- Relevance based on search match and usage
    (
      CASE 
        WHEN search_query IS NOT NULL 
        THEN 
          CASE 
            WHEN m.name ILIKE search_query THEN 10.0
            WHEN m.name ILIKE search_query || '%' THEN 5.0
            WHEN m.name ILIKE '%' || search_query || '%' THEN 2.0
            ELSE 1.0
          END
        ELSE 1.0
      END * 
      (1.0 + LOG(1.0 + COALESCE(
        (SELECT COUNT(*)::REAL FROM post_metadata pm WHERE pm.metadata_id = m.id),
        0
      )))
    )::REAL as relevance
  FROM metadata m
  WHERE 
    (filter_type IS NULL OR m.type = filter_type::metadata_type)
    AND (
      search_query IS NULL 
      OR m.name ILIKE '%' || search_query || '%'
    )
  ORDER BY relevance DESC, usage_count DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;
