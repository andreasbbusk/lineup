export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      bookmarks: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookmarks_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookmarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          parent_id: string | null
          post_id: string
          updated_at: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id: string
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          parent_id?: string | null
          post_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comments_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      connection_requests: {
        Row: {
          created_at: string | null
          id: string
          recipient_id: string
          requester_id: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          recipient_id: string
          requester_id: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          recipient_id?: string
          requester_id?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "connection_requests_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "connection_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          is_admin: boolean | null
          is_muted: boolean | null
          is_typing: boolean | null
          joined_at: string | null
          last_read_at: string | null
          last_read_message_id: string | null
          last_typing_at: string | null
          left_at: string | null
          notifications_enabled: boolean | null
          unread_count: number | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          is_typing?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          last_read_message_id?: string | null
          last_typing_at?: string | null
          left_at?: string | null
          notifications_enabled?: boolean | null
          unread_count?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          is_admin?: boolean | null
          is_muted?: boolean | null
          is_typing?: boolean | null
          joined_at?: string | null
          last_read_at?: string | null
          last_read_message_id?: string | null
          last_typing_at?: string | null
          left_at?: string | null
          notifications_enabled?: boolean | null
          unread_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_participants_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          created_by: string
          id: string
          last_message_at: string | null
          last_message_id: string | null
          last_message_preview: string | null
          name: string | null
          related_post_id: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          created_by: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_preview?: string | null
          name?: string | null
          related_post_id?: string | null
          type: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          created_by?: string
          id?: string
          last_message_at?: string | null
          last_message_id?: string | null
          last_message_preview?: string | null
          name?: string | null
          related_post_id?: string | null
          type?: Database["public"]["Enums"]["conversation_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_related_post_id_fkey"
            columns: ["related_post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      faq_questions: {
        Row: {
          created_at: string | null
          display_order: number
          id: string
          is_active: boolean | null
          question: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          question: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          id?: string
          is_active?: boolean | null
          question?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          comment_id: string | null
          created_at: string | null
          id: string
          post_id: string | null
          user_id: string
        }
        Insert: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id: string
        }
        Update: {
          comment_id?: string | null
          created_at?: string | null
          id?: string
          post_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_comment_id_fkey"
            columns: ["comment_id"]
            isOneToOne: false
            referencedRelation: "comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "likes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          created_at: string | null
          id: string
          metadata: Json | null
          thumbnail_url: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          thumbnail_url?: string | null
          type: Database["public"]["Enums"]["media_type"]
          url: string
        }
        Update: {
          created_at?: string | null
          id?: string
          metadata?: Json | null
          thumbnail_url?: string | null
          type?: Database["public"]["Enums"]["media_type"]
          url?: string
        }
        Relationships: []
      }
      message_read_receipts: {
        Row: {
          message_id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          message_id: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          message_id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_receipts_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_read_receipts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          conversation_id: string
          created_at: string | null
          deleted_at: string | null
          edited_at: string | null
          id: string
          is_deleted: boolean | null
          is_edited: boolean | null
          media_ids: string[] | null
          reply_to_message_id: string | null
          sender_id: string
          status: string | null
        }
        Insert: {
          content?: string | null
          conversation_id: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          media_ids?: string[] | null
          reply_to_message_id?: string | null
          sender_id: string
          status?: string | null
        }
        Update: {
          content?: string | null
          conversation_id?: string
          created_at?: string | null
          deleted_at?: string | null
          edited_at?: string | null
          id?: string
          is_deleted?: boolean | null
          is_edited?: boolean | null
          media_ids?: string[] | null
          reply_to_message_id?: string | null
          sender_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_message_id_fkey"
            columns: ["reply_to_message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      metadata: {
        Row: {
          created_at: string | null
          id: string
          name: string
          search_vector: unknown
          type: Database["public"]["Enums"]["metadata_type"]
        }
        Insert: {
          created_at?: string | null
          id?: string
          name: string
          search_vector?: unknown
          type: Database["public"]["Enums"]["metadata_type"]
        }
        Update: {
          created_at?: string | null
          id?: string
          name?: string
          search_vector?: unknown
          type?: Database["public"]["Enums"]["metadata_type"]
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          actor_id: string | null
          body: string | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          is_read: boolean | null
          read_at: string | null
          recipient_id: string
          sent_via_websocket: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Insert: {
          action_url?: string | null
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id: string
          sent_via_websocket?: boolean | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
        }
        Update: {
          action_url?: string | null
          actor_id?: string | null
          body?: string | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          is_read?: boolean | null
          read_at?: string | null
          recipient_id?: string
          sent_via_websocket?: boolean | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
        }
        Relationships: [
          {
            foreignKeyName: "notifications_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      post_media: {
        Row: {
          created_at: string | null
          display_order: number
          media_id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          display_order?: number
          media_id: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          display_order?: number
          media_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_media_media_id_fkey"
            columns: ["media_id"]
            isOneToOne: false
            referencedRelation: "media"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_media_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_metadata: {
        Row: {
          created_at: string | null
          metadata_id: string
          post_id: string
        }
        Insert: {
          created_at?: string | null
          metadata_id: string
          post_id: string
        }
        Update: {
          created_at?: string | null
          metadata_id?: string
          post_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_metadata_metadata_id_fkey"
            columns: ["metadata_id"]
            isOneToOne: false
            referencedRelation: "metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_metadata_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
        ]
      }
      post_tagged_users: {
        Row: {
          created_at: string | null
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_tagged_users_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "post_tagged_users_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      posts: {
        Row: {
          author_id: string
          created_at: string | null
          description: string
          expires_at: string | null
          id: string
          location: string | null
          paid_opportunity: boolean | null
          resolved_at: string | null
          search_vector: unknown
          status: string
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at: string | null
        }
        Insert: {
          author_id: string
          created_at?: string | null
          description: string
          expires_at?: string | null
          id?: string
          location?: string | null
          paid_opportunity?: boolean | null
          resolved_at?: string | null
          search_vector?: unknown
          status?: string
          title: string
          type: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
        }
        Update: {
          author_id?: string
          created_at?: string | null
          description?: string
          expires_at?: string | null
          id?: string
          location?: string | null
          paid_opportunity?: boolean | null
          resolved_at?: string | null
          search_vector?: unknown
          status?: string
          title?: string
          type?: Database["public"]["Enums"]["post_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          about_me: string | null
          avatar_url: string | null
          bio: string | null
          blocked_users: string[] | null
          created_at: string | null
          first_name: string
          id: string
          last_name: string
          location: string
          onboarding_completed: boolean | null
          phone_country_code: number | null
          phone_number: number | null
          search_vector: unknown
          spotify_playlist_url: string | null
          theme_color: string | null
          updated_at: string | null
          user_type: string
          username: string
          year_of_birth: number
        }
        Insert: {
          about_me?: string | null
          avatar_url?: string | null
          bio?: string | null
          blocked_users?: string[] | null
          created_at?: string | null
          first_name: string
          id: string
          last_name: string
          location: string
          onboarding_completed?: boolean | null
          phone_country_code?: number | null
          phone_number?: number | null
          search_vector?: unknown
          spotify_playlist_url?: string | null
          theme_color?: string | null
          updated_at?: string | null
          user_type?: string
          username: string
          year_of_birth: number
        }
        Update: {
          about_me?: string | null
          avatar_url?: string | null
          bio?: string | null
          blocked_users?: string[] | null
          created_at?: string | null
          first_name?: string
          id?: string
          last_name?: string
          location?: string
          onboarding_completed?: boolean | null
          phone_country_code?: number | null
          phone_number?: number | null
          search_vector?: unknown
          spotify_playlist_url?: string | null
          theme_color?: string | null
          updated_at?: string | null
          user_type?: string
          username?: string
          year_of_birth?: number
        }
        Relationships: []
      }
      recent_searches: {
        Row: {
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          id: string
          search_query: string
          search_tab: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          search_query: string
          search_tab?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          search_query?: string
          search_tab?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "recent_searches_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          created_at: string | null
          description: string
          id: string
          location: string | null
          media_url: string | null
          provider_id: string | null
          provider_name: string | null
          search_vector: unknown
          service_type: Database["public"]["Enums"]["service_type_ext"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          location?: string | null
          media_url?: string | null
          provider_id?: string | null
          provider_name?: string | null
          search_vector?: unknown
          service_type?: Database["public"]["Enums"]["service_type_ext"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          location?: string | null
          media_url?: string | null
          provider_id?: string | null
          provider_name?: string | null
          search_vector?: unknown
          service_type?: Database["public"]["Enums"]["service_type_ext"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      story_views: {
        Row: {
          story_id: string
          viewed_at: string | null
          viewer_id: string
        }
        Insert: {
          story_id: string
          viewed_at?: string | null
          viewer_id: string
        }
        Update: {
          story_id?: string
          viewed_at?: string | null
          viewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_views_story_id_fkey"
            columns: ["story_id"]
            isOneToOne: false
            referencedRelation: "posts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_views_viewer_id_fkey"
            columns: ["viewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_collaborations: {
        Row: {
          collaborator_id: string
          created_at: string | null
          description: string | null
          id: string
          user_id: string
        }
        Insert: {
          collaborator_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          user_id: string
        }
        Update: {
          collaborator_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_collaborations_collaborator_id_fkey"
            columns: ["collaborator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_collaborations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_faq: {
        Row: {
          answer: string
          created_at: string | null
          id: string
          question_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          answer: string
          created_at?: string | null
          id?: string
          question_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          answer?: string
          created_at?: string | null
          id?: string
          question_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_faq_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "faq_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_faq_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_looking_for: {
        Row: {
          looking_for_value: Database["public"]["Enums"]["looking_for_type"]
          user_id: string
        }
        Insert: {
          looking_for_value: Database["public"]["Enums"]["looking_for_type"]
          user_id: string
        }
        Update: {
          looking_for_value?: Database["public"]["Enums"]["looking_for_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_looking_for_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metadata: {
        Row: {
          created_at: string | null
          metadata_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          metadata_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          metadata_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_metadata_metadata_id_fkey"
            columns: ["metadata_id"]
            isOneToOne: false
            referencedRelation: "metadata"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_metadata_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_reviews: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          rating: number
          reviewer_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          rating: number
          reviewer_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          rating?: number
          reviewer_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_social_media: {
        Row: {
          bandcamp: string | null
          facebook: string | null
          instagram: string | null
          soundcloud: string | null
          tiktok: string | null
          twitter: string | null
          updated_at: string | null
          user_id: string
          youtube: string | null
        }
        Insert: {
          bandcamp?: string | null
          facebook?: string | null
          instagram?: string | null
          soundcloud?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id: string
          youtube?: string | null
        }
        Update: {
          bandcamp?: string | null
          facebook?: string | null
          instagram?: string | null
          soundcloud?: string | null
          tiktok?: string | null
          twitter?: string | null
          updated_at?: string | null
          user_id?: string
          youtube?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_social_media_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      connections: {
        Row: {
          connected_at: string | null
          connected_user_id: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      are_users_connected: {
        Args: { user_a: string; user_b: string }
        Returns: boolean
      }
      block_user: {
        Args: { blocked_id: string; blocker_id: string }
        Returns: undefined
      }
      clear_recent_searches: { Args: { p_user_id: string }; Returns: undefined }
      delete_notification: {
        Args: { notification_id: string; user_id: string }
        Returns: boolean
      }
      get_connection_status: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      get_or_create_direct_conversation: {
        Args: { user_a: string; user_b: string }
        Returns: string
      }
      get_recent_searches: {
        Args: { limit_count?: number; p_user_id: string }
        Returns: {
          created_at: string
          entity_details: Json
          entity_id: string
          entity_type: string
          id: string
          search_query: string
          search_tab: string
        }[]
      }
      get_story_view_count: { Args: { story_id: string }; Returns: number }
      get_suggested_people: {
        Args: { limit_count?: number; p_user_id: string }
        Returns: {
          avatar_url: string
          bio: string
          first_name: string
          id: string
          last_name: string
          location: string
          shared_genres_count: number
          suggestion_reason: string
          username: string
        }[]
      }
      get_trending_tags: {
        Args: { limit_count?: number }
        Returns: {
          id: string
          name: string
          recent_usage_count: number
          type: Database["public"]["Enums"]["metadata_type"]
          usage_count: number
        }[]
      }
      get_unread_message_count: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: number
      }
      has_viewed_story: {
        Args: { story_id: string; user_id: string }
        Returns: boolean
      }
      increment_unread_count: {
        Args: { p_conversation_id: string; p_sender_id: string }
        Returns: undefined
      }
      log_search: {
        Args: {
          p_entity_id?: string
          p_entity_type?: string
          p_search_query: string
          p_search_tab: string
          p_user_id: string
        }
        Returns: undefined
      }
      mark_conversation_read: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: undefined
      }
      search_collaborations: {
        Args: {
          filter_genres: string[]
          filter_location: string
          filter_paid_only: boolean
          limit_count: number
          offset_count: number
          p_user_id: string
          search_query: string
        }
        Returns: {
          author_avatar_url: string
          author_first_name: string
          author_id: string
          author_username: string
          created_at: string
          description: string
          genres: Json
          id: string
          location: string
          paid_opportunity: boolean
          relevance: number
          title: string
        }[]
      }
      search_for_you: {
        Args: {
          limit_count: number
          offset_count: number
          p_user_id: string
          search_query: string
        }
        Returns: {
          additional_info: Json
          avatar_url: string
          entity_id: string
          entity_type: string
          match_reason: string
          relevance: number
          subtitle: string
          title: string
        }[]
      }
      search_people: {
        Args: {
          filter_genres: string[]
          filter_location: string
          filter_looking_for: Database["public"]["Enums"]["looking_for_type"][]
          limit_count: number
          offset_count: number
          p_user_id: string
          search_query: string
        }
        Returns: {
          avatar_url: string
          bio: string
          first_name: string
          genres: Json
          id: string
          is_connected: boolean
          last_name: string
          location: string
          looking_for: string[]
          relevance: number
          username: string
        }[]
      }
      search_services: {
        Args: {
          limit_count: number
          offset_count: number
          search_query: string
        }
        Returns: {
          created_at: string
          description: string
          id: string
          location: string
          provider_avatar_url: string
          provider_id: string
          provider_name: string
          provider_username: string
          relevance: number
          service_type: string
          title: string
        }[]
      }
      search_tags: {
        Args: {
          filter_type?: string
          limit_count?: number
          offset_count?: number
          search_query?: string
        }
        Returns: {
          id: string
          name: string
          relevance: number
          type: string
          usage_count: number
        }[]
      }
      show_limit: { Args: never; Returns: number }
      show_trgm: { Args: { "": string }; Returns: string[] }
      unaccent: { Args: { "": string }; Returns: string }
      unblock_user: {
        Args: { blocked_id: string; blocker_id: string }
        Returns: undefined
      }
    }
    Enums: {
      conversation_type: "direct" | "group"
      looking_for_type: "connect" | "promote" | "find-band" | "find-services"
      media_type: "image" | "video"
      metadata_type: "tag" | "genre" | "interest" | "artist"
      notification_type:
        | "like"
        | "comment"
        | "connection_request"
        | "connection_accepted"
        | "tagged_in_post"
        | "review"
        | "collaboration_request"
        | "message"
      post_type: "note" | "request" | "story"
      service_type_ext:
        | "rehearsal_space"
        | "studio"
        | "recording"
        | "art"
        | "venue"
        | "teaching"
        | "equipment_rental"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      conversation_type: ["direct", "group"],
      looking_for_type: ["connect", "promote", "find-band", "find-services"],
      media_type: ["image", "video"],
      metadata_type: ["tag", "genre", "interest", "artist"],
      notification_type: [
        "like",
        "comment",
        "connection_request",
        "connection_accepted",
        "tagged_in_post",
        "review",
        "collaboration_request",
        "message",
      ],
      post_type: ["note", "request", "story"],
      service_type_ext: [
        "rehearsal_space",
        "studio",
        "recording",
        "art",
        "venue",
        "teaching",
        "equipment_rental",
      ],
    },
  },
} as const
