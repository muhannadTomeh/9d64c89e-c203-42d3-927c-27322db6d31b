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
      companies: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      customers: {
        Row: {
          bags_count: number
          created_at: string
          id: string
          name: string
          notes: string | null
          phone_number: string | null
          season_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          bags_count?: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          season_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          bags_count?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          season_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "customers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string
          date: string
          id: string
          notes: string | null
          season_id: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          category: string
          date?: string
          id?: string
          notes?: string | null
          season_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          date?: string
          id?: string
          notes?: string | null
          season_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expenses_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          customer_id: string
          customer_name: string
          customer_phone: string | null
          date: string
          id: string
          notes: string | null
          oil_amount: number
          payment_method: string
          return_amount: Json
          season_id: string | null
          tanks: Json
          tanks_payment: Json
          total: Json
          user_id: string
        }
        Insert: {
          customer_id: string
          customer_name: string
          customer_phone?: string | null
          date?: string
          id?: string
          notes?: string | null
          oil_amount?: number
          payment_method?: string
          return_amount?: Json
          season_id?: string | null
          tanks?: Json
          tanks_payment?: Json
          total?: Json
          user_id: string
        }
        Update: {
          customer_id?: string
          customer_name?: string
          customer_phone?: string | null
          date?: string
          id?: string
          notes?: string | null
          oil_amount?: number
          payment_method?: string
          return_amount?: Json
          season_id?: string | null
          tanks?: Json
          tanks_payment?: Json
          total?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      oil_trades: {
        Row: {
          amount: number
          date: string
          id: string
          notes: string | null
          person_name: string | null
          price: number
          season_id: string | null
          total: number
          type: string
          user_id: string
        }
        Insert: {
          amount?: number
          date?: string
          id?: string
          notes?: string | null
          person_name?: string | null
          price?: number
          season_id?: string | null
          total?: number
          type?: string
          user_id: string
        }
        Update: {
          amount?: number
          date?: string
          id?: string
          notes?: string | null
          person_name?: string | null
          price?: number
          season_id?: string | null
          total?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "oil_trades_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      seasons: {
        Row: {
          company_id: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          year: number
        }
        Insert: {
          company_id: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
          year: number
        }
        Update: {
          company_id?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "seasons_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      settings: {
        Row: {
          cash_return_price: number
          id: string
          oil_buy_price: number
          oil_return_percentage: number
          oil_sell_price: number
          season_id: string | null
          tank_prices: Json
          user_id: string
        }
        Insert: {
          cash_return_price?: number
          id?: string
          oil_buy_price?: number
          oil_return_percentage?: number
          oil_sell_price?: number
          season_id?: string | null
          tank_prices?: Json
          user_id: string
        }
        Update: {
          cash_return_price?: number
          id?: string
          oil_buy_price?: number
          oil_return_percentage?: number
          oil_sell_price?: number
          season_id?: string | null
          tank_prices?: Json
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          company_id: string | null
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          role: string
          updated_at: string
        }
        Insert: {
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          company_id?: string | null
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          role?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_profiles_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_payments: {
        Row: {
          amount: number
          date: string
          id: string
          notes: string | null
          season_id: string | null
          user_id: string
          worker_id: string
        }
        Insert: {
          amount?: number
          date?: string
          id?: string
          notes?: string | null
          season_id?: string | null
          user_id: string
          worker_id: string
        }
        Update: {
          amount?: number
          date?: string
          id?: string
          notes?: string | null
          season_id?: string | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_payments_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_payments_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      worker_shifts: {
        Row: {
          amount: number
          date: string
          hours: number | null
          id: string
          is_paid: boolean
          notes: string | null
          season_id: string | null
          shifts: number | null
          user_id: string
          worker_id: string
        }
        Insert: {
          amount?: number
          date?: string
          hours?: number | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          season_id?: string | null
          shifts?: number | null
          user_id: string
          worker_id: string
        }
        Update: {
          amount?: number
          date?: string
          hours?: number | null
          id?: string
          is_paid?: boolean
          notes?: string | null
          season_id?: string | null
          shifts?: number | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "worker_shifts_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "worker_shifts_worker_id_fkey"
            columns: ["worker_id"]
            isOneToOne: false
            referencedRelation: "workers"
            referencedColumns: ["id"]
          },
        ]
      }
      workers: {
        Row: {
          created_at: string
          hourly_rate: number | null
          id: string
          name: string
          notes: string | null
          phone_number: string | null
          season_id: string | null
          shift_rate: number | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          hourly_rate?: number | null
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          season_id?: string | null
          shift_rate?: number | null
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          season_id?: string | null
          shift_rate?: number | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workers_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "seasons"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_role: { Args: { user_id: string }; Returns: string }
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
