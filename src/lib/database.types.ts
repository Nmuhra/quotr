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
      businesses: {
        Row: {
          address: string | null
          bank_account: string | null
          bank_branch: string | null
          bank_name: string | null
          created_at: string
          default_deposit_pct: number
          default_payment_terms: string
          default_validity_days: number
          default_vat_enabled: boolean
          default_vat_rate: number
          deleted_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          name: string
          owner_id: string
          payfast_token: string | null
          phone: string | null
          registration_number: string | null
          subscription_ends_at: string | null
          subscription_status: string
          trade_type: string
          trial_ends_at: string
          updated_at: string
          vat_number: string | null
        }
        Insert: {
          address?: string | null
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          default_deposit_pct?: number
          default_payment_terms?: string
          default_validity_days?: number
          default_vat_enabled?: boolean
          default_vat_rate?: number
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name: string
          owner_id: string
          payfast_token?: string | null
          phone?: string | null
          registration_number?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string
          trade_type: string
          trial_ends_at?: string
          updated_at?: string
          vat_number?: string | null
        }
        Update: {
          address?: string | null
          bank_account?: string | null
          bank_branch?: string | null
          bank_name?: string | null
          created_at?: string
          default_deposit_pct?: number
          default_payment_terms?: string
          default_validity_days?: number
          default_vat_enabled?: boolean
          default_vat_rate?: number
          deleted_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          owner_id?: string
          payfast_token?: string | null
          phone?: string | null
          registration_number?: string | null
          subscription_ends_at?: string | null
          subscription_status?: string
          trade_type?: string
          trial_ends_at?: string
          updated_at?: string
          vat_number?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          address: string | null
          business_id: string
          created_at: string
          deleted_at: string | null
          email: string | null
          id: string
          name: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          business_id: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          business_id?: string
          created_at?: string
          deleted_at?: string | null
          email?: string | null
          id?: string
          name?: string
          phone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clients_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount: number
          business_id: string
          created_at: string
          deleted_at: string | null
          id: string
          invoice_number: string
          paid_at: string | null
          payfast_payment_id: string | null
          payment_url: string | null
          quote_id: string
          status: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          business_id: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          invoice_number: string
          paid_at?: string | null
          payfast_payment_id?: string | null
          payment_url?: string | null
          quote_id: string
          status?: string
          type?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          business_id?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          invoice_number?: string
          paid_at?: string | null
          payfast_payment_id?: string | null
          payment_url?: string | null
          quote_id?: string
          status?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      line_item_templates: {
        Row: {
          business_id: string | null
          created_at: string
          description: string | null
          id: string
          is_system: boolean
          name: string
          sort_order: number
          trade_type: string
          unit: string
          unit_price: number
          updated_at: string
        }
        Insert: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name: string
          sort_order?: number
          trade_type: string
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Update: {
          business_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_system?: boolean
          name?: string
          sort_order?: number
          trade_type?: string
          unit?: string
          unit_price?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "line_item_templates_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
        ]
      }
      push_tokens: {
        Row: {
          created_at: string
          id: string
          platform: string
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          platform: string
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          platform?: string
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      quote_line_items: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          quantity: number
          quote_id: string
          sort_order: number
          total: number | null
          unit: string
          unit_price: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          quantity?: number
          quote_id: string
          sort_order?: number
          total?: number | null
          unit?: string
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          quantity?: number
          quote_id?: string
          sort_order?: number
          total?: number | null
          unit?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "quote_line_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "quotes"
            referencedColumns: ["id"]
          },
        ]
      }
      quotes: {
        Row: {
          business_id: string
          client_id: string | null
          created_at: string
          deleted_at: string | null
          deposit_amount: number
          deposit_pct: number
          expires_at: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          pdf_url: string | null
          public_token: string
          quote_number: string
          scope_text: string | null
          sent_at: string | null
          signed_at: string | null
          signed_ip: string | null
          signed_name: string | null
          signed_svg_url: string | null
          status: string
          subtotal: number
          total: number
          updated_at: string
          validity_days: number
          vat_amount: number
          vat_enabled: boolean
          vat_rate: number
        }
        Insert: {
          business_id: string
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deposit_amount?: number
          deposit_pct?: number
          expires_at?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          public_token?: string
          quote_number: string
          scope_text?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          signed_name?: string | null
          signed_svg_url?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          validity_days?: number
          vat_amount?: number
          vat_enabled?: boolean
          vat_rate?: number
        }
        Update: {
          business_id?: string
          client_id?: string | null
          created_at?: string
          deleted_at?: string | null
          deposit_amount?: number
          deposit_pct?: number
          expires_at?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          pdf_url?: string | null
          public_token?: string
          quote_number?: string
          scope_text?: string | null
          sent_at?: string | null
          signed_at?: string | null
          signed_ip?: string | null
          signed_name?: string | null
          signed_svg_url?: string | null
          status?: string
          subtotal?: number
          total?: number
          updated_at?: string
          validity_days?: number
          vat_amount?: number
          vat_enabled?: boolean
          vat_rate?: number
        }
        Relationships: [
          {
            foreignKeyName: "quotes_business_id_fkey"
            columns: ["business_id"]
            isOneToOne: false
            referencedRelation: "businesses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "quotes_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      sequences: {
        Row: {
          business_id: string
          current_value: number
          type: string
        }
        Insert: {
          business_id: string
          current_value?: number
          type: string
        }
        Update: {
          business_id?: string
          current_value?: number
          type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_public_token: { Args: never; Returns: string }
      my_business_id: { Args: never; Returns: string }
      next_sequence: {
        Args: { p_business_id: string; p_type: string }
        Returns: number
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const

// ─── Manual Type Aliases ─────────────────────────────────────
export type Business = Tables<'businesses'>
export type SubscriptionStatus = 'trial' | 'active' | 'past_due' | 'cancelled'
export type TradeType = 'electrician' | 'plumber' | 'builder' | 'roofer' | 'painter' | 'general'
