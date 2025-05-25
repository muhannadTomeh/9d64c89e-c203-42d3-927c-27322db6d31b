export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      customers: {
        Row: {
          bags_count: number
          created_at: string
          id: string
          name: string
          notes: string | null
          phone_number: string | null
          status: Database["public"]["Enums"]["customer_status"]
          user_id: string
        }
        Insert: {
          bags_count: number
          created_at?: string
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          user_id: string
        }
        Update: {
          bags_count?: number
          created_at?: string
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          status?: Database["public"]["Enums"]["customer_status"]
          user_id?: string
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          date: string
          id: string
          notes: string | null
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          date?: string
          id?: string
          notes?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
        }
        Relationships: []
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
          payment_method: Database["public"]["Enums"]["payment_method"]
          return_amount: Json
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
          oil_amount: number
          payment_method: Database["public"]["Enums"]["payment_method"]
          return_amount: Json
          tanks?: Json
          tanks_payment: Json
          total: Json
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
          payment_method?: Database["public"]["Enums"]["payment_method"]
          return_amount?: Json
          tanks?: Json
          tanks_payment?: Json
          total?: Json
          user_id?: string
        }
        Relationships: []
      }
      oil_trades: {
        Row: {
          amount: number
          date: string
          id: string
          notes: string | null
          person_name: string | null
          price: number
          total: number
          type: Database["public"]["Enums"]["trade_type"]
          user_id: string
        }
        Insert: {
          amount: number
          date?: string
          id?: string
          notes?: string | null
          person_name?: string | null
          price: number
          total: number
          type: Database["public"]["Enums"]["trade_type"]
          user_id: string
        }
        Update: {
          amount?: number
          date?: string
          id?: string
          notes?: string | null
          person_name?: string | null
          price?: number
          total?: number
          type?: Database["public"]["Enums"]["trade_type"]
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      settings: {
        Row: {
          cash_return_price: number
          created_at: string
          id: string
          oil_buy_price: number
          oil_return_percentage: number
          oil_sell_price: number
          tank_prices: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          cash_return_price?: number
          created_at?: string
          id?: string
          oil_buy_price?: number
          oil_return_percentage?: number
          oil_sell_price?: number
          tank_prices?: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          cash_return_price?: number
          created_at?: string
          id?: string
          oil_buy_price?: number
          oil_return_percentage?: number
          oil_sell_price?: number
          tank_prices?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      worker_payments: {
        Row: {
          amount: number
          date: string
          id: string
          notes: string | null
          user_id: string
          worker_id: string
        }
        Insert: {
          amount: number
          date?: string
          id?: string
          notes?: string | null
          user_id: string
          worker_id: string
        }
        Update: {
          amount?: number
          date?: string
          id?: string
          notes?: string | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
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
          shifts: number | null
          user_id: string
          worker_id: string
        }
        Insert: {
          amount: number
          date: string
          hours?: number | null
          id?: string
          is_paid?: boolean
          notes?: string | null
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
          shifts?: number | null
          user_id?: string
          worker_id?: string
        }
        Relationships: [
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
          shift_rate: number | null
          type: Database["public"]["Enums"]["worker_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          hourly_rate?: number | null
          id?: string
          name: string
          notes?: string | null
          phone_number?: string | null
          shift_rate?: number | null
          type: Database["public"]["Enums"]["worker_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          hourly_rate?: number | null
          id?: string
          name?: string
          notes?: string | null
          phone_number?: string | null
          shift_rate?: number | null
          type?: Database["public"]["Enums"]["worker_type"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      customer_status: "pending" | "completed"
      payment_method: "oil" | "cash" | "mixed"
      tank_type: "plastic" | "metal"
      trade_type: "buy" | "sell"
      worker_type: "hourly" | "shift"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      customer_status: ["pending", "completed"],
      payment_method: ["oil", "cash", "mixed"],
      tank_type: ["plastic", "metal"],
      trade_type: ["buy", "sell"],
      worker_type: ["hourly", "shift"],
    },
  },
} as const
