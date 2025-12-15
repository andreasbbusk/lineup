-- Metadata Seed Data
-- This file populates the metadata table with initial tags, genres, and artists
-- Safe to run multiple times (uses ON CONFLICT DO NOTHING)
-- 
-- NOTE: Data may already exist in your database. This file serves as:
-- - Documentation of what seed data should exist
-- - Reference for team members (Dan, Magnus, etc.)
-- - Seed data for new environments
-- 
-- To use: Copy this entire file and paste it into the Supabase SQL Editor, then click Run

-- Insert Tags (as specified in ClickUp task)
INSERT INTO metadata (type, name)
VALUES
  ('tag', 'question'),
  ('tag', 'tutorial'),
  ('tag', 'music-theory'),
  ('tag', 'recording'),
  ('tag', 'equipment'),
  ('tag', 'concert'),
  ('tag', 'collaboration'),
  ('tag', 'mixing'),
  ('tag', 'mastering'),
  ('tag', 'production'),
  ('tag', 'songwriter'),
  ('tag', 'vocalist'),
  ('tag', 'guitarist'),
  ('tag', 'drummer'),
  ('tag', 'bassist')
ON CONFLICT (type, name) DO NOTHING;

-- Note: Your table may have additional tags (e.g., saxophone, keys, singing, strings, postman)
-- that are not in the task requirements. Those can remain, but the above are the required ones.

-- Insert Genres (as specified in ClickUp task)
INSERT INTO metadata (type, name)
VALUES
  ('genre', 'Indie'),
  ('genre', 'Pop'),
  ('genre', 'Rock'),
  ('genre', 'Hip-Hop'),
  ('genre', 'Electronic'),
  ('genre', 'Jazz'),
  ('genre', 'Folk'),
  ('genre', 'R&B'),
  ('genre', 'Metal'),
  ('genre', 'Classical'),
  ('genre', 'Alternative'),
  ('genre', 'Punk'),
  ('genre', 'Blues'),
  ('genre', 'Country'),
  ('genre', 'Soul'),
  ('genre', 'Funk'),
  ('genre', 'Reggae')
ON CONFLICT (type, name) DO NOTHING;

-- Note: Check your table to ensure all these genres exist. 
-- From the image, some may be missing (Hip-Hop, Folk, R&B, Alternative, Punk, Blues, Soul).

-- Insert Artists
-- TODO: Add artist names when defined
-- INSERT INTO metadata (type, name)
-- VALUES
--   ('artist', 'Artist Name 1'),
--   ('artist', 'Artist Name 2')
-- ON CONFLICT (type, name) DO NOTHING;

