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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          id: string
          merchant_id: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_amount: number
          title: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          merchant_id?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount: number
          title: string
          token?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          merchant_id?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount?: number
          title?: string
          token?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "goals_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      locks: {
        Row: {
          amount: number
          apy_bps: number
          created_at: string
          duration_days: number
          id: string
          status: Database["public"]["Enums"]["lock_status"]
          token: string
          tx_hash: string | null
          unlock_at: string
          user_id: string
        }
        Insert: {
          amount: number
          apy_bps: number
          created_at?: string
          duration_days: number
          id?: string
          status?: Database["public"]["Enums"]["lock_status"]
          token: string
          tx_hash?: string | null
          unlock_at: string
          user_id: string
        }
        Update: {
          amount?: number
          apy_bps?: number
          created_at?: string
          duration_days?: number
          id?: string
          status?: Database["public"]["Enums"]["lock_status"]
          token?: string
          tx_hash?: string | null
          unlock_at?: string
          user_id?: string
        }
        Relationships: []
      }
      merchants: {
        Row: {
          business_name: string
          category: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          owner_user_id: string
          settlement_address: string
          verification_status: Database["public"]["Enums"]["verification_status"]
        }
        Insert: {
          business_name: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          owner_user_id: string
          settlement_address: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Update: {
          business_name?: string
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          owner_user_id?: string
          settlement_address?: string
          verification_status?: Database["public"]["Enums"]["verification_status"]
        }
        Relationships: []
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          merchant_id: string
          payer_user_id: string | null
          status: Database["public"]["Enums"]["payment_status"]
          token: string
          tx_hash: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          merchant_id: string
          payer_user_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          token: string
          tx_hash?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          merchant_id?: string
          payer_user_id?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          token?: string
          tx_hash?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_merchant_id_fkey"
            columns: ["merchant_id"]
            isOneToOne: false
            referencedRelation: "merchants"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          country: string | null
          created_at: string
          display_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          country?: string | null
          created_at?: string
          display_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      strategies: {
        Row: {
          chain: string
          created_at: string
          current_apy_bps: number
          description: string | null
          id: string
          is_active: boolean
          name: string
          protocol: string
          risk_level: string
          token: string
          tvl: number
        }
        Insert: {
          chain: string
          created_at?: string
          current_apy_bps?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          protocol: string
          risk_level?: string
          token: string
          tvl?: number
        }
        Update: {
          chain?: string
          created_at?: string
          current_apy_bps?: number
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          protocol?: string
          risk_level?: string
          token?: string
          tvl?: number
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wallets: {
        Row: {
          address: string
          chain_id: number
          created_at: string
          id: string
          is_primary: boolean
          label: string | null
          user_id: string
        }
        Insert: {
          address: string
          chain_id: number
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string | null
          user_id: string
        }
        Update: {
          address?: string
          chain_id?: number
          created_at?: string
          id?: string
          is_primary?: boolean
          label?: string | null
          user_id?: string
        }
        Relationships: []
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
      app_role: "admin" | "merchant" | "user"
      goal_status: "active" | "completed" | "refunded" | "cancelled"
      lock_status: "active" | "matured" | "withdrawn" | "early_exit"
      payment_status: "pending" | "confirmed" | "failed"
      verification_status: "pending" | "verified" | "rejected"
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
      app_role: ["admin", "merchant", "user"],
      goal_status: ["active", "completed", "refunded", "cancelled"],
      lock_status: ["active", "matured", "withdrawn", "early_exit"],
      payment_status: ["pending", "confirmed", "failed"],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
