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
      agreements: {
        Row: {
          agreement_type: string
          content: Json
          created_at: string | null
          document_id: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          parties: Json
          signed_at: string | null
          status: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          agreement_type: string
          content: Json
          created_at?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          parties: Json
          signed_at?: string | null
          status?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          agreement_type?: string
          content?: Json
          created_at?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          parties?: Json
          signed_at?: string | null
          status?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          entity: string
          entity_id: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity?: string
          entity_id?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          bucket_name: string | null
          created_at: string | null
          file_name: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          file_url: string
          id: string
          investment_id: string | null
          is_public: boolean | null
          metadata: Json | null
          mime_type: string | null
          opportunity_id: string | null
          pool_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          bucket_name?: string | null
          created_at?: string | null
          file_name: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url: string
          id?: string
          investment_id?: string | null
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          opportunity_id?: string | null
          pool_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          bucket_name?: string | null
          created_at?: string | null
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          id?: string
          investment_id?: string | null
          is_public?: boolean | null
          metadata?: Json | null
          mime_type?: string | null
          opportunity_id?: string | null
          pool_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts: {
        Row: {
          account_number: string
          admin_notes: string | null
          auto_release_date: string | null
          available_balance: number
          created_at: string | null
          currency: string
          entrepreneur_id: string | null
          held_amount: number
          id: string
          investor_id: string | null
          metadata: Json | null
          opportunity_id: string | null
          release_conditions: string[] | null
          status: Database["public"]["Enums"]["escrow_status"]
          total_amount: number
          type: Database["public"]["Enums"]["escrow_type"]
          updated_at: string | null
        }
        Insert: {
          account_number: string
          admin_notes?: string | null
          auto_release_date?: string | null
          available_balance?: number
          created_at?: string | null
          currency?: string
          entrepreneur_id?: string | null
          held_amount?: number
          id?: string
          investor_id?: string | null
          metadata?: Json | null
          opportunity_id?: string | null
          release_conditions?: string[] | null
          status?: Database["public"]["Enums"]["escrow_status"]
          total_amount: number
          type: Database["public"]["Enums"]["escrow_type"]
          updated_at?: string | null
        }
        Update: {
          account_number?: string
          admin_notes?: string | null
          auto_release_date?: string | null
          available_balance?: number
          created_at?: string | null
          currency?: string
          entrepreneur_id?: string | null
          held_amount?: number
          id?: string
          investor_id?: string | null
          metadata?: Json | null
          opportunity_id?: string | null
          release_conditions?: string[] | null
          status?: Database["public"]["Enums"]["escrow_status"]
          total_amount?: number
          type?: Database["public"]["Enums"]["escrow_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "escrow_accounts_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_transactions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          description: string | null
          escrow_account_id: string | null
          fee_amount: number | null
          id: string
          metadata: Json | null
          processed_at: string | null
          reference: string
          status: string
          transaction_date: string | null
          type: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          description?: string | null
          escrow_account_id?: string | null
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          reference: string
          status?: string
          transaction_date?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          description?: string | null
          escrow_account_id?: string | null
          fee_amount?: number | null
          id?: string
          metadata?: Json | null
          processed_at?: string | null
          reference?: string
          status?: string
          transaction_date?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "escrow_transactions_escrow_account_id_fkey"
            columns: ["escrow_account_id"]
            isOneToOne: false
            referencedRelation: "escrow_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_pools: {
        Row: {
          auto_approve_investments: boolean
          created_at: string | null
          created_by: string | null
          currency: string
          current_members: number
          description: string | null
          id: string
          investment_strategy: string | null
          management_fee_percentage: number
          manager_id: string | null
          max_members: number
          maximum_investment: number
          metadata: Json | null
          minimum_investment: number
          name: string
          performance_fee_percentage: number
          require_majority_vote: boolean
          risk_profile: string
          status: Database["public"]["Enums"]["pool_status"]
          target_amount: number
          term_length_months: number
          total_committed: number
          total_distributed: number
          total_invested: number
          type: Database["public"]["Enums"]["pool_type"]
          updated_at: string | null
        }
        Insert: {
          auto_approve_investments?: boolean
          created_at?: string | null
          created_by?: string | null
          currency?: string
          current_members?: number
          description?: string | null
          id?: string
          investment_strategy?: string | null
          management_fee_percentage?: number
          manager_id?: string | null
          max_members: number
          maximum_investment: number
          metadata?: Json | null
          minimum_investment: number
          name: string
          performance_fee_percentage?: number
          require_majority_vote?: boolean
          risk_profile?: string
          status?: Database["public"]["Enums"]["pool_status"]
          target_amount: number
          term_length_months: number
          total_committed?: number
          total_distributed?: number
          total_invested?: number
          type: Database["public"]["Enums"]["pool_type"]
          updated_at?: string | null
        }
        Update: {
          auto_approve_investments?: boolean
          created_at?: string | null
          created_by?: string | null
          currency?: string
          current_members?: number
          description?: string | null
          id?: string
          investment_strategy?: string | null
          management_fee_percentage?: number
          manager_id?: string | null
          max_members?: number
          maximum_investment?: number
          metadata?: Json | null
          minimum_investment?: number
          name?: string
          performance_fee_percentage?: number
          require_majority_vote?: boolean
          risk_profile?: string
          status?: Database["public"]["Enums"]["pool_status"]
          target_amount?: number
          term_length_months?: number
          total_committed?: number
          total_distributed?: number
          total_invested?: number
          type?: Database["public"]["Enums"]["pool_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_pools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_pools_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          approved_at: string | null
          completed_at: string | null
          created_at: string | null
          equity_percentage: number | null
          escrow_account_id: string | null
          id: string
          investor_id: string
          metadata: Json | null
          notes: string | null
          opportunity_id: string
          payment_method: string | null
          payment_reference: string | null
          pool_id: string | null
          status: Database["public"]["Enums"]["investment_status"]
          terms_accepted: boolean | null
          terms_accepted_at: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          equity_percentage?: number | null
          escrow_account_id?: string | null
          id?: string
          investor_id: string
          metadata?: Json | null
          notes?: string | null
          opportunity_id: string
          payment_method?: string | null
          payment_reference?: string | null
          pool_id?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          approved_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          equity_percentage?: number | null
          escrow_account_id?: string | null
          id?: string
          investor_id?: string
          metadata?: Json | null
          notes?: string | null
          opportunity_id?: string
          payment_method?: string | null
          payment_reference?: string | null
          pool_id?: string | null
          status?: Database["public"]["Enums"]["investment_status"]
          terms_accepted?: boolean | null
          terms_accepted_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      kyc_verifications: {
        Row: {
          created_at: string | null
          documents: Json | null
          id: string
          notes: string | null
          status: string
          updated_at: string | null
          user_id: string | null
          verification_data: Json | null
          verification_type: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          verification_data?: Json | null
          verification_type: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          documents?: Json | null
          id?: string
          notes?: string | null
          status?: string
          updated_at?: string | null
          user_id?: string | null
          verification_data?: Json | null
          verification_type?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "kyc_verifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "kyc_verifications_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      milestones: {
        Row: {
          completed_at: string | null
          completed_by: string | null
          completion_criteria: string | null
          created_at: string | null
          description: string | null
          due_date: string
          id: string
          metadata: Json | null
          opportunity_id: string | null
          status: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          completed_by?: string | null
          completion_criteria?: string | null
          created_at?: string | null
          description?: string | null
          due_date: string
          id?: string
          metadata?: Json | null
          opportunity_id?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          completed_by?: string | null
          completion_criteria?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string
          id?: string
          metadata?: Json | null
          opportunity_id?: string | null
          status?: Database["public"]["Enums"]["milestone_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_completed_by_fkey"
            columns: ["completed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "milestones_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_required: boolean
          action_text: string | null
          action_url: string | null
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"]
          read_at: string | null
          status: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string | null
        }
        Insert: {
          action_required?: boolean
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Update: {
          action_required?: boolean
          action_text?: string | null
          action_url?: string | null
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"]
          read_at?: string | null
          status?: Database["public"]["Enums"]["notification_status"]
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      observer_access_logs: {
        Row: {
          accessed_at: string | null
          action: string
          id: string
          ip_address: string | null
          metadata: Json | null
          observer_id: string | null
          resource: string
          user_agent: string | null
        }
        Insert: {
          accessed_at?: string | null
          action: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          observer_id?: string | null
          resource: string
          user_agent?: string | null
        }
        Update: {
          accessed_at?: string | null
          action?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          observer_id?: string | null
          resource?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "observer_access_logs_observer_id_fkey"
            columns: ["observer_id"]
            isOneToOne: false
            referencedRelation: "observers"
            referencedColumns: ["id"]
          },
        ]
      }
      observer_invitations: {
        Row: {
          email: string
          entity_id: string | null
          entity_type: string | null
          expires_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          name: string
          permissions: Json | null
          relationship: string | null
          status: string
          token: string
        }
        Insert: {
          email: string
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          name: string
          permissions?: Json | null
          relationship?: string | null
          status?: string
          token: string
        }
        Update: {
          email?: string
          entity_id?: string | null
          entity_type?: string | null
          expires_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          name?: string
          permissions?: Json | null
          relationship?: string | null
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "observer_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      observers: {
        Row: {
          access_expiry: string | null
          created_at: string | null
          email: string
          entity_id: string | null
          entity_type: string | null
          granted_by: string | null
          granted_by_role: Database["public"]["Enums"]["user_role"] | null
          id: string
          last_accessed: string | null
          metadata: Json | null
          name: string
          permissions: Json | null
          relationship: string | null
          status: string
        }
        Insert: {
          access_expiry?: string | null
          created_at?: string | null
          email: string
          entity_id?: string | null
          entity_type?: string | null
          granted_by?: string | null
          granted_by_role?: Database["public"]["Enums"]["user_role"] | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          name: string
          permissions?: Json | null
          relationship?: string | null
          status?: string
        }
        Update: {
          access_expiry?: string | null
          created_at?: string | null
          email?: string
          entity_id?: string | null
          entity_type?: string | null
          granted_by?: string | null
          granted_by_role?: Database["public"]["Enums"]["user_role"] | null
          id?: string
          last_accessed?: string | null
          metadata?: Json | null
          name?: string
          permissions?: Json | null
          relationship?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "observers_granted_by_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          business_stage: Database["public"]["Enums"]["business_stage"]
          closed_at: string | null
          created_at: string | null
          description: string
          entrepreneur_id: string
          equity_offered: number
          expected_return: number | null
          founded_year: number | null
          funding_type: Database["public"]["Enums"]["funding_type"]
          id: string
          industry: string
          interested_investors: number | null
          linkedin: string | null
          location: string
          max_investment: number | null
          metadata: Json | null
          min_investment: number
          pitch_deck_url: string | null
          published_at: string | null
          risk_score: number | null
          status: Database["public"]["Enums"]["opportunity_status"]
          tags: string[] | null
          target_amount: number
          team_size: number | null
          timeline: number | null
          title: string
          total_raised: number | null
          updated_at: string | null
          use_of_funds: string | null
          views: number | null
          website: string | null
        }
        Insert: {
          business_stage?: Database["public"]["Enums"]["business_stage"]
          closed_at?: string | null
          created_at?: string | null
          description: string
          entrepreneur_id: string
          equity_offered: number
          expected_return?: number | null
          founded_year?: number | null
          funding_type?: Database["public"]["Enums"]["funding_type"]
          id?: string
          industry: string
          interested_investors?: number | null
          linkedin?: string | null
          location: string
          max_investment?: number | null
          metadata?: Json | null
          min_investment: number
          pitch_deck_url?: string | null
          published_at?: string | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          tags?: string[] | null
          target_amount: number
          team_size?: number | null
          timeline?: number | null
          title: string
          total_raised?: number | null
          updated_at?: string | null
          use_of_funds?: string | null
          views?: number | null
          website?: string | null
        }
        Update: {
          business_stage?: Database["public"]["Enums"]["business_stage"]
          closed_at?: string | null
          created_at?: string | null
          description?: string
          entrepreneur_id?: string
          equity_offered?: number
          expected_return?: number | null
          founded_year?: number | null
          funding_type?: Database["public"]["Enums"]["funding_type"]
          id?: string
          industry?: string
          interested_investors?: number | null
          linkedin?: string | null
          location?: string
          max_investment?: number | null
          metadata?: Json | null
          min_investment?: number
          pitch_deck_url?: string | null
          published_at?: string | null
          risk_score?: number | null
          status?: Database["public"]["Enums"]["opportunity_status"]
          tags?: string[] | null
          target_amount?: number
          team_size?: number | null
          timeline?: number | null
          title?: string
          total_raised?: number | null
          updated_at?: string | null
          use_of_funds?: string | null
          views?: number | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          gateway_response: Json | null
          id: string
          investment_id: string | null
          metadata: Json | null
          payment_method: string | null
          processed_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          gateway_response?: Json | null
          id?: string
          investment_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          gateway_response?: Json | null
          id?: string
          investment_id?: string | null
          metadata?: Json | null
          payment_method?: string | null
          processed_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      platform_settings: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_value: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_value: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_value?: Json
          updated_at?: string | null
        }
        Relationships: []
      }
      pool_distributions: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          distribution_date: string | null
          distribution_type: string
          id: string
          investment_id: string | null
          per_member_breakdown: Json
          pool_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          distribution_date?: string | null
          distribution_type: string
          id?: string
          investment_id?: string | null
          per_member_breakdown?: Json
          pool_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          distribution_date?: string | null
          distribution_type?: string
          id?: string
          investment_id?: string | null
          per_member_breakdown?: Json
          pool_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_distributions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "pool_investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_distributions_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_investments: {
        Row: {
          amount: number
          created_at: string | null
          currency: string
          exit_date: string | null
          id: string
          investment_date: string | null
          metadata: Json | null
          notes: string | null
          opportunity_id: string | null
          pool_id: string | null
          proposed_at: string | null
          proposed_by: string | null
          return_percentage: number | null
          status: string
          voting_deadline: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          currency?: string
          exit_date?: string | null
          id?: string
          investment_date?: string | null
          metadata?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          pool_id?: string | null
          proposed_at?: string | null
          proposed_by?: string | null
          return_percentage?: number | null
          status?: string
          voting_deadline?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          currency?: string
          exit_date?: string | null
          id?: string
          investment_date?: string | null
          metadata?: Json | null
          notes?: string | null
          opportunity_id?: string | null
          pool_id?: string | null
          proposed_at?: string | null
          proposed_by?: string | null
          return_percentage?: number | null
          status?: string
          voting_deadline?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_investments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_investments_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_investments_proposed_by_fkey"
            columns: ["proposed_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_members: {
        Row: {
          committed_amount: number
          created_at: string | null
          distributed_amount: number
          id: string
          invested_amount: number
          investment_preferences: string[] | null
          joined_at: string | null
          kyc_verified: boolean
          metadata: Json | null
          pool_id: string | null
          role: Database["public"]["Enums"]["pool_member_role"]
          status: string
          user_id: string | null
          voting_power: number
        }
        Insert: {
          committed_amount?: number
          created_at?: string | null
          distributed_amount?: number
          id?: string
          invested_amount?: number
          investment_preferences?: string[] | null
          joined_at?: string | null
          kyc_verified?: boolean
          metadata?: Json | null
          pool_id?: string | null
          role?: Database["public"]["Enums"]["pool_member_role"]
          status?: string
          user_id?: string | null
          voting_power?: number
        }
        Update: {
          committed_amount?: number
          created_at?: string | null
          distributed_amount?: number
          id?: string
          invested_amount?: number
          investment_preferences?: string[] | null
          joined_at?: string | null
          kyc_verified?: boolean
          metadata?: Json | null
          pool_id?: string | null
          role?: Database["public"]["Enums"]["pool_member_role"]
          status?: string
          user_id?: string | null
          voting_power?: number
        }
        Relationships: [
          {
            foreignKeyName: "pool_members_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_votes: {
        Row: {
          comments: string | null
          created_at: string | null
          id: string
          investment_id: string | null
          member_id: string | null
          vote_type: string
          voted_at: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          id?: string
          investment_id?: string | null
          member_id?: string | null
          vote_type: string
          voted_at?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          id?: string
          investment_id?: string | null
          member_id?: string | null
          vote_type?: string
          voted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_votes_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "pool_investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_votes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "pool_members"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string
          id: string
          is_active: boolean | null
          kyc_status: string | null
          phone: string | null
          role_id: number | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name: string
          id: string
          is_active?: boolean | null
          kyc_status?: string | null
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean | null
          kyc_status?: string | null
          phone?: string | null
          role_id?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      service_providers: {
        Row: {
          banking_details: Json | null
          biography: string | null
          contact_info: Json | null
          created_at: string | null
          credentials_file: string | null
          expertise: string | null
          id: string
          is_active: boolean | null
          profile_picture: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          banking_details?: Json | null
          biography?: string | null
          contact_info?: Json | null
          created_at?: string | null
          credentials_file?: string | null
          expertise?: string | null
          id?: string
          is_active?: boolean | null
          profile_picture?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          banking_details?: Json | null
          biography?: string | null
          contact_info?: Json | null
          created_at?: string | null
          credentials_file?: string | null
          expertise?: string | null
          id?: string
          is_active?: boolean | null
          profile_picture?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      users: {
        Row: {
          avatar: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          email: string
          id: string
          is_active: boolean | null
          kyc_status: Database["public"]["Enums"]["kyc_status"] | null
          last_login: string | null
          linkedin: string | null
          location: string | null
          metadata: Json | null
          name: string
          phone: string | null
          position: string | null
          preferences: Json | null
          role: Database["public"]["Enums"]["user_role"]
          twitter: string | null
          updated_at: string | null
          verification_level: number | null
          website: string | null
        }
        Insert: {
          avatar?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email: string
          id?: string
          is_active?: boolean | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          last_login?: string | null
          linkedin?: string | null
          location?: string | null
          metadata?: Json | null
          name: string
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          twitter?: string | null
          updated_at?: string | null
          verification_level?: number | null
          website?: string | null
        }
        Update: {
          avatar?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          email?: string
          id?: string
          is_active?: boolean | null
          kyc_status?: Database["public"]["Enums"]["kyc_status"] | null
          last_login?: string | null
          linkedin?: string | null
          location?: string | null
          metadata?: Json | null
          name?: string
          phone?: string | null
          position?: string | null
          preferences?: Json | null
          role?: Database["public"]["Enums"]["user_role"]
          twitter?: string | null
          updated_at?: string | null
          verification_level?: number | null
          website?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      expire_old_invitations: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      business_stage:
        | "idea"
        | "startup"
        | "growth"
        | "established"
        | "expansion"
      escrow_status:
        | "pending"
        | "active"
        | "funded"
        | "released"
        | "disputed"
        | "cancelled"
      escrow_type: "investment" | "payment" | "milestone" | "security"
      funding_type: "equity" | "debt" | "convertible_note" | "revenue_sharing"
      investment_status:
        | "pending"
        | "approved"
        | "rejected"
        | "completed"
        | "cancelled"
      kyc_status: "not_submitted" | "pending" | "verified" | "rejected"
      milestone_status:
        | "pending"
        | "in_progress"
        | "completed"
        | "overdue"
        | "cancelled"
      notification_priority: "low" | "medium" | "high" | "urgent"
      notification_status: "unread" | "read" | "archived"
      notification_type:
        | "info"
        | "success"
        | "warning"
        | "error"
        | "milestone"
        | "payment"
        | "agreement"
        | "kyc"
        | "system"
      opportunity_status:
        | "draft"
        | "pending"
        | "published"
        | "funded"
        | "closed"
        | "cancelled"
      payment_status:
        | "pending"
        | "processing"
        | "completed"
        | "failed"
        | "cancelled"
      pool_member_role: "manager" | "investor" | "advisor" | "observer"
      pool_status:
        | "forming"
        | "active"
        | "investing"
        | "distributing"
        | "closed"
        | "cancelled"
      pool_type: "syndicate" | "fund" | "collective" | "angel_group"
      user_role:
        | "admin"
        | "entrepreneur"
        | "investor"
        | "pool"
        | "service_provider"
        | "observer"
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
      business_stage: ["idea", "startup", "growth", "established", "expansion"],
      escrow_status: [
        "pending",
        "active",
        "funded",
        "released",
        "disputed",
        "cancelled",
      ],
      escrow_type: ["investment", "payment", "milestone", "security"],
      funding_type: ["equity", "debt", "convertible_note", "revenue_sharing"],
      investment_status: [
        "pending",
        "approved",
        "rejected",
        "completed",
        "cancelled",
      ],
      kyc_status: ["not_submitted", "pending", "verified", "rejected"],
      milestone_status: [
        "pending",
        "in_progress",
        "completed",
        "overdue",
        "cancelled",
      ],
      notification_priority: ["low", "medium", "high", "urgent"],
      notification_status: ["unread", "read", "archived"],
      notification_type: [
        "info",
        "success",
        "warning",
        "error",
        "milestone",
        "payment",
        "agreement",
        "kyc",
        "system",
      ],
      opportunity_status: [
        "draft",
        "pending",
        "published",
        "funded",
        "closed",
        "cancelled",
      ],
      payment_status: [
        "pending",
        "processing",
        "completed",
        "failed",
        "cancelled",
      ],
      pool_member_role: ["manager", "investor", "advisor", "observer"],
      pool_status: [
        "forming",
        "active",
        "investing",
        "distributing",
        "closed",
        "cancelled",
      ],
      pool_type: ["syndicate", "fund", "collective", "angel_group"],
      user_role: [
        "admin",
        "entrepreneur",
        "investor",
        "pool",
        "service_provider",
        "observer",
      ],
    },
  },
} as const
