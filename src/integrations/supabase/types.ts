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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      account_usernames: {
        Row: {
          created_at: string
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string
          user_id: string
          username: string
        }
        Update: {
          created_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      auth_rate_events: {
        Row: {
          created_at: string
          id: string
          key_hash: string
          kind: string
        }
        Insert: {
          created_at?: string
          id?: string
          key_hash: string
          kind: string
        }
        Update: {
          created_at?: string
          id?: string
          key_hash?: string
          kind?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          attachment_id: string | null
          avatar_url: string | null
          body: string
          client_id: string
          created_at: string
          id: string
          sender_id: string
          username: string
        }
        Insert: {
          attachment_id?: string | null
          avatar_url?: string | null
          body?: string
          client_id: string
          created_at?: string
          id?: string
          sender_id: string
          username: string
        }
        Update: {
          attachment_id?: string | null
          avatar_url?: string | null
          body?: string
          client_id?: string
          created_at?: string
          id?: string
          sender_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_attachment_id_fkey"
            columns: ["attachment_id"]
            isOneToOne: false
            referencedRelation: "chat_uploads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_uploads: {
        Row: {
          cancelled: boolean
          created_at: string
          id: string
          mime: string
          name: string
          owner_id: string
          path: string
          size: number
          verified: boolean
        }
        Insert: {
          cancelled?: boolean
          created_at?: string
          id?: string
          mime: string
          name: string
          owner_id: string
          path: string
          size: number
          verified?: boolean
        }
        Update: {
          cancelled?: boolean
          created_at?: string
          id?: string
          mime?: string
          name?: string
          owner_id?: string
          path?: string
          size?: number
          verified?: boolean
        }
        Relationships: []
      }
      dm_conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string
          read_a: string
          read_b: string
          user_a: string
          user_b: string
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string
          read_a?: string
          read_b?: string
          user_a: string
          user_b: string
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string
          read_a?: string
          read_b?: string
          user_a?: string
          user_b?: string
        }
        Relationships: []
      }
      dm_hidden_messages: {
        Row: {
          created_at: string
          message_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          message_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          message_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_hidden_messages_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "dm_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      dm_messages: {
        Row: {
          body: string
          client_id: string
          conversation_id: string
          created_at: string
          deleted_at: string | null
          id: string
          sender_id: string
        }
        Insert: {
          body: string
          client_id: string
          conversation_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          sender_id: string
        }
        Update: {
          body?: string
          client_id?: string
          conversation_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "dm_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "dm_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      follows: {
        Row: {
          created_at: string
          followee_id: string
          follower_id: string
        }
        Insert: {
          created_at?: string
          followee_id: string
          follower_id: string
        }
        Update: {
          created_at?: string
          followee_id?: string
          follower_id?: string
        }
        Relationships: []
      }
      post_comments: {
        Row: {
          body: string
          content_id: string
          created_at: string
          id: string
          user_id: string
          username: string
        }
        Insert: {
          body: string
          content_id: string
          created_at?: string
          id?: string
          user_id: string
          username: string
        }
        Update: {
          body?: string
          content_id?: string
          created_at?: string
          id?: string
          user_id?: string
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_comments_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "publishing_content"
            referencedColumns: ["id"]
          },
        ]
      }
      post_likes: {
        Row: {
          content_id: string
          created_at: string
          user_id: string
        }
        Insert: {
          content_id: string
          created_at?: string
          user_id: string
        }
        Update: {
          content_id?: string
          created_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "post_likes_content_id_fkey"
            columns: ["content_id"]
            isOneToOne: false
            referencedRelation: "publishing_content"
            referencedColumns: ["id"]
          },
        ]
      }
      publishing_attempts: {
        Row: {
          created_at: string
          failed: boolean
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          failed?: boolean
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string
          failed?: boolean
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      publishing_content: {
        Row: {
          attachments: Json
          body: string
          category: string
          created_at: string
          id: string
          intent: string
          kind: string
          note: string
          owner_id: string
          published_at: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          title: string
        }
        Insert: {
          attachments?: Json
          body: string
          category: string
          created_at?: string
          id?: string
          intent: string
          kind: string
          note?: string
          owner_id: string
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title: string
        }
        Update: {
          attachments?: Json
          body?: string
          category?: string
          created_at?: string
          id?: string
          intent?: string
          kind?: string
          note?: string
          owner_id?: string
          published_at?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_rate_allowed: {
        Args: {
          p_key: string
          p_kind: string
          p_limit: number
          p_window_seconds: number
        }
        Returns: boolean
      }
      auth_rate_record: {
        Args: { p_key: string; p_kind: string }
        Returns: undefined
      }
      cancel_chat_upload: {
        Args: { p_id: string; p_user: string }
        Returns: string
      }
      claim_chat_upload: {
        Args: { p_id: string; p_path: string; p_user: string }
        Returns: boolean
      }
      create_publishing_content: {
        Args: {
          p_attachments: Json
          p_body: string
          p_category: string
          p_intent: string
          p_kind: string
          p_title: string
          p_user: string
        }
        Returns: string
      }
      dm_delete: {
        Args: { p_message: string; p_scope: string; p_user: string }
        Returns: undefined
      }
      dm_inbox: {
        Args: { p_user: string }
        Returns: {
          id: string
          last_at: string
          last_body: string
          last_deleted: boolean
          last_sender: string
          other_id: string
          other_read_at: string
          other_username: string
          unread: number
        }[]
      }
      dm_mark_read: {
        Args: { p_conversation: string; p_user: string }
        Returns: undefined
      }
      dm_send: {
        Args: {
          p_body: string
          p_client: string
          p_conversation: string
          p_user: string
        }
        Returns: string
      }
      dm_start: { Args: { p_other: string; p_user: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      moderate_publishing_content: {
        Args: {
          p_action: string
          p_actor: string
          p_id: string
          p_note?: string
        }
        Returns: undefined
      }
      reserve_publishing_attempt: { Args: { p_user: string }; Returns: string }
      send_chat_message: {
        Args: {
          p_attachment?: string
          p_avatar: string
          p_body: string
          p_client: string
          p_sender: string
          p_username: string
        }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
