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
      achievements: {
        Row: {
          created_at: string | null
          description: string | null
          icon: string | null
          id: string
          name: string
          points_reward: number | null
          requirement_type: string
          requirement_value: number
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points_reward?: number | null
          requirement_type: string
          requirement_value: number
        }
        Update: {
          created_at?: string | null
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points_reward?: number | null
          requirement_type?: string
          requirement_value?: number
        }
        Relationships: []
      }
      daily_fact_assignments: {
        Row: {
          created_at: string | null
          date: string
          fact_id: string
          id: string
          slot: number | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          fact_id: string
          id?: string
          slot?: number | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          fact_id?: string
          id?: string
          slot?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_fact_assignments_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "historical_facts"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_facts_progress: {
        Row: {
          created_at: string | null
          date: string
          facts_validated: number | null
          id: string
          period_id: string | null
          region: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          facts_validated?: number | null
          id?: string
          period_id?: string | null
          region?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          facts_validated?: number | null
          id?: string
          period_id?: string | null
          region?: string | null
          user_id?: string
        }
        Relationships: []
      }
      daily_points: {
        Row: {
          created_at: string | null
          date: string
          id: string
          points_earned: number
          user_id: string
        }
        Insert: {
          created_at?: string | null
          date?: string
          id?: string
          points_earned?: number
          user_id: string
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: []
      }
      grades: {
        Row: {
          created_at: string | null
          description: string | null
          historical_figure: string
          id: string
          image_url: string | null
          level: number
          max_points: number
          min_points: number
          name: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          historical_figure: string
          id?: string
          image_url?: string | null
          level: number
          max_points: number
          min_points: number
          name: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          historical_figure?: string
          id?: string
          image_url?: string | null
          level?: number
          max_points?: number
          min_points?: number
          name?: string
        }
        Relationships: []
      }
      historical_facts: {
        Row: {
          countries: string[] | null
          created_at: string | null
          date_text: string | null
          date_text_fr: string | null
          day: number | null
          description: string
          description_fr: string | null
          difficulty: string | null
          id: string
          image_credit: string | null
          image_source_url: string | null
          image_url: string | null
          month: number | null
          period_id: string | null
          points_reward: number | null
          region: string | null
          region_fr: string | null
          slug: string | null
          source_url: string | null
          tags: string[] | null
          tags_fr: string[] | null
          title: string
          title_fr: string | null
          year: number | null
        }
        Insert: {
          countries?: string[] | null
          created_at?: string | null
          date_text?: string | null
          date_text_fr?: string | null
          day?: number | null
          description: string
          description_fr?: string | null
          difficulty?: string | null
          id?: string
          image_credit?: string | null
          image_source_url?: string | null
          image_url?: string | null
          month?: number | null
          period_id?: string | null
          points_reward?: number | null
          region?: string | null
          region_fr?: string | null
          slug?: string | null
          source_url?: string | null
          tags?: string[] | null
          tags_fr?: string[] | null
          title: string
          title_fr?: string | null
          year?: number | null
        }
        Update: {
          countries?: string[] | null
          created_at?: string | null
          date_text?: string | null
          date_text_fr?: string | null
          day?: number | null
          description?: string
          description_fr?: string | null
          difficulty?: string | null
          id?: string
          image_credit?: string | null
          image_source_url?: string | null
          image_url?: string | null
          month?: number | null
          period_id?: string | null
          points_reward?: number | null
          region?: string | null
          region_fr?: string | null
          slug?: string | null
          source_url?: string | null
          tags?: string[] | null
          tags_fr?: string[] | null
          title?: string
          title_fr?: string | null
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "historical_facts_period_id_fkey"
            columns: ["period_id"]
            isOneToOne: false
            referencedRelation: "historical_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      historical_periods: {
        Row: {
          created_at: string | null
          description: string | null
          end_year: number | null
          id: string
          image_url: string | null
          name: string
          order_index: number
          start_year: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_year?: number | null
          id?: string
          image_url?: string | null
          name: string
          order_index: number
          start_year?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_year?: number | null
          id?: string
          image_url?: string | null
          name?: string
          order_index?: number
          start_year?: number | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          current_streak: number | null
          exp: number | null
          id: string
          is_premium: boolean | null
          last_activity_date: string | null
          learning_goal: string | null
          level: number | null
          onboarding_completed: boolean | null
          points: number | null
          preferred_difficulty: string[] | null
          preferred_eras: string[] | null
          preferred_regions: string[] | null
          preferred_tags: string[] | null
          premium_until: string | null
          profile_type: string | null
          stripe_customer_id: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          exp?: number | null
          id: string
          is_premium?: boolean | null
          last_activity_date?: string | null
          learning_goal?: string | null
          level?: number | null
          onboarding_completed?: boolean | null
          points?: number | null
          preferred_difficulty?: string[] | null
          preferred_eras?: string[] | null
          preferred_regions?: string[] | null
          preferred_tags?: string[] | null
          premium_until?: string | null
          profile_type?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          current_streak?: number | null
          exp?: number | null
          id?: string
          is_premium?: boolean | null
          last_activity_date?: string | null
          learning_goal?: string | null
          level?: number | null
          onboarding_completed?: boolean | null
          points?: number | null
          preferred_difficulty?: string[] | null
          preferred_eras?: string[] | null
          preferred_regions?: string[] | null
          preferred_tags?: string[] | null
          premium_until?: string | null
          profile_type?: string | null
          stripe_customer_id?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      quiz_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          exp_earned: number
          id: string
          score: number
          total_questions: number
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          exp_earned: number
          id?: string
          score: number
          total_questions: number
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          exp_earned?: number
          id?: string
          score?: number
          total_questions?: number
          user_id?: string
        }
        Relationships: []
      }
      quotes: {
        Row: {
          author: string
          context: string | null
          context_fr: string | null
          created_at: string | null
          id: string
          original_text: string | null
          slug: string
          source_url: string | null
          text: string | null
          text_fr: string
          year: number | null
        }
        Insert: {
          author: string
          context?: string | null
          context_fr?: string | null
          created_at?: string | null
          id?: string
          original_text?: string | null
          slug: string
          source_url?: string | null
          text?: string | null
          text_fr: string
          year?: number | null
        }
        Update: {
          author?: string
          context?: string | null
          context_fr?: string | null
          created_at?: string | null
          id?: string
          original_text?: string | null
          slug?: string
          source_url?: string | null
          text?: string | null
          text_fr?: string
          year?: number | null
        }
        Relationships: []
      }
      streak_milestones: {
        Row: {
          created_at: string | null
          days: number
          description: string | null
          icon: string | null
          id: string
          name: string
          points_reward: number
        }
        Insert: {
          created_at?: string | null
          days: number
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          points_reward?: number
        }
        Update: {
          created_at?: string | null
          days?: number
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          points_reward?: number
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          id: string
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          id?: string
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          id?: string
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_achievement_id_fkey"
            columns: ["achievement_id"]
            isOneToOne: false
            referencedRelation: "achievements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_progress: {
        Row: {
          attempts: number | null
          completed: boolean | null
          completed_at: string | null
          created_at: string | null
          fact_id: string
          id: string
          user_id: string
        }
        Insert: {
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          fact_id: string
          id?: string
          user_id: string
        }
        Update: {
          attempts?: number | null
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string | null
          fact_id?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_progress_fact_id_fkey"
            columns: ["fact_id"]
            isOneToOne: false
            referencedRelation: "historical_facts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_streak_milestones: {
        Row: {
          achieved_at: string | null
          id: string
          milestone_id: string
          user_id: string
        }
        Insert: {
          achieved_at?: string | null
          id?: string
          milestone_id: string
          user_id: string
        }
        Update: {
          achieved_at?: string | null
          id?: string
          milestone_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_streak_milestones_milestone_id_fkey"
            columns: ["milestone_id"]
            isOneToOne: false
            referencedRelation: "streak_milestones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      complete_quiz: {
        Args: { p_date: string; p_difficulty: string; p_score: number; p_total: number }
        Returns: Json
      }
      delete_my_account: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_daily_facts: {
        Args: { p_date: string }
        Returns: { fact_id: string; slot: number }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_daily_fact: {
        Args: { p_date: string; p_fact_id: string }
        Returns: Json
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
