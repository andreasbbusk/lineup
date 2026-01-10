-- =====================================================
-- Remove sent_via_websocket column from messages table
-- Date: 2026-01-08
-- =====================================================

-- Drop the sent_via_websocket column from messages table
ALTER TABLE public.messages 
  DROP COLUMN IF EXISTS sent_via_websocket;
