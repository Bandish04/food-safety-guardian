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
      audit_log: {
        Row: {
          event_type: string
          id: number
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          event_type: string
          id?: never
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          event_type?: string
          id?: never
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_records: {
        Row: {
          audit_date: string
          audit_type: string
          auditor_name: string
          auditor_organization: string | null
          conducted_by: string | null
          created_at: string
          findings: string | null
          follow_up_date: string | null
          follow_up_required: boolean
          id: string
          pass_status: boolean
          recommendations: string | null
          score: number | null
        }
        Insert: {
          audit_date?: string
          audit_type: string
          auditor_name: string
          auditor_organization?: string | null
          conducted_by?: string | null
          created_at?: string
          findings?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean
          id?: string
          pass_status: boolean
          recommendations?: string | null
          score?: number | null
        }
        Update: {
          audit_date?: string
          audit_type?: string
          auditor_name?: string
          auditor_organization?: string | null
          conducted_by?: string | null
          created_at?: string
          findings?: string | null
          follow_up_date?: string | null
          follow_up_required?: boolean
          id?: string
          pass_status?: boolean
          recommendations?: string | null
          score?: number | null
        }
        Relationships: []
      }
      ccp_compliance: {
        Row: {
          ccp_id: string
          check_date: string
          check_time: string
          corrective_action_taken: string | null
          created_at: string
          created_by: string | null
          deviation_notes: string | null
          id: string
          is_compliant: boolean
          measured_value: number
          verified_by: string | null
        }
        Insert: {
          ccp_id: string
          check_date?: string
          check_time?: string
          corrective_action_taken?: string | null
          created_at?: string
          created_by?: string | null
          deviation_notes?: string | null
          id?: string
          is_compliant: boolean
          measured_value: number
          verified_by?: string | null
        }
        Update: {
          ccp_id?: string
          check_date?: string
          check_time?: string
          corrective_action_taken?: string | null
          created_at?: string
          created_by?: string | null
          deviation_notes?: string | null
          id?: string
          is_compliant?: boolean
          measured_value?: number
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ccp_compliance_ccp_id_fkey"
            columns: ["ccp_id"]
            isOneToOne: false
            referencedRelation: "haccp_ccps"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_checks: {
        Row: {
          check_date: string
          check_time: string
          created_at: string
          created_by: string | null
          equipment_id: string | null
          hygiene_score: number | null
          id: string
          is_compliant: boolean
          location: string | null
          notes: string | null
          temperature: number | null
          weight: number | null
        }
        Insert: {
          check_date?: string
          check_time?: string
          created_at?: string
          created_by?: string | null
          equipment_id?: string | null
          hygiene_score?: number | null
          id?: string
          is_compliant?: boolean
          location?: string | null
          notes?: string | null
          temperature?: number | null
          weight?: number | null
        }
        Update: {
          check_date?: string
          check_time?: string
          created_at?: string
          created_by?: string | null
          equipment_id?: string | null
          hygiene_score?: number | null
          id?: string
          is_compliant?: boolean
          location?: string | null
          notes?: string | null
          temperature?: number | null
          weight?: number | null
        }
        Relationships: []
      }
      haccp_ccps: {
        Row: {
          corrective_action: string | null
          created_at: string
          critical_limit_max: number | null
          critical_limit_min: number | null
          description: string | null
          id: string
          is_active: boolean
          monitoring_frequency: string | null
          name: string
          unit: string
          updated_at: string
        }
        Insert: {
          corrective_action?: string | null
          created_at?: string
          critical_limit_max?: number | null
          critical_limit_min?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          monitoring_frequency?: string | null
          name: string
          unit?: string
          updated_at?: string
        }
        Update: {
          corrective_action?: string | null
          created_at?: string
          critical_limit_max?: number | null
          critical_limit_min?: number | null
          description?: string | null
          id?: string
          is_active?: boolean
          monitoring_frequency?: string | null
          name?: string
          unit?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          department: string | null
          employee_id: string | null
          full_name: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          full_name: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          department?: string | null
          employee_id?: string | null
          full_name?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      safety_violations: {
        Row: {
          assigned_to: string | null
          corrective_action: string | null
          created_at: string
          description: string
          id: string
          location: string | null
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: Database["public"]["Enums"]["violation_severity"]
          status: Database["public"]["Enums"]["violation_status"]
          updated_at: string
          violation_date: string
        }
        Insert: {
          assigned_to?: string | null
          corrective_action?: string | null
          created_at?: string
          description: string
          id?: string
          location?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["violation_severity"]
          status?: Database["public"]["Enums"]["violation_status"]
          updated_at?: string
          violation_date?: string
        }
        Update: {
          assigned_to?: string | null
          corrective_action?: string | null
          created_at?: string
          description?: string
          id?: string
          location?: string | null
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: Database["public"]["Enums"]["violation_severity"]
          status?: Database["public"]["Enums"]["violation_status"]
          updated_at?: string
          violation_date?: string
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
          role?: Database["public"]["Enums"]["app_role"]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_staff: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "qa_staff"
      violation_severity: "low" | "medium" | "high" | "critical"
      violation_status: "open" | "investigating" | "resolved" | "closed"
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
      app_role: ["admin", "qa_staff"],
      violation_severity: ["low", "medium", "high", "critical"],
      violation_status: ["open", "investigating", "resolved", "closed"],
    },
  },
} as const
