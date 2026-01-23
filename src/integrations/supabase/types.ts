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
      admission_notifications: {
        Row: {
          admission_process_id: string
          created_at: string
          id: string
          link_token: string | null
          metadata: Json | null
          notification_type: string
          read_at: string | null
          sent_at: string | null
          status: string
          target_department: string
          target_email: string | null
          target_step: string
          updated_at: string
        }
        Insert: {
          admission_process_id: string
          created_at?: string
          id?: string
          link_token?: string | null
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          target_department: string
          target_email?: string | null
          target_step: string
          updated_at?: string
        }
        Update: {
          admission_process_id?: string
          created_at?: string
          id?: string
          link_token?: string | null
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string
          target_department?: string
          target_email?: string | null
          target_step?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "admission_notifications_admission_process_id_fkey"
            columns: ["admission_process_id"]
            isOneToOne: false
            referencedRelation: "admission_processes"
            referencedColumns: ["id"]
          },
        ]
      }
      admission_processes: {
        Row: {
          accesses_released: string[] | null
          admission_date: string
          branch: string
          buddy_mentor: string | null
          contract_type: string
          cpf: string
          created_at: string
          created_by: string | null
          current_step: string
          department: string
          display_name: string | null
          documents_completed_at: string | null
          documents_pending: string[] | null
          documents_received: string[] | null
          email_created: string | null
          email_distribution_lists: string[] | null
          email_required: boolean | null
          employee_name: string
          equipment_delivered: string[] | null
          general_tests_done: string | null
          hr_completed_at: string | null
          hr_completed_by: string | null
          hr_observations: string | null
          id: string
          it_completion_date: string | null
          it_observations: string | null
          it_responsible: string | null
          manager_completed_at: string | null
          manager_completed_by: string | null
          manager_email: string | null
          manager_name: string
          manager_observations: string | null
          microsoft_licenses: string[] | null
          needs_headset: boolean | null
          needs_keyboard: boolean | null
          needs_laptop: boolean | null
          needs_monitor: boolean | null
          needs_mouse: boolean | null
          needs_printer: boolean | null
          network_folders_released: string | null
          position: string
          printers_configured: string | null
          salesforce_profile_created: string | null
          sap_user_created: string | null
          shared_folders: string[] | null
          software_list: string[] | null
          start_date: string
          status: string
          systems_list: string[] | null
          target_department: string
          ti_completed_at: string | null
          ti_completed_by: string | null
          updated_at: string
          user_ad_created: boolean | null
          vpn_configured: string | null
          work_regime: string
        }
        Insert: {
          accesses_released?: string[] | null
          admission_date: string
          branch: string
          buddy_mentor?: string | null
          contract_type: string
          cpf: string
          created_at?: string
          created_by?: string | null
          current_step?: string
          department: string
          display_name?: string | null
          documents_completed_at?: string | null
          documents_pending?: string[] | null
          documents_received?: string[] | null
          email_created?: string | null
          email_distribution_lists?: string[] | null
          email_required?: boolean | null
          employee_name: string
          equipment_delivered?: string[] | null
          general_tests_done?: string | null
          hr_completed_at?: string | null
          hr_completed_by?: string | null
          hr_observations?: string | null
          id?: string
          it_completion_date?: string | null
          it_observations?: string | null
          it_responsible?: string | null
          manager_completed_at?: string | null
          manager_completed_by?: string | null
          manager_email?: string | null
          manager_name: string
          manager_observations?: string | null
          microsoft_licenses?: string[] | null
          needs_headset?: boolean | null
          needs_keyboard?: boolean | null
          needs_laptop?: boolean | null
          needs_monitor?: boolean | null
          needs_mouse?: boolean | null
          needs_printer?: boolean | null
          network_folders_released?: string | null
          position: string
          printers_configured?: string | null
          salesforce_profile_created?: string | null
          sap_user_created?: string | null
          shared_folders?: string[] | null
          software_list?: string[] | null
          start_date: string
          status?: string
          systems_list?: string[] | null
          target_department: string
          ti_completed_at?: string | null
          ti_completed_by?: string | null
          updated_at?: string
          user_ad_created?: boolean | null
          vpn_configured?: string | null
          work_regime: string
        }
        Update: {
          accesses_released?: string[] | null
          admission_date?: string
          branch?: string
          buddy_mentor?: string | null
          contract_type?: string
          cpf?: string
          created_at?: string
          created_by?: string | null
          current_step?: string
          department?: string
          display_name?: string | null
          documents_completed_at?: string | null
          documents_pending?: string[] | null
          documents_received?: string[] | null
          email_created?: string | null
          email_distribution_lists?: string[] | null
          email_required?: boolean | null
          employee_name?: string
          equipment_delivered?: string[] | null
          general_tests_done?: string | null
          hr_completed_at?: string | null
          hr_completed_by?: string | null
          hr_observations?: string | null
          id?: string
          it_completion_date?: string | null
          it_observations?: string | null
          it_responsible?: string | null
          manager_completed_at?: string | null
          manager_completed_by?: string | null
          manager_email?: string | null
          manager_name?: string
          manager_observations?: string | null
          microsoft_licenses?: string[] | null
          needs_headset?: boolean | null
          needs_keyboard?: boolean | null
          needs_laptop?: boolean | null
          needs_monitor?: boolean | null
          needs_mouse?: boolean | null
          needs_printer?: boolean | null
          network_folders_released?: string | null
          position?: string
          printers_configured?: string | null
          salesforce_profile_created?: string | null
          sap_user_created?: string | null
          shared_folders?: string[] | null
          software_list?: string[] | null
          start_date?: string
          status?: string
          systems_list?: string[] | null
          target_department?: string
          ti_completed_at?: string | null
          ti_completed_by?: string | null
          updated_at?: string
          user_ad_created?: boolean | null
          vpn_configured?: string | null
          work_regime?: string
        }
        Relationships: []
      }
      attendance: {
        Row: {
          break_minutes: number | null
          clock_in: string | null
          clock_out: string | null
          created_at: string | null
          date: string
          employee_id: string
          id: string
          notes: string | null
          overtime_minutes: number | null
          status: string | null
        }
        Insert: {
          break_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date: string
          employee_id: string
          id?: string
          notes?: string | null
          overtime_minutes?: number | null
          status?: string | null
        }
        Update: {
          break_minutes?: number | null
          clock_in?: string | null
          clock_out?: string | null
          created_at?: string | null
          date?: string
          employee_id?: string
          id?: string
          notes?: string | null
          overtime_minutes?: number | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attendance_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: unknown
          module: Database["public"]["Enums"]["app_module"]
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: unknown
          module: Database["public"]["Enums"]["app_module"]
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: unknown
          module?: Database["public"]["Enums"]["app_module"]
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      carriers: {
        Row: {
          api_config: Json | null
          cnpj: string | null
          code: string
          contact_email: string | null
          contact_phone: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          sla_days_max: number | null
          sla_days_min: number | null
          tracking_url_template: string | null
        }
        Insert: {
          api_config?: Json | null
          cnpj?: string | null
          code: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          sla_days_max?: number | null
          sla_days_min?: number | null
          tracking_url_template?: string | null
        }
        Update: {
          api_config?: Json | null
          cnpj?: string | null
          code?: string
          contact_email?: string | null
          contact_phone?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          sla_days_max?: number | null
          sla_days_min?: number | null
          tracking_url_template?: string | null
        }
        Relationships: []
      }
      chat_conversations: {
        Row: {
          created_at: string
          id: string
          lead_id: string | null
          session_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          lead_id?: string | null
          session_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          lead_id?: string | null
          session_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_conversations_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "leads"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "chat_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          created_at: string | null
          description: string | null
          due_date: string | null
          evidence_url: string | null
          id: string
          last_audit_date: string | null
          next_audit_date: string | null
          notes: string | null
          requirement: string | null
          responsible_id: string | null
          risk_level: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          requirement?: string | null
          responsible_id?: string | null
          risk_level?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          last_audit_date?: string | null
          next_audit_date?: string | null
          notes?: string | null
          requirement?: string | null
          responsible_id?: string | null
          risk_level?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      cost_centers: {
        Row: {
          budget_annual: number | null
          code: string
          created_at: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          budget_annual?: number | null
          code: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          budget_annual?: number | null
          code?: string
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "cost_centers_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          current_uses: number
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_order_value: number | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          current_uses?: number
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_value?: number | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          current_uses?: number
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_order_value?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      crm_accounts: {
        Row: {
          address: Json | null
          annual_revenue: number | null
          cnpj: string | null
          cpf: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          employee_count: number | null
          id: string
          industry: string | null
          is_active: boolean | null
          lgpd_consent_at: string | null
          name: string
          owner_id: string | null
          phone: string | null
          salesforce_id: string | null
          sap_card_code: string | null
          tags: string[] | null
          type: string | null
          updated_at: string | null
          website: string | null
        }
        Insert: {
          address?: Json | null
          annual_revenue?: number | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          lgpd_consent_at?: string | null
          name: string
          owner_id?: string | null
          phone?: string | null
          salesforce_id?: string | null
          sap_card_code?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          address?: Json | null
          annual_revenue?: number | null
          cnpj?: string | null
          cpf?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          lgpd_consent_at?: string | null
          name?: string
          owner_id?: string | null
          phone?: string | null
          salesforce_id?: string | null
          sap_card_code?: string | null
          tags?: string[] | null
          type?: string | null
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      crm_activities: {
        Row: {
          account_id: string | null
          completed_at: string | null
          contact_id: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          opportunity_id: string | null
          outcome: string | null
          owner_id: string | null
          subject: string
          type: string
        }
        Insert: {
          account_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          owner_id?: string | null
          subject: string
          type: string
        }
        Update: {
          account_id?: string | null
          completed_at?: string | null
          contact_id?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          opportunity_id?: string | null
          outcome?: string | null
          owner_id?: string | null
          subject?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_activities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_activities_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "crm_opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_contacts: {
        Row: {
          account_id: string | null
          address: Json | null
          created_at: string | null
          department: string | null
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          is_primary: boolean | null
          last_name: string | null
          lgpd_consent_at: string | null
          mobile: string | null
          opt_in_marketing: boolean | null
          phone: string | null
          position: string | null
          preferences: Json | null
          social_profiles: Json | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          address?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_name?: string | null
          lgpd_consent_at?: string | null
          mobile?: string | null
          opt_in_marketing?: boolean | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          social_profiles?: Json | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          address?: Json | null
          created_at?: string | null
          department?: string | null
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          is_primary?: boolean | null
          last_name?: string | null
          lgpd_consent_at?: string | null
          mobile?: string | null
          opt_in_marketing?: boolean | null
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          social_profiles?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_contacts_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_leads: {
        Row: {
          company: string | null
          converted_account_id: string | null
          converted_at: string | null
          converted_contact_id: string | null
          created_at: string | null
          custom_fields: Json | null
          email: string | null
          first_name: string
          id: string
          last_name: string | null
          lgpd_consent_at: string | null
          notes: string | null
          opt_in_marketing: boolean | null
          owner_id: string | null
          phone: string | null
          position: string | null
          score: number | null
          source: string | null
          source_detail: string | null
          status: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at: string | null
          utm_params: Json | null
        }
        Insert: {
          company?: string | null
          converted_account_id?: string | null
          converted_at?: string | null
          converted_contact_id?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_name: string
          id?: string
          last_name?: string | null
          lgpd_consent_at?: string | null
          notes?: string | null
          opt_in_marketing?: boolean | null
          owner_id?: string | null
          phone?: string | null
          position?: string | null
          score?: number | null
          source?: string | null
          source_detail?: string | null
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
          utm_params?: Json | null
        }
        Update: {
          company?: string | null
          converted_account_id?: string | null
          converted_at?: string | null
          converted_contact_id?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          email?: string | null
          first_name?: string
          id?: string
          last_name?: string | null
          lgpd_consent_at?: string | null
          notes?: string | null
          opt_in_marketing?: boolean | null
          owner_id?: string | null
          phone?: string | null
          position?: string | null
          score?: number | null
          source?: string | null
          source_detail?: string | null
          status?: Database["public"]["Enums"]["crm_lead_status"] | null
          updated_at?: string | null
          utm_params?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_converted_account_id_fkey"
            columns: ["converted_account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_converted_contact_id_fkey"
            columns: ["converted_contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_opportunities: {
        Row: {
          account_id: string | null
          actual_close_date: string | null
          amount: number | null
          contact_id: string | null
          created_at: string | null
          custom_fields: Json | null
          expected_close_date: string | null
          id: string
          lead_id: string | null
          lost_reason: string | null
          name: string
          next_step: string | null
          notes: string | null
          order_id: string | null
          owner_id: string | null
          pipeline_id: string | null
          probability: number | null
          source: string | null
          stage: Database["public"]["Enums"]["opportunity_stage"] | null
          updated_at: string | null
        }
        Insert: {
          account_id?: string | null
          actual_close_date?: string | null
          amount?: number | null
          contact_id?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          lost_reason?: string | null
          name: string
          next_step?: string | null
          notes?: string | null
          order_id?: string | null
          owner_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"] | null
          updated_at?: string | null
        }
        Update: {
          account_id?: string | null
          actual_close_date?: string | null
          amount?: number | null
          contact_id?: string | null
          created_at?: string | null
          custom_fields?: Json | null
          expected_close_date?: string | null
          id?: string
          lead_id?: string | null
          lost_reason?: string | null
          name?: string
          next_step?: string | null
          notes?: string | null
          order_id?: string | null
          owner_id?: string | null
          pipeline_id?: string | null
          probability?: number | null
          source?: string | null
          stage?: Database["public"]["Enums"]["opportunity_stage"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_opportunities_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "crm_contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_opportunities_pipeline_id_fkey"
            columns: ["pipeline_id"]
            isOneToOne: false
            referencedRelation: "crm_pipelines"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_pipelines: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          stages: Json
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          stages: Json
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          stages?: Json
        }
        Relationships: []
      }
      departments: {
        Row: {
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          manager_id: string | null
          module: Database["public"]["Enums"]["app_module"]
          name: string
          parent_id: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          module: Database["public"]["Enums"]["app_module"]
          name: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          manager_id?: string | null
          module?: Database["public"]["Enums"]["app_module"]
          name?: string
          parent_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "departments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      employees: {
        Row: {
          address: Json | null
          birth_date: string | null
          cpf: string
          created_at: string | null
          department_id: string | null
          documents: Json | null
          email: string
          emergency_contact: Json | null
          employee_code: string
          full_name: string
          hire_date: string
          id: string
          lgpd_consent_at: string | null
          manager_id: string | null
          phone: string | null
          position_id: string | null
          salary: number | null
          status: Database["public"]["Enums"]["employee_status"] | null
          termination_date: string | null
          updated_at: string | null
          user_id: string | null
          work_schedule: Json | null
        }
        Insert: {
          address?: Json | null
          birth_date?: string | null
          cpf: string
          created_at?: string | null
          department_id?: string | null
          documents?: Json | null
          email: string
          emergency_contact?: Json | null
          employee_code: string
          full_name: string
          hire_date: string
          id?: string
          lgpd_consent_at?: string | null
          manager_id?: string | null
          phone?: string | null
          position_id?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_schedule?: Json | null
        }
        Update: {
          address?: Json | null
          birth_date?: string | null
          cpf?: string
          created_at?: string | null
          department_id?: string | null
          documents?: Json | null
          email?: string
          emergency_contact?: Json | null
          employee_code?: string
          full_name?: string
          hire_date?: string
          id?: string
          lgpd_consent_at?: string | null
          manager_id?: string | null
          phone?: string | null
          position_id?: string | null
          salary?: number | null
          status?: Database["public"]["Enums"]["employee_status"] | null
          termination_date?: string | null
          updated_at?: string | null
          user_id?: string | null
          work_schedule?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_position_id_fkey"
            columns: ["position_id"]
            isOneToOne: false
            referencedRelation: "positions"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_invoices: {
        Row: {
          created_at: string | null
          currency: string | null
          customer_id: string | null
          discount_amount: number | null
          due_date: string
          id: string
          invoice_number: string
          nfe_key: string | null
          nfe_number: string | null
          nfe_xml: string | null
          notes: string | null
          order_id: string | null
          paid_date: string | null
          status: Database["public"]["Enums"]["fin_payment_status"] | null
          subtotal: number
          tax_amount: number | null
          total: number
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          due_date: string
          id?: string
          invoice_number: string
          nfe_key?: string | null
          nfe_number?: string | null
          nfe_xml?: string | null
          notes?: string | null
          order_id?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["fin_payment_status"] | null
          subtotal: number
          tax_amount?: number | null
          total: number
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          due_date?: string
          id?: string
          invoice_number?: string
          nfe_key?: string | null
          nfe_number?: string | null
          nfe_xml?: string | null
          notes?: string | null
          order_id?: string | null
          paid_date?: string | null
          status?: Database["public"]["Enums"]["fin_payment_status"] | null
          subtotal?: number
          tax_amount?: number | null
          total?: number
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      fin_payments: {
        Row: {
          account_id: string | null
          amount: number
          created_at: string | null
          id: string
          invoice_id: string | null
          payment_date: string
          payment_method: string
          reconciled: boolean | null
          reconciled_at: string | null
          reference: string | null
        }
        Insert: {
          account_id?: string | null
          amount: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          payment_date: string
          payment_method: string
          reconciled?: boolean | null
          reconciled_at?: string | null
          reference?: string | null
        }
        Update: {
          account_id?: string | null
          amount?: number
          created_at?: string | null
          id?: string
          invoice_id?: string | null
          payment_date?: string
          payment_method?: string
          reconciled?: boolean | null
          reconciled_at?: string | null
          reference?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fin_payments_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "financial_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fin_payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "fin_invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      financial_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          balance: number | null
          bank_name: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          type: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          balance?: number | null
          bank_name?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      hr_checklist_items: {
        Row: {
          checklist_id: string
          created_at: string | null
          description: string | null
          id: string
          is_required: boolean | null
          order_index: number | null
          responsible_role: string | null
          title: string
        }
        Insert: {
          checklist_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          responsible_role?: string | null
          title: string
        }
        Update: {
          checklist_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          order_index?: number | null
          responsible_role?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "hr_checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "hr_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_checklists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      hr_employee_checklist_items: {
        Row: {
          checklist_item_id: string
          completed_at: string | null
          completed_by: string | null
          created_at: string | null
          employee_checklist_id: string
          id: string
          is_completed: boolean | null
          notes: string | null
        }
        Insert: {
          checklist_item_id: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          employee_checklist_id: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
        }
        Update: {
          checklist_item_id?: string
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string | null
          employee_checklist_id?: string
          id?: string
          is_completed?: boolean | null
          notes?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_checklist_items_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "hr_checklist_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employee_checklist_items_employee_checklist_id_fkey"
            columns: ["employee_checklist_id"]
            isOneToOne: false
            referencedRelation: "hr_employee_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      hr_employee_checklists: {
        Row: {
          checklist_id: string
          completed_at: string | null
          created_at: string | null
          employee_id: string
          id: string
          notes: string | null
          started_at: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          checklist_id: string
          completed_at?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          checklist_id?: string
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          notes?: string | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hr_employee_checklists_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "hr_checklists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hr_employee_checklists_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      inventory: {
        Row: {
          id: string
          last_count_date: string | null
          last_count_qty: number | null
          location: string | null
          max_stock: number | null
          min_stock: number | null
          product_id: string
          quantity_available: number | null
          quantity_incoming: number | null
          quantity_reserved: number | null
          reorder_point: number | null
          sku: string
          updated_at: string | null
          warehouse_id: string
        }
        Insert: {
          id?: string
          last_count_date?: string | null
          last_count_qty?: number | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number | null
          product_id: string
          quantity_available?: number | null
          quantity_incoming?: number | null
          quantity_reserved?: number | null
          reorder_point?: number | null
          sku: string
          updated_at?: string | null
          warehouse_id: string
        }
        Update: {
          id?: string
          last_count_date?: string | null
          last_count_qty?: number | null
          location?: string | null
          max_stock?: number | null
          min_stock?: number | null
          product_id?: string
          quantity_available?: number | null
          quantity_incoming?: number | null
          quantity_reserved?: number | null
          reorder_point?: number | null
          sku?: string
          updated_at?: string | null
          warehouse_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "inventory_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      kb_articles: {
        Row: {
          author_id: string | null
          category_id: string | null
          content: string
          created_at: string | null
          helpful_count: number | null
          id: string
          is_public: boolean | null
          published_at: string | null
          related_articles: string[] | null
          slug: string
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          author_id?: string | null
          category_id?: string | null
          content: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          published_at?: string | null
          related_articles?: string[] | null
          slug: string
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          author_id?: string | null
          category_id?: string | null
          content?: string
          created_at?: string | null
          helpful_count?: number | null
          id?: string
          is_public?: boolean | null
          published_at?: string | null
          related_articles?: string[] | null
          slug?: string
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "kb_articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string
          id: string
          lgpd_consent_at: string | null
          name: string
          opt_in_marketing: boolean
          phone: string | null
          source: string | null
          topic: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          lgpd_consent_at?: string | null
          name: string
          opt_in_marketing?: boolean
          phone?: string | null
          source?: string | null
          topic?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          lgpd_consent_at?: string | null
          name?: string
          opt_in_marketing?: boolean
          phone?: string | null
          source?: string | null
          topic?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leave_requests: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string | null
          days_count: number
          employee_id: string
          end_date: string
          id: string
          reason: string | null
          start_date: string
          status: string | null
          type: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count: number
          employee_id: string
          end_date: string
          id?: string
          reason?: string | null
          start_date: string
          status?: string | null
          type: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string | null
          days_count?: number
          employee_id?: string
          end_date?: string
          id?: string
          reason?: string | null
          start_date?: string
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "leave_requests_approved_by_fkey"
            columns: ["approved_by"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leave_requests_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      legal_cases: {
        Row: {
          amount_claimed: number | null
          amount_provisioned: number | null
          case_number: string
          closed_at: string | null
          court: string | null
          created_at: string | null
          description: string | null
          documents: Json | null
          external_lawyer: Json | null
          id: string
          judge: string | null
          next_deadline: string | null
          notes: string | null
          outcome: string | null
          parties: Json | null
          priority: string | null
          responsible_id: string | null
          status: string | null
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          amount_claimed?: number | null
          amount_provisioned?: number | null
          case_number: string
          closed_at?: string | null
          court?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          external_lawyer?: Json | null
          id?: string
          judge?: string | null
          next_deadline?: string | null
          notes?: string | null
          outcome?: string | null
          parties?: Json | null
          priority?: string | null
          responsible_id?: string | null
          status?: string | null
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          amount_claimed?: number | null
          amount_provisioned?: number | null
          case_number?: string
          closed_at?: string | null
          court?: string | null
          created_at?: string | null
          description?: string | null
          documents?: Json | null
          external_lawyer?: Json | null
          id?: string
          judge?: string | null
          next_deadline?: string | null
          notes?: string | null
          outcome?: string | null
          parties?: Json | null
          priority?: string | null
          responsible_id?: string | null
          status?: string | null
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      legal_contracts: {
        Row: {
          auto_renew: boolean | null
          contract_number: string
          created_at: string | null
          currency: string | null
          document_url: string | null
          end_date: string | null
          id: string
          party_account_id: string | null
          party_document: string | null
          party_name: string | null
          payment_terms: string | null
          reminder_email: string | null
          reminder_enabled: boolean | null
          renewal_notice_days: number | null
          responsible_id: string | null
          signed_at: string | null
          signed_document_url: string | null
          signers: Json | null
          special_clauses: string | null
          start_date: string | null
          status: Database["public"]["Enums"]["contract_status"] | null
          terms_summary: string | null
          title: string
          type: string
          updated_at: string | null
          value: number | null
        }
        Insert: {
          auto_renew?: boolean | null
          contract_number: string
          created_at?: string | null
          currency?: string | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          party_account_id?: string | null
          party_document?: string | null
          party_name?: string | null
          payment_terms?: string | null
          reminder_email?: string | null
          reminder_enabled?: boolean | null
          renewal_notice_days?: number | null
          responsible_id?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          signers?: Json | null
          special_clauses?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          terms_summary?: string | null
          title: string
          type: string
          updated_at?: string | null
          value?: number | null
        }
        Update: {
          auto_renew?: boolean | null
          contract_number?: string
          created_at?: string | null
          currency?: string | null
          document_url?: string | null
          end_date?: string | null
          id?: string
          party_account_id?: string | null
          party_document?: string | null
          party_name?: string | null
          payment_terms?: string | null
          reminder_email?: string | null
          reminder_enabled?: boolean | null
          renewal_notice_days?: number | null
          responsible_id?: string | null
          signed_at?: string | null
          signed_document_url?: string | null
          signers?: Json | null
          special_clauses?: string | null
          start_date?: string | null
          status?: Database["public"]["Enums"]["contract_status"] | null
          terms_summary?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "legal_contracts_party_account_id_fkey"
            columns: ["party_account_id"]
            isOneToOne: false
            referencedRelation: "crm_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_points: {
        Row: {
          balance: number
          created_at: string
          id: string
          total_earned: number
          total_redeemed: number
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number
          created_at?: string
          id?: string
          total_earned?: number
          total_redeemed?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      marketing_assets: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          campaign_id: string | null
          channel: string | null
          created_at: string | null
          dimensions: Json | null
          file_size: number | null
          file_url: string | null
          id: string
          name: string
          status: string | null
          type: string
          version: number | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: string | null
          channel?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          name: string
          status?: string | null
          type: string
          version?: number | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          campaign_id?: string | null
          channel?: string | null
          created_at?: string | null
          dimensions?: Json | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          name?: string
          status?: string | null
          type?: string
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_assets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      marketing_campaigns: {
        Row: {
          budget: number | null
          channels: string[] | null
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          objective: string | null
          owner_id: string | null
          spent: number | null
          start_date: string | null
          status: string | null
          target_audience: Json | null
          type: string
          updated_at: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          budget?: number | null
          channels?: string[] | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          objective?: string | null
          owner_id?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          type: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          budget?: number | null
          channels?: string[] | null
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          objective?: string | null
          owner_id?: string | null
          spent?: number | null
          start_date?: string | null
          status?: string | null
          target_audience?: Json | null
          type?: string
          updated_at?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: []
      }
      marketing_promotions: {
        Row: {
          applicable_categories: string[] | null
          applicable_products: string[] | null
          campaign_id: string | null
          conditions: Json | null
          created_at: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string
          id: string
          max_discount: number | null
          min_order_value: number | null
          name: string
          stackable: boolean | null
          start_date: string
          status: string | null
          type: string
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          campaign_id?: string | null
          conditions?: Json | null
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date: string
          id?: string
          max_discount?: number | null
          min_order_value?: number | null
          name: string
          stackable?: boolean | null
          start_date: string
          status?: string | null
          type: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          applicable_categories?: string[] | null
          applicable_products?: string[] | null
          campaign_id?: string | null
          conditions?: Json | null
          created_at?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string
          id?: string
          max_discount?: number | null
          min_order_value?: number | null
          name?: string
          stackable?: boolean | null
          start_date?: string
          status?: string | null
          type?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "marketing_promotions_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "marketing_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          carrier: string | null
          created_at: string
          discount: number | null
          id: string
          items: Json
          payment_intent_id: string | null
          payment_status: string | null
          shipping: number | null
          shipping_address: Json | null
          status: string
          subtotal: number
          total: number
          tracking_code: string | null
          tracking_url: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          carrier?: string | null
          created_at?: string
          discount?: number | null
          id?: string
          items?: Json
          payment_intent_id?: string | null
          payment_status?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal: number
          total: number
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          carrier?: string | null
          created_at?: string
          discount?: number | null
          id?: string
          items?: Json
          payment_intent_id?: string | null
          payment_status?: string | null
          shipping?: number | null
          shipping_address?: Json | null
          status?: string
          subtotal?: number
          total?: number
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      permissions: {
        Row: {
          can_create: boolean | null
          can_delete: boolean | null
          can_read: boolean | null
          can_update: boolean | null
          id: string
          module: Database["public"]["Enums"]["app_module"]
          role: Database["public"]["Enums"]["app_role"]
          scope: string | null
        }
        Insert: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          id?: string
          module: Database["public"]["Enums"]["app_module"]
          role: Database["public"]["Enums"]["app_role"]
          scope?: string | null
        }
        Update: {
          can_create?: boolean | null
          can_delete?: boolean | null
          can_read?: boolean | null
          can_update?: boolean | null
          id?: string
          module?: Database["public"]["Enums"]["app_module"]
          role?: Database["public"]["Enums"]["app_role"]
          scope?: string | null
        }
        Relationships: []
      }
      pick_pack_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          items: Json
          notes: string | null
          shipment_id: string
          started_at: string | null
          status: string | null
          type: string
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          items: Json
          notes?: string | null
          shipment_id: string
          started_at?: string | null
          status?: string | null
          type: string
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          items?: Json
          notes?: string | null
          shipment_id?: string
          started_at?: string | null
          status?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "pick_pack_tasks_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      points_transactions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          order_id: string | null
          points: number
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points: number
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          order_id?: string | null
          points?: number
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      positions: {
        Row: {
          created_at: string | null
          department_id: string | null
          id: string
          is_active: boolean | null
          level: number | null
          salary_range_max: number | null
          salary_range_min: number | null
          title: string
        }
        Insert: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          title: string
        }
        Update: {
          created_at?: string | null
          department_id?: string | null
          id?: string
          is_active?: boolean | null
          level?: number | null
          salary_range_max?: number | null
          salary_range_min?: number | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "positions_department_id_fkey"
            columns: ["department_id"]
            isOneToOne: false
            referencedRelation: "departments"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          parent_id: string | null
          slug: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          badge: string | null
          category_id: string | null
          created_at: string
          description: string | null
          id: string
          image_url: string | null
          images: string[] | null
          in_stock: boolean | null
          is_active: boolean | null
          long_description: string | null
          name: string
          original_price: number | null
          price: number
          rating: number | null
          review_count: number | null
          sku: string | null
          slug: string
          stock: number | null
          tags: string[] | null
          updated_at: string
        }
        Insert: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          long_description?: string | null
          name: string
          original_price?: number | null
          price: number
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          slug: string
          stock?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Update: {
          badge?: string | null
          category_id?: string | null
          created_at?: string
          description?: string | null
          id?: string
          image_url?: string | null
          images?: string[] | null
          in_stock?: boolean | null
          is_active?: boolean | null
          long_description?: string | null
          name?: string
          original_price?: number | null
          price?: number
          rating?: number | null
          review_count?: number | null
          sku?: string | null
          slug?: string
          stock?: number | null
          tags?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "product_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          referred_by: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referred_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_points: number
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status: string
        }
        Insert: {
          bonus_points?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          status?: string
        }
        Update: {
          bonus_points?: number
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          status?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          product_id: string
          rating: number
          updated_at: string
          user_id: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id: string
          rating: number
          updated_at?: string
          user_id: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          product_id?: string
          rating?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shipments: {
        Row: {
          carrier_id: string | null
          created_at: string | null
          delivered_at: string | null
          delivery_proof: Json | null
          dimensions: Json | null
          estimated_delivery: string | null
          id: string
          notes: string | null
          order_id: string
          packages_count: number | null
          sap_delivery_doc: string | null
          shipped_at: string | null
          shipping_cost: number | null
          shipping_method: string | null
          status: Database["public"]["Enums"]["shipment_status"] | null
          tracking_code: string | null
          tracking_url: string | null
          updated_at: string | null
          warehouse_id: string | null
          weight_kg: number | null
        }
        Insert: {
          carrier_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_proof?: Json | null
          dimensions?: Json | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id: string
          packages_count?: number | null
          sap_delivery_doc?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          weight_kg?: number | null
        }
        Update: {
          carrier_id?: string | null
          created_at?: string | null
          delivered_at?: string | null
          delivery_proof?: Json | null
          dimensions?: Json | null
          estimated_delivery?: string | null
          id?: string
          notes?: string | null
          order_id?: string
          packages_count?: number | null
          sap_delivery_doc?: string | null
          shipped_at?: string | null
          shipping_cost?: number | null
          shipping_method?: string | null
          status?: Database["public"]["Enums"]["shipment_status"] | null
          tracking_code?: string | null
          tracking_url?: string | null
          updated_at?: string | null
          warehouse_id?: string | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shipments_carrier_id_fkey"
            columns: ["carrier_id"]
            isOneToOne: false
            referencedRelation: "carriers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shipments_warehouse_id_fkey"
            columns: ["warehouse_id"]
            isOneToOne: false
            referencedRelation: "warehouses"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_categories: {
        Row: {
          auto_assign_to: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          name: string
          parent_id: string | null
          sla_resolution_hours: number | null
          sla_response_hours: number | null
        }
        Insert: {
          auto_assign_to?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          parent_id?: string | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
        }
        Update: {
          auto_assign_to?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          parent_id?: string | null
          sla_resolution_hours?: number | null
          sla_response_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ticket_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_comments: {
        Row: {
          attachments: Json | null
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_internal: boolean | null
          ticket_id: string
        }
        Insert: {
          attachments?: Json | null
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id: string
        }
        Update: {
          attachments?: Json | null
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_internal?: boolean | null
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_comments_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      tickets: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category_id: string | null
          closed_at: string | null
          created_at: string | null
          description: string
          escalated_to: string | null
          first_response_at: string | null
          id: string
          priority: Database["public"]["Enums"]["ticket_priority"] | null
          related_asset: string | null
          requester_id: string
          resolved_at: string | null
          satisfaction_comment: string | null
          satisfaction_rating: number | null
          sla_resolution_due: string | null
          sla_response_due: string | null
          status: Database["public"]["Enums"]["ticket_status"] | null
          tags: string[] | null
          ticket_number: string
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description: string
          escalated_to?: string | null
          first_response_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          related_asset?: string | null
          requester_id: string
          resolved_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          tags?: string[] | null
          ticket_number: string
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category_id?: string | null
          closed_at?: string | null
          created_at?: string | null
          description?: string
          escalated_to?: string | null
          first_response_at?: string | null
          id?: string
          priority?: Database["public"]["Enums"]["ticket_priority"] | null
          related_asset?: string | null
          requester_id?: string
          resolved_at?: string | null
          satisfaction_comment?: string | null
          satisfaction_rating?: number | null
          sla_resolution_due?: string | null
          sla_response_due?: string | null
          status?: Database["public"]["Enums"]["ticket_status"] | null
          tags?: string[] | null
          ticket_number?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "ticket_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_events: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          location: string | null
          occurred_at: string
          raw_data: Json | null
          shipment_id: string
          status: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          occurred_at: string
          raw_data?: Json | null
          shipment_id: string
          status: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          location?: string | null
          occurred_at?: string
          raw_data?: Json | null
          shipment_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "tracking_events_shipment_id_fkey"
            columns: ["shipment_id"]
            isOneToOne: false
            referencedRelation: "shipments"
            referencedColumns: ["id"]
          },
        ]
      }
      training_participants: {
        Row: {
          certificate_url: string | null
          completed_at: string | null
          created_at: string | null
          employee_id: string
          id: string
          score: number | null
          status: string | null
          training_id: string
        }
        Insert: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id: string
          id?: string
          score?: number | null
          status?: string | null
          training_id: string
        }
        Update: {
          certificate_url?: string | null
          completed_at?: string | null
          created_at?: string | null
          employee_id?: string
          id?: string
          score?: number | null
          status?: string | null
          training_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "training_participants_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_participants_training_id_fkey"
            columns: ["training_id"]
            isOneToOne: false
            referencedRelation: "trainings"
            referencedColumns: ["id"]
          },
        ]
      }
      trainings: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          instructor: string | null
          is_mandatory: boolean | null
          location: string | null
          max_participants: number | null
          start_date: string | null
          title: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          instructor?: string | null
          is_mandatory?: boolean | null
          location?: string | null
          max_participants?: number | null
          start_date?: string | null
          title: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          instructor?: string | null
          is_mandatory?: boolean | null
          location?: string | null
          max_participants?: number | null
          start_date?: string | null
          title?: string
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
      warehouses: {
        Row: {
          address: Json
          capacity_info: Json | null
          code: string
          created_at: string | null
          id: string
          is_active: boolean | null
          is_default: boolean | null
          name: string
          sap_warehouse_code: string | null
        }
        Insert: {
          address: Json
          capacity_info?: Json | null
          code: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name: string
          sap_warehouse_code?: string | null
        }
        Update: {
          address?: Json
          capacity_info?: Json | null
          code?: string
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          is_default?: boolean | null
          name?: string
          sap_warehouse_code?: string | null
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
      app_module:
      | "admin"
      | "rh"
      | "financeiro"
      | "marketing"
      | "comercial"
      | "logistica"
      | "juridico"
      | "tech"
      | "ecommerce"
      app_role:
      | "admin"
      | "user"
      | "rh_manager"
      | "finance_manager"
      | "marketing_manager"
      | "sales_manager"
      | "logistics_manager"
      | "legal_manager"
      | "tech_support"
      | "ecommerce_manager"
      | "auditor"
      contract_status:
      | "draft"
      | "review"
      | "pending_signature"
      | "active"
      | "expired"
      | "terminated"
      | "renewed"
      crm_lead_status:
      | "new"
      | "contacted"
      | "qualified"
      | "unqualified"
      | "converted"
      | "lost"
      employee_status:
      | "onboarding"
      | "active"
      | "on_leave"
      | "suspended"
      | "offboarding"
      | "terminated"
      fin_payment_status:
      | "pending"
      | "partial"
      | "paid"
      | "overdue"
      | "cancelled"
      | "refunded"
      opportunity_stage:
      | "prospecting"
      | "qualification"
      | "proposal"
      | "negotiation"
      | "closed_won"
      | "closed_lost"
      shipment_status:
      | "pending"
      | "picking"
      | "packing"
      | "ready"
      | "shipped"
      | "in_transit"
      | "out_for_delivery"
      | "delivered"
      | "returned"
      | "cancelled"
      ticket_priority: "critical" | "high" | "medium" | "low"
      ticket_status:
      | "open"
      | "assigned"
      | "in_progress"
      | "pending_user"
      | "pending_vendor"
      | "resolved"
      | "closed"
      | "cancelled"
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
      app_module: [
        "admin",
        "rh",
        "financeiro",
        "marketing",
        "comercial",
        "logistica",
        "juridico",
        "tech",
        "ecommerce",
      ],
      app_role: [
        "admin",
        "user",
        "rh_manager",
        "finance_manager",
        "marketing_manager",
        "sales_manager",
        "logistics_manager",
        "legal_manager",
        "tech_support",
        "ecommerce_manager",
        "auditor",
      ],
      contract_status: [
        "draft",
        "review",
        "pending_signature",
        "active",
        "expired",
        "terminated",
        "renewed",
      ],
      crm_lead_status: [
        "new",
        "contacted",
        "qualified",
        "unqualified",
        "converted",
        "lost",
      ],
      employee_status: [
        "onboarding",
        "active",
        "on_leave",
        "suspended",
        "offboarding",
        "terminated",
      ],
      fin_payment_status: [
        "pending",
        "partial",
        "paid",
        "overdue",
        "cancelled",
        "refunded",
      ],
      opportunity_stage: [
        "prospecting",
        "qualification",
        "proposal",
        "negotiation",
        "closed_won",
        "closed_lost",
      ],
      shipment_status: [
        "pending",
        "picking",
        "packing",
        "ready",
        "shipped",
        "in_transit",
        "out_for_delivery",
        "delivered",
        "returned",
        "cancelled",
      ],
      ticket_priority: ["critical", "high", "medium", "low"],
      ticket_status: [
        "open",
        "assigned",
        "in_progress",
        "pending_user",
        "pending_vendor",
        "resolved",
        "closed",
        "cancelled",
      ],
    },
  },
} as const
