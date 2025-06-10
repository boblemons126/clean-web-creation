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
      calendar_providers: {
        Row: {
          api_endpoint: string | null
          auth_type: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          api_endpoint?: string | null
          auth_type: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          api_endpoint?: string | null
          auth_type?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      calendars: {
        Row: {
          account_id: string | null
          color: string | null
          created_at: string
          description: string | null
          external_calendar_id: string | null
          id: string
          is_local: boolean
          is_primary: boolean
          name: string
          timezone: string | null
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          account_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          external_calendar_id?: string | null
          id?: string
          is_local?: boolean
          is_primary?: boolean
          name: string
          timezone?: string | null
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          account_id?: string | null
          color?: string | null
          created_at?: string
          description?: string | null
          external_calendar_id?: string | null
          id?: string
          is_local?: boolean
          is_primary?: boolean
          name?: string
          timezone?: string | null
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "calendars_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_calendar_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          all_day: boolean
          attendees: Json | null
          calendar_id: string
          created_at: string
          creator_email: string | null
          description: string | null
          end_time: string
          external_event_id: string | null
          id: string
          is_local: boolean
          last_synced_at: string | null
          location: string | null
          organizer_email: string | null
          recurrence_rule: string | null
          reminders: Json | null
          start_time: string
          status: string | null
          title: string
          updated_at: string
          user_id: string
          visibility: string | null
        }
        Insert: {
          all_day?: boolean
          attendees?: Json | null
          calendar_id: string
          created_at?: string
          creator_email?: string | null
          description?: string | null
          end_time: string
          external_event_id?: string | null
          id?: string
          is_local?: boolean
          last_synced_at?: string | null
          location?: string | null
          organizer_email?: string | null
          recurrence_rule?: string | null
          reminders?: Json | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string
          user_id: string
          visibility?: string | null
        }
        Update: {
          all_day?: boolean
          attendees?: Json | null
          calendar_id?: string
          created_at?: string
          creator_email?: string | null
          description?: string | null
          end_time?: string
          external_event_id?: string | null
          id?: string
          is_local?: boolean
          last_synced_at?: string | null
          location?: string | null
          organizer_email?: string | null
          recurrence_rule?: string | null
          reminders?: Json | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string
          user_id?: string
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_calendar_id_fkey"
            columns: ["calendar_id"]
            isOneToOne: false
            referencedRelation: "calendars"
            referencedColumns: ["id"]
          },
        ]
      }
      sync_logs: {
        Row: {
          account_id: string
          completed_at: string | null
          error_details: Json | null
          errors_count: number | null
          events_synced: number | null
          id: string
          started_at: string
          status: string
          sync_type: string
          user_id: string
        }
        Insert: {
          account_id: string
          completed_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          events_synced?: number | null
          id?: string
          started_at?: string
          status: string
          sync_type: string
          user_id: string
        }
        Update: {
          account_id?: string
          completed_at?: string | null
          error_details?: Json | null
          errors_count?: number | null
          events_synced?: number | null
          id?: string
          started_at?: string
          status?: string
          sync_type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sync_logs_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "user_calendar_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      user_calendar_accounts: {
        Row: {
          access_token: string | null
          account_name: string
          created_at: string
          id: string
          is_active: boolean
          last_sync_at: string | null
          provider_id: string
          refresh_token: string | null
          sync_enabled: boolean
          token_expires_at: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_name: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider_id: string
          refresh_token?: string | null
          sync_enabled?: boolean
          token_expires_at?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_name?: string
          created_at?: string
          id?: string
          is_active?: boolean
          last_sync_at?: string | null
          provider_id?: string
          refresh_token?: string | null
          sync_enabled?: boolean
          token_expires_at?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_calendar_accounts_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "calendar_providers"
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
