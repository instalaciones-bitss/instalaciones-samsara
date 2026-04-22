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
      clients: {
        Row: {
          contact_name: string | null
          contact_phone: string | null
          created_at: string | null
          drive_folder_link: string | null
          id: string
          name: string
          samsara_user: string | null
        }
        Insert: {
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          drive_folder_link?: string | null
          id?: string
          name: string
          samsara_user?: string | null
        }
        Update: {
          contact_name?: string | null
          contact_phone?: string | null
          created_at?: string | null
          drive_folder_link?: string | null
          id?: string
          name?: string
          samsara_user?: string | null
        }
        Relationships: []
      }
      device_models: {
        Row: {
          id: string
          name: string
        }
        Insert: {
          id?: string
          name: string
        }
        Update: {
          id?: string
          name?: string
        }
        Relationships: []
      }
      devices: {
        Row: {
          created_at: string | null
          device_model_id: string | null
          id: string
          serial_number: string
          vehicle_id: string | null
        }
        Insert: {
          created_at?: string | null
          device_model_id?: string | null
          id?: string
          serial_number: string
          vehicle_id?: string | null
        }
        Update: {
          created_at?: string | null
          device_model_id?: string | null
          id?: string
          serial_number?: string
          vehicle_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devices_device_model_id_fkey"
            columns: ["device_model_id"]
            isOneToOne: false
            referencedRelation: "device_models"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devices_vehicle_id_fkey"
            columns: ["vehicle_id"]
            isOneToOne: false
            referencedRelation: "vehicles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      projects: {
        Row: {
          client_id: string | null
          created_at: string | null
          drive_project_link: string | null
          id: string
          is_billed: boolean | null
          is_docs_signed: boolean | null
          kickoff_date: string | null
          name: string
          pm_id: string | null
          po_number: string | null
          status: string | null
          total_units_expected: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          drive_project_link?: string | null
          id?: string
          is_billed?: boolean | null
          is_docs_signed?: boolean | null
          kickoff_date?: string | null
          name: string
          pm_id?: string | null
          po_number?: string | null
          status?: string | null
          total_units_expected?: number | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          drive_project_link?: string | null
          id?: string
          is_billed?: boolean | null
          is_docs_signed?: boolean | null
          kickoff_date?: string | null
          name?: string
          pm_id?: string | null
          po_number?: string | null
          status?: string | null
          total_units_expected?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      technicians: {
        Row: {
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      vehicles: {
        Row: {
          city: string | null
          created_at: string | null
          economic_number: string | null
          id: string
          installation_date: string | null
          notes: string | null
          project_id: string | null
          status: string | null
          technician_id: string | null
          vin: string
        }
        Insert: {
          city?: string | null
          created_at?: string | null
          economic_number?: string | null
          id?: string
          installation_date?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
          technician_id?: string | null
          vin: string
        }
        Update: {
          city?: string | null
          created_at?: string | null
          economic_number?: string | null
          id?: string
          installation_date?: string | null
          notes?: string | null
          project_id?: string | null
          status?: string | null
          technician_id?: string | null
          vin?: string
        }
        Relationships: [
          {
            foreignKeyName: "vehicles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "projects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vehicles_technician_id_fkey"
            columns: ["technician_id"]
            isOneToOne: false
            referencedRelation: "technicians"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      project_details: {
        Row: {
          client_id: string | null
          created_at: string | null
          drive_project_link: string | null
          id: string | null
          is_billed: boolean | null
          is_docs_signed: boolean | null
          kickoff_date: string | null
          name: string | null
          pm_id: string | null
          po_number: string | null
          progress_percentage: number | null
          status: string | null
          total_units_expected: number | null
          units_installed: number | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          drive_project_link?: string | null
          id?: string | null
          is_billed?: boolean | null
          is_docs_signed?: boolean | null
          kickoff_date?: string | null
          name?: string | null
          pm_id?: string | null
          po_number?: string | null
          progress_percentage?: never
          status?: string | null
          total_units_expected?: number | null
          units_installed?: never
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          drive_project_link?: string | null
          id?: string | null
          is_billed?: boolean | null
          is_docs_signed?: boolean | null
          kickoff_date?: string | null
          name?: string | null
          pm_id?: string | null
          po_number?: string | null
          progress_percentage?: never
          status?: string | null
          total_units_expected?: number | null
          units_installed?: never
        }
        Relationships: [
          {
            foreignKeyName: "projects_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "projects_pm_id_fkey"
            columns: ["pm_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
