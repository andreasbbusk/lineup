-- =====================================================
-- BACKUP of Current Schema State
-- Captures the EXACT current state before optimization
-- This is a snapshot, not meant to be executed
-- Date: 2026-01-08
-- =====================================================

-- =====================================================
-- MESSAGES TABLE - Current Structure
-- =====================================================
/*
CREATE TABLE public.messages (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  conversation_id uuid NOT NULL,
  sender_id uuid NOT NULL,
  content text NULL,
  media_ids uuid[] NULL,
  is_edited boolean NULL DEFAULT false,
  edited_at timestamp with time zone NULL,
  is_deleted boolean NULL DEFAULT false,
  deleted_at timestamp with time zone NULL,
  reply_to_message_id uuid NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  sent_via_websocket boolean NULL DEFAULT false,    -- TO BE REMOVED
  status text NULL DEFAULT 'sent'::text,            -- TO BE REMOVED
  
  CONSTRAINT messages_pkey PRIMARY KEY (id),
  CONSTRAINT messages_conversation_id_fkey FOREIGN KEY (conversation_id) 
    REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT messages_reply_to_message_id_fkey FOREIGN KEY (reply_to_message_id) 
    REFERENCES messages (id) ON DELETE SET NULL,
  CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) 
    REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT messages_content_check CHECK (
    (char_length(content) >= 1 AND char_length(content) <= 5000)
  ),
  CONSTRAINT messages_status_check CHECK (          -- TO BE REMOVED
    status = ANY (ARRAY['sending'::text, 'sent'::text, 'delivered'::text, 'read'::text])
  )
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX idx_messages_conversation_id ON public.messages USING btree (conversation_id);
CREATE INDEX idx_messages_sender_id ON public.messages USING btree (sender_id);
CREATE INDEX idx_messages_created_at ON public.messages USING btree (created_at DESC);
CREATE INDEX idx_messages_conversation_created ON public.messages USING btree (conversation_id, created_at DESC);
CREATE INDEX idx_messages_reply_to ON public.messages USING btree (reply_to_message_id);

-- Triggers
CREATE TRIGGER messages_broadcast_trigger 
  AFTER INSERT OR DELETE OR UPDATE ON messages 
  FOR EACH ROW EXECUTE FUNCTION messages_broadcast_trigger_func();

CREATE TRIGGER messages_update_conversation 
  AFTER INSERT ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

CREATE TRIGGER on_message_created 
  AFTER INSERT ON messages 
  FOR EACH ROW EXECUTE FUNCTION increment_unread_counts();

CREATE TRIGGER on_message_update_conversation 
  AFTER INSERT ON messages 
  FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();
*/

-- =====================================================
-- CONVERSATION_PARTICIPANTS TABLE - Current Structure
-- =====================================================
/*
CREATE TABLE public.conversation_participants (
  conversation_id uuid NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamp with time zone NULL DEFAULT now(),
  left_at timestamp with time zone NULL,
  is_admin boolean NULL DEFAULT false,
  last_read_message_id uuid NULL,                   -- TO BE REMOVED
  last_read_at timestamp with time zone NULL,       -- TO BE REMOVED
  notifications_enabled boolean NULL DEFAULT true,
  is_muted boolean NULL DEFAULT false,
  is_typing boolean NULL DEFAULT false,
  last_typing_at timestamp with time zone NULL,
  unread_count integer NULL DEFAULT 0,
  
  CONSTRAINT conversation_participants_pkey PRIMARY KEY (conversation_id, user_id),
  CONSTRAINT conversation_participants_conversation_id_fkey FOREIGN KEY (conversation_id) 
    REFERENCES conversations (id) ON DELETE CASCADE,
  CONSTRAINT conversation_participants_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX idx_conversation_participants_user_conversation 
  ON public.conversation_participants USING btree (user_id, conversation_id);

CREATE INDEX idx_conversation_participants_user 
  ON public.conversation_participants USING btree (user_id) 
  WHERE (left_at IS NULL);

CREATE INDEX idx_conversation_participants_user_id    -- TO BE REMOVED (redundant)
  ON public.conversation_participants USING btree (user_id);

CREATE INDEX idx_conversation_participants_conversation_id 
  ON public.conversation_participants USING btree (conversation_id);

CREATE INDEX idx_conversation_participants_active 
  ON public.conversation_participants USING btree (user_id, left_at) 
  WHERE (left_at IS NULL);

-- Triggers
CREATE TRIGGER enforce_conversation_participant_limit 
  BEFORE INSERT ON conversation_participants 
  FOR EACH ROW EXECUTE FUNCTION check_conversation_participant_limit();
*/

-- =====================================================
-- CONVERSATIONS TABLE - Current Structure
-- =====================================================
/*
CREATE TABLE public.conversations (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  type public.conversation_type NOT NULL,
  name text NULL,
  avatar_url text NULL,
  created_by uuid NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  updated_at timestamp with time zone NULL DEFAULT now(), -- TO BE REMOVED
  last_message_id uuid NULL,
  last_message_preview text NULL,
  last_message_at timestamp with time zone NULL,
  related_post_id uuid NULL,
  
  CONSTRAINT conversations_pkey PRIMARY KEY (id),
  CONSTRAINT conversations_created_by_fkey FOREIGN KEY (created_by) 
    REFERENCES profiles (id) ON DELETE CASCADE,
  CONSTRAINT conversations_related_post_id_fkey FOREIGN KEY (related_post_id) 
    REFERENCES posts (id) ON DELETE SET NULL
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX idx_conversations_last_message 
  ON public.conversations USING btree (last_message_at DESC NULLS LAST);

CREATE INDEX idx_conversations_type 
  ON public.conversations USING btree (type);

CREATE INDEX idx_conversations_created_by 
  ON public.conversations USING btree (created_by);

CREATE INDEX idx_conversations_updated_at            -- TO BE REMOVED
  ON public.conversations USING btree (updated_at DESC);

CREATE INDEX idx_conversations_related_post_id 
  ON public.conversations USING btree (related_post_id);

-- Triggers
CREATE TRIGGER conversations_broadcast_trigger 
  AFTER INSERT OR DELETE OR UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION conversations_broadcast_trigger_func();

CREATE TRIGGER conversations_updated_at              -- TO BE REMOVED
  BEFORE UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION update_conversation_timestamp();

CREATE TRIGGER validate_group_conversation_trigger 
  BEFORE INSERT OR UPDATE ON conversations 
  FOR EACH ROW EXECUTE FUNCTION validate_group_conversation();
*/

-- =====================================================
-- MESSAGE_READ_RECEIPTS TABLE - Current Structure (UNCHANGED)
-- =====================================================
/*
CREATE TABLE public.message_read_receipts (
  message_id uuid NOT NULL,
  user_id uuid NOT NULL,
  read_at timestamp with time zone NULL DEFAULT now(),
  
  CONSTRAINT message_read_receipts_pkey PRIMARY KEY (message_id, user_id),
  CONSTRAINT message_read_receipts_message_id_fkey FOREIGN KEY (message_id) 
    REFERENCES messages (id) ON DELETE CASCADE,
  CONSTRAINT message_read_receipts_user_id_fkey FOREIGN KEY (user_id) 
    REFERENCES profiles (id) ON DELETE CASCADE
) TABLESPACE pg_default;

-- Indexes
CREATE INDEX idx_message_read_receipts_message_id 
  ON public.message_read_receipts USING btree (message_id);

CREATE INDEX idx_message_read_receipts_user_id 
  ON public.message_read_receipts USING btree (user_id);
*/

-- =====================================================
-- DATA SNAPSHOT QUERIES
-- Use these to capture current data before migration
-- =====================================================

-- Count current records
-- SELECT 
--   (SELECT COUNT(*) FROM messages) as message_count,
--   (SELECT COUNT(*) FROM conversations) as conversation_count,
--   (SELECT COUNT(*) FROM conversation_participants) as participant_count,
--   (SELECT COUNT(*) FROM message_read_receipts) as read_receipt_count;

-- Sample of fields being removed from messages
-- SELECT id, status, sent_via_websocket, created_at
-- FROM messages
-- LIMIT 10;

-- Sample of fields being removed from conversation_participants
-- SELECT user_id, conversation_id, last_read_message_id, last_read_at, unread_count
-- FROM conversation_participants
-- WHERE last_read_message_id IS NOT NULL
-- LIMIT 10;

-- Sample of fields being removed from conversations
-- SELECT id, created_at, updated_at, last_message_at
-- FROM conversations
-- WHERE updated_at IS NOT NULL
-- LIMIT 10;
