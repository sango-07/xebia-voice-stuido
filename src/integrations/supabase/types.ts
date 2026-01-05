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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      agents: {
        Row: {
          category: Database["public"]["Enums"]["agent_category"]
          company_name: string | null
          created_at: string
          description: string | null
          id: string
          languages: string[] | null
          name: string
          persona_name: string | null
          status: Database["public"]["Enums"]["agent_status"]
          system_prompt: string | null
          updated_at: string
          user_id: string
          voice_accent: string | null
          voice_gender: string | null
        }
        Insert: {
          category?: Database["public"]["Enums"]["agent_category"]
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          languages?: string[] | null
          name: string
          persona_name?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          updated_at?: string
          user_id: string
          voice_accent?: string | null
          voice_gender?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["agent_category"]
          company_name?: string | null
          created_at?: string
          description?: string | null
          id?: string
          languages?: string[] | null
          name?: string
          persona_name?: string | null
          status?: Database["public"]["Enums"]["agent_status"]
          system_prompt?: string | null
          updated_at?: string
          user_id?: string
          voice_accent?: string | null
          voice_gender?: string | null
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          agent_id: string
          cost_rupees: number | null
          created_at: string
          customer_phone: string | null
          duration_seconds: number | null
          id: string
          intent: string | null
          language: string | null
          outcome: Database["public"]["Enums"]["call_outcome"] | null
          sentiment: Database["public"]["Enums"]["call_sentiment"] | null
          transcript: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          cost_rupees?: number | null
          created_at?: string
          customer_phone?: string | null
          duration_seconds?: number | null
          id?: string
          intent?: string | null
          language?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null
          transcript?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          cost_rupees?: number | null
          created_at?: string
          customer_phone?: string | null
          duration_seconds?: number | null
          id?: string
          intent?: string | null
          language?: string | null
          outcome?: Database["public"]["Enums"]["call_outcome"] | null
          sentiment?: Database["public"]["Enums"]["call_sentiment"] | null
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "call_logs_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          agent_id: string
          chunks_count: number | null
          created_at: string
          file_name: string
          file_size_bytes: number | null
          file_url: string | null
          id: string
          status: string | null
        }
        Insert: {
          agent_id: string
          chunks_count?: number | null
          created_at?: string
          file_name: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          status?: string | null
        }
        Update: {
          agent_id?: string
          chunks_count?: number | null
          created_at?: string
          file_name?: string
          file_size_bytes?: number | null
          file_url?: string | null
          id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "knowledge_documents_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          role: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          role?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      templates: {
        Row: {
          category: Database["public"]["Enums"]["agent_category"]
          created_at: string
          description: string
          features: string[] | null
          icon: string | null
          id: string
          integrations: string[] | null
          is_production_ready: boolean | null
          name: string
        }
        Insert: {
          category: Database["public"]["Enums"]["agent_category"]
          created_at?: string
          description: string
          features?: string[] | null
          icon?: string | null
          id?: string
          integrations?: string[] | null
          is_production_ready?: boolean | null
          name: string
        }
        Update: {
          category?: Database["public"]["Enums"]["agent_category"]
          created_at?: string
          description?: string
          features?: string[] | null
          icon?: string | null
          id?: string
          integrations?: string[] | null
          is_production_ready?: boolean | null
          name?: string
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
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_sessions: {
        Row: {
          agent_id: string
          created_at: string
          customer_phone: string | null
          duration_seconds: number | null
          ended_at: string | null
          id: string
          intent: string | null
          language: string | null
          room_name: string
          sentiment: string | null
          started_at: string
          status: string
          transcript: string | null
          user_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          customer_phone?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          intent?: string | null
          language?: string | null
          room_name: string
          sentiment?: string | null
          started_at?: string
          status?: string
          transcript?: string | null
          user_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          customer_phone?: string | null
          duration_seconds?: number | null
          ended_at?: string | null
          id?: string
          intent?: string | null
          language?: string | null
          room_name?: string
          sentiment?: string | null
          started_at?: string
          status?: string
          transcript?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_sessions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      agent_category: "Banking" | "Insurance" | "Fintech"
      agent_status: "live" | "testing" | "draft"
      app_role: "admin" | "user"
      call_outcome: "resolved" | "escalated" | "abandoned"
      call_sentiment: "positive" | "neutral" | "negative"
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
      agent_category: ["Banking", "Insurance", "Fintech"],
      agent_status: ["live", "testing", "draft"],
      app_role: ["admin", "user"],
      call_outcome: ["resolved", "escalated", "abandoned"],
      call_sentiment: ["positive", "neutral", "negative"],
    },
  },
} as const
