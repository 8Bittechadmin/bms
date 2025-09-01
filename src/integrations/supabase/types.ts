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
      bookings: {
        Row: {
          client_id: string | null
          created_at: string | null
          deposit_amount: number | null
          deposit_paid: boolean | null
          end_date: string
          event_name: string
          event_type: string
          guest_count: number
          id: string
          notes: string | null
          start_date: string
          status: string
          total_amount: number | null
          updated_at: string | null
          venue_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          end_date: string
          event_name: string
          event_type: string
          guest_count: number
          id?: string
          notes?: string | null
          start_date: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          deposit_amount?: number | null
          deposit_paid?: boolean | null
          end_date?: string
          event_name?: string
          event_type?: string
          guest_count?: number
          id?: string
          notes?: string | null
          start_date?: string
          status?: string
          total_amount?: number | null
          updated_at?: string | null
          venue_id?: string | null
        }
        Relationships: []
      }
      client_messages: {
        Row: {
          client_id: string | null
          created_at: string | null
          id: string
          message: string
          sender: string
          sent_at: string | null
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          message: string
          sender: string
          sent_at?: string | null
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          id?: string
          message?: string
          sender?: string
          sent_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_messages_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_type: string | null
          created_at: string | null
          email: string | null
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          client_type?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      dashboard_notifications: {
        Row: {
          created_at: string
          description: string
          id: string
          is_read: boolean
          time: string
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          is_read?: boolean
          time: string
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          is_read?: boolean
          time?: string
          title?: string
        }
        Relationships: []
      }
      dashboard_stats: {
        Row: {
          active_venues: number
          bookings_this_month: number
          id: string
          last_updated: string
          total_guests_today: number
          total_revenue: number
        }
        Insert: {
          active_venues?: number
          bookings_this_month?: number
          id?: string
          last_updated?: string
          total_guests_today?: number
          total_revenue?: number
        }
        Update: {
          active_venues?: number
          bookings_this_month?: number
          id?: string
          last_updated?: string
          total_guests_today?: number
          total_revenue?: number
        }
        Relationships: []
      }
      inventory: {
        Row: {
          category: string
          created_at: string | null
          id: string
          min_quantity: number | null
          name: string
          notes: string | null
          quantity: number
          status: string | null
          unit: string | null
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          min_quantity?: number | null
          name: string
          notes?: string | null
          quantity: number
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          min_quantity?: number | null
          name?: string
          notes?: string | null
          quantity?: number
          status?: string | null
          unit?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          booking_id: string | null
          created_at: string | null
          due_date: string
          id: string
          invoice_number: string
          issue_date: string | null
          notes: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          amount: number
          booking_id?: string | null
          created_at?: string | null
          due_date: string
          id?: string
          invoice_number: string
          issue_date?: string | null
          notes?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
          updated_at?: string | null
        }
        Update: {
          amount?: number
          booking_id?: string | null
          created_at?: string | null
          due_date?: string
          id?: string
          invoice_number?: string
          issue_date?: string | null
          notes?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      menu_categories: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      menu_items: {
        Row: {
          category_id: string | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          ingredients: string[] | null
          is_special: boolean | null
          name: string
          price: number
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_special?: boolean | null
          name: string
          price: number
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          ingredients?: string[] | null
          is_special?: boolean | null
          name?: string
          price?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          notes: string | null
          payment_date: string | null
          payment_method: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          notes?: string | null
          payment_date?: string | null
          payment_method?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      staff: {
        Row: {
          contact: string | null
          created_at: string | null
          department: string
          id: string
          name: string
          position: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          contact?: string | null
          created_at?: string | null
          department: string
          id?: string
          name: string
          position: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          contact?: string | null
          created_at?: string | null
          department?: string
          id?: string
          name?: string
          position?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      staff_assignments: {
        Row: {
          booking_id: string | null
          created_at: string | null
          id: string
          staff_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          booking_id?: string | null
          created_at?: string | null
          id?: string
          staff_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "staff_assignments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "staff_assignments_staff_id_fkey"
            columns: ["staff_id"]
            isOneToOne: false
            referencedRelation: "staff"
            referencedColumns: ["id"]
          },
        ]
      }
      staff_stats: {
        Row: {
          available_today: number
          id: string
          last_updated: string
          on_duty: number
          total_staff: number
          upcoming_shifts: number
        }
        Insert: {
          available_today?: number
          id?: string
          last_updated?: string
          on_duty?: number
          total_staff?: number
          upcoming_shifts?: number
        }
        Update: {
          available_today?: number
          id?: string
          last_updated?: string
          on_duty?: number
          total_staff?: number
          upcoming_shifts?: number
        }
        Relationships: []
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          id: string
          settings: Json
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          id?: string
          settings: Json
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          id?: string
          settings?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          booking_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          booking_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      user_preferences: {
        Row: {
          sidebar_collapsed: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          sidebar_collapsed?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          sidebar_collapsed?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          accessible_pages: string[] | null
          created_at: string | null
          id: string
          name: string
          permissions: Json | null
          updated_at: string | null
        }
        Insert: {
          accessible_pages?: string[] | null
          created_at?: string | null
          id?: string
          name: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Update: {
          accessible_pages?: string[] | null
          created_at?: string | null
          id?: string
          name?: string
          permissions?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string
          id: number
          password: string | null
          role: string | null
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: number
          password?: string | null
          role?: string | null
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: number
          password?: string | null
          role?: string | null
          username?: string | null
        }
        Relationships: []
      }
      venue_unavailable_dates: {
        Row: {
          created_at: string | null
          date: string
          id: string
          reason: string | null
          venue_id: string | null
        }
        Insert: {
          created_at?: string | null
          date: string
          id?: string
          reason?: string | null
          venue_id?: string | null
        }
        Update: {
          created_at?: string | null
          date?: string
          id?: string
          reason?: string | null
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "venue_unavailable_dates_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          availability: string | null
          capacity: number
          created_at: string | null
          deposit_amount: number | null
          description: string | null
          features: string[] | null
          full_day_amount: number | null
          half_day_amount: number | null
          hourly_rate: number
          id: string
          image_url: string | null
          images: string[] | null
          location: string | null
          name: string
          square_footage: number
          total_amount: number | null
          updated_at: string | null
        }
        Insert: {
          availability?: string | null
          capacity: number
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          features?: string[] | null
          full_day_amount?: number | null
          half_day_amount?: number | null
          hourly_rate: number
          id?: string
          image_url?: string | null
          images?: string[] | null
          location?: string | null
          name: string
          square_footage: number
          total_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          availability?: string | null
          capacity?: number
          created_at?: string | null
          deposit_amount?: number | null
          description?: string | null
          features?: string[] | null
          full_day_amount?: number | null
          half_day_amount?: number | null
          hourly_rate?: number
          id?: string
          image_url?: string | null
          images?: string[] | null
          location?: string | null
          name?: string
          square_footage?: number
          total_amount?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wedding_bookings: {
        Row: {
          address: string | null
          booking_id: string | null
          bride_name: string | null
          client_name: string
          created_at: string | null
          groom_name: string | null
          id: string
          is_full_day: boolean | null
          phone: string | null
        }
        Insert: {
          address?: string | null
          booking_id?: string | null
          bride_name?: string | null
          client_name: string
          created_at?: string | null
          groom_name?: string | null
          id?: string
          is_full_day?: boolean | null
          phone?: string | null
        }
        Update: {
          address?: string | null
          booking_id?: string | null
          bride_name?: string | null
          client_name?: string
          created_at?: string | null
          groom_name?: string | null
          id?: string
          is_full_day?: boolean | null
          phone?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wedding_bookings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
