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
      clerk_links: {
        Row: {
          clerk_user_id: string
          created_at: string
          email: string | null
          user_id: string
        }
        Insert: {
          clerk_user_id: string
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Update: {
          clerk_user_id?: string
          created_at?: string
          email?: string | null
          user_id?: string
        }
        Relationships: []
      }
      deposit_intents: {
        Row: {
          amount: number
          bridge_tx_hash: string | null
          bridging_at: string | null
          completed_at: string | null
          created_at: string
          deposit_address: string | null
          dest_address: string
          dest_tx_hash: string | null
          detected_at: string | null
          failure_reason: string | null
          from_chain_id: number
          from_token: string
          goal_id: string | null
          id: string
          squid_request_id: string | null
          squid_route: Json | null
          src_tx_hash: string | null
          status: Database["public"]["Enums"]["deposit_intent_status"]
          to_chain_id: number
          to_token: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bridge_tx_hash?: string | null
          bridging_at?: string | null
          completed_at?: string | null
          created_at?: string
          deposit_address?: string | null
          dest_address: string
          dest_tx_hash?: string | null
          detected_at?: string | null
          failure_reason?: string | null
          from_chain_id: number
          from_token: string
          goal_id?: string | null
          id?: string
          squid_request_id?: string | null
          squid_route?: Json | null
          src_tx_hash?: string | null
          status?: Database["public"]["Enums"]["deposit_intent_status"]
          to_chain_id?: number
          to_token?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bridge_tx_hash?: string | null
          bridging_at?: string | null
          completed_at?: string | null
          created_at?: string
          deposit_address?: string | null
          dest_address?: string
          dest_tx_hash?: string | null
          detected_at?: string | null
          failure_reason?: string | null
          from_chain_id?: number
          from_token?: string
          goal_id?: string | null
          id?: string
          squid_request_id?: string | null
          squid_route?: Json | null
          src_tx_hash?: string | null
          status?: Database["public"]["Enums"]["deposit_intent_status"]
          to_chain_id?: number
          to_token?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      goals: {
        Row: {
          category: string | null
          created_at: string
          current_amount: number
          deadline: string | null
          frequency: string
          id: string
          merchant_id: string | null
          merchant_product_ref: string | null
          status: Database["public"]["Enums"]["goal_status"]
          target_amount: number
          title: string
          token: string
          user_id: string
          vault_address: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          frequency?: string
          id?: string
          merchant_id?: string | null
          merchant_product_ref?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount: number
          title: string
          token?: string
          user_id: string
          vault_address?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          current_amount?: number
          deadline?: string | null
          frequency?: string
          id?: string
          merchant_id?: string | null
          merchant_product_ref?: string | null
          status?: Database["public"]["Enums"]["goal_status"]
          target_amount?: number
          title?: string
          token?: string
          user_id?: string
          vault_address?: string | null
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
      legacy_users: {
        Row: {
          email: string | null
          id: string
        }
        Insert: {
          email?: string | null
          id: string
        }
        Update: {
          email?: string | null
          id?: string
        }
        Relationships: []
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
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          kind: string
          read: boolean
          ref_id: string | null
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          ref_id?: string | null
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          kind?: string
          read?: boolean
          ref_id?: string | null
          title?: string
          user_id?: string
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
      transactions: {
        Row: {
          amount: number
          chain_id: number | null
          counterparty: string | null
          created_at: string
          description: string | null
          dest_tx_hash: string | null
          from_chain_id: number | null
          id: string
          metadata: Json
          ref_id: string | null
          src_tx_hash: string | null
          status: Database["public"]["Enums"]["transaction_status"]
          to_chain_id: number | null
          token: string
          tx_hash: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          chain_id?: number | null
          counterparty?: string | null
          created_at?: string
          description?: string | null
          dest_tx_hash?: string | null
          from_chain_id?: number | null
          id?: string
          metadata?: Json
          ref_id?: string | null
          src_tx_hash?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          to_chain_id?: number | null
          token?: string
          tx_hash?: string | null
          type: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          chain_id?: number | null
          counterparty?: string | null
          created_at?: string
          description?: string | null
          dest_tx_hash?: string | null
          from_chain_id?: number | null
          id?: string
          metadata?: Json
          ref_id?: string | null
          src_tx_hash?: string | null
          status?: Database["public"]["Enums"]["transaction_status"]
          to_chain_id?: number | null
          token?: string
          tx_hash?: string | null
          type?: Database["public"]["Enums"]["transaction_type"]
          updated_at?: string
          user_id?: string
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
      deposit_intent_status:
        | "pending"
        | "detected"
        | "bridging"
        | "completed"
        | "failed"
      goal_status: "active" | "completed" | "refunded" | "cancelled"
      lock_status: "active" | "matured" | "withdrawn" | "early_exit"
      payment_status: "pending" | "confirmed" | "failed"
      transaction_status: "pending" | "processing" | "completed" | "failed"
      transaction_type:
        | "deposit"
        | "transfer"
        | "withdrawal"
        | "bridge"
        | "vault_deposit"
        | "goal_funding"
        | "yield"
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
      deposit_intent_status: [
        "pending",
        "detected",
        "bridging",
        "completed",
        "failed",
      ],
      goal_status: ["active", "completed", "refunded", "cancelled"],
      lock_status: ["active", "matured", "withdrawn", "early_exit"],
      payment_status: ["pending", "confirmed", "failed"],
      transaction_status: ["pending", "processing", "completed", "failed"],
      transaction_type: [
        "deposit",
        "transfer",
        "withdrawal",
        "bridge",
        "vault_deposit",
        "goal_funding",
        "yield",
      ],
      verification_status: ["pending", "verified", "rejected"],
    },
  },
} as const
