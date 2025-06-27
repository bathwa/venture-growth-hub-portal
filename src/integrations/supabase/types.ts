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
          created_at: string | null
          executed_at: string | null
          id: string
          investment_id: string | null
          opportunity_id: string | null
          parties: Json
          signatures: Json | null
          status: Database["public"]["Enums"]["agreement_status"] | null
          terms: Json
          updated_at: string | null
        }
        Insert: {
          agreement_type: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          investment_id?: string | null
          opportunity_id?: string | null
          parties: Json
          signatures?: Json | null
          status?: Database["public"]["Enums"]["agreement_status"] | null
          terms: Json
          updated_at?: string | null
        }
        Update: {
          agreement_type?: string
          created_at?: string | null
          executed_at?: string | null
          id?: string
          investment_id?: string | null
          opportunity_id?: string | null
          parties?: Json
          signatures?: Json | null
          status?: Database["public"]["Enums"]["agreement_status"] | null
          terms?: Json
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agreements_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agreements_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          expires_at: string | null
          id: string
          is_published: boolean | null
          priority: string | null
          publish_at: string | null
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          publish_at?: string | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          expires_at?: string | null
          id?: string
          is_published?: boolean | null
          priority?: string | null
          publish_at?: string | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log_enhanced: {
        Row: {
          action_type: string
          created_at: string | null
          details: Json | null
          id: string
          ip_address: unknown | null
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          ip_address?: unknown | null
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_log_enhanced_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      banking_details: {
        Row: {
          account_name: string
          account_number: string
          bank_name: string
          created_at: string | null
          id: string
          routing_number: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          account_name: string
          account_number: string
          bank_name: string
          created_at?: string | null
          id?: string
          routing_number?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          account_name?: string
          account_number?: string
          bank_name?: string
          created_at?: string | null
          id?: string
          routing_number?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "banking_details_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          file_path: string
          file_size: number | null
          id: string
          mime_type: string | null
          name: string
          opportunity_id: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          file_path: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name: string
          opportunity_id?: string | null
          type: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          file_path?: string
          file_size?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          opportunity_id?: string | null
          type?: Database["public"]["Enums"]["document_type"]
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      election_nominations: {
        Row: {
          campaign_statement: string | null
          election_id: string
          id: string
          nominated_at: string | null
          nominator_id: string
          nominee_id: string
          status: string | null
          votes_received: number | null
        }
        Insert: {
          campaign_statement?: string | null
          election_id: string
          id?: string
          nominated_at?: string | null
          nominator_id: string
          nominee_id: string
          status?: string | null
          votes_received?: number | null
        }
        Update: {
          campaign_statement?: string | null
          election_id?: string
          id?: string
          nominated_at?: string | null
          nominator_id?: string
          nominee_id?: string
          status?: string | null
          votes_received?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "election_nominations_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "pool_elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_nominations_nominator_id_fkey"
            columns: ["nominator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_nominations_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      election_votes: {
        Row: {
          election_id: string
          id: string
          nominee_id: string
          voted_at: string | null
          voter_hash: string
        }
        Insert: {
          election_id: string
          id?: string
          nominee_id: string
          voted_at?: string | null
          voter_hash: string
        }
        Update: {
          election_id?: string
          id?: string
          nominee_id?: string
          voted_at?: string | null
          voter_hash?: string
        }
        Relationships: [
          {
            foreignKeyName: "election_votes_election_id_fkey"
            columns: ["election_id"]
            isOneToOne: false
            referencedRelation: "pool_elections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "election_votes_nominee_id_fkey"
            columns: ["nominee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts: {
        Row: {
          account_name: string
          account_number: string
          account_type: string | null
          bank_name: string
          created_at: string | null
          created_by: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          routing_number: string | null
          swift_code: string | null
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type?: string | null
          bank_name: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string | null
          bank_name?: string
          created_at?: string | null
          created_by?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          routing_number?: string | null
          swift_code?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      escrow_accounts_enhanced: {
        Row: {
          account_name: string
          account_number: string
          account_type: string
          additional_details: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          provider: string
          updated_at: string | null
        }
        Insert: {
          account_name: string
          account_number: string
          account_type: string
          additional_details?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          provider: string
          updated_at?: string | null
        }
        Update: {
          account_name?: string
          account_number?: string
          account_type?: string
          additional_details?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          provider?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "escrow_accounts_enhanced_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_agreements: {
        Row: {
          agreement_type: string | null
          agreement_url: string | null
          created_at: string | null
          entrepreneur_signed: boolean | null
          entrepreneur_signed_at: string | null
          id: string
          investment_id: string
          investor_signed: boolean | null
          investor_signed_at: string | null
          nda_url: string | null
          status: string | null
          terms: Json
          updated_at: string | null
          witness_id: string | null
          witness_signed: boolean | null
          witness_signed_at: string | null
        }
        Insert: {
          agreement_type?: string | null
          agreement_url?: string | null
          created_at?: string | null
          entrepreneur_signed?: boolean | null
          entrepreneur_signed_at?: string | null
          id?: string
          investment_id: string
          investor_signed?: boolean | null
          investor_signed_at?: string | null
          nda_url?: string | null
          status?: string | null
          terms: Json
          updated_at?: string | null
          witness_id?: string | null
          witness_signed?: boolean | null
          witness_signed_at?: string | null
        }
        Update: {
          agreement_type?: string | null
          agreement_url?: string | null
          created_at?: string | null
          entrepreneur_signed?: boolean | null
          entrepreneur_signed_at?: string | null
          id?: string
          investment_id?: string
          investor_signed?: boolean | null
          investor_signed_at?: string | null
          nda_url?: string | null
          status?: string | null
          terms?: Json
          updated_at?: string | null
          witness_id?: string | null
          witness_signed?: boolean | null
          witness_signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_agreements_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: true
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_agreements_witness_id_fkey"
            columns: ["witness_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_pool_governance: {
        Row: {
          campaign_end_date: string
          campaign_start_date: string
          created_at: string | null
          current_leader_id: string | null
          election_cycle_year: number
          id: string
          nomination_end_date: string
          nomination_start_date: string
          pool_id: string
          status: Database["public"]["Enums"]["election_status"] | null
          updated_at: string | null
          voting_end_date: string
          voting_start_date: string
        }
        Insert: {
          campaign_end_date: string
          campaign_start_date: string
          created_at?: string | null
          current_leader_id?: string | null
          election_cycle_year: number
          id?: string
          nomination_end_date: string
          nomination_start_date: string
          pool_id: string
          status?: Database["public"]["Enums"]["election_status"] | null
          updated_at?: string | null
          voting_end_date: string
          voting_start_date: string
        }
        Update: {
          campaign_end_date?: string
          campaign_start_date?: string
          created_at?: string | null
          current_leader_id?: string | null
          election_cycle_year?: number
          id?: string
          nomination_end_date?: string
          nomination_start_date?: string
          pool_id?: string
          status?: Database["public"]["Enums"]["election_status"] | null
          updated_at?: string | null
          voting_end_date?: string
          voting_start_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "investment_pool_governance_current_leader_id_fkey"
            columns: ["current_leader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "investment_pool_governance_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
        ]
      }
      investment_pools: {
        Row: {
          created_at: string | null
          created_by: string
          current_members: number | null
          description: string | null
          id: string
          is_active: boolean | null
          maximum_members: number | null
          minimum_investment: number
          name: string
          total_pool_amount: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          maximum_members?: number | null
          minimum_investment: number
          name: string
          total_pool_amount?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          current_members?: number | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          maximum_members?: number | null
          minimum_investment?: number
          name?: string
          total_pool_amount?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investment_pools_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          agreement_signed: boolean | null
          amount: number
          created_at: string | null
          equity_percentage: number
          id: string
          investor_id: string
          nda_signed: boolean | null
          opportunity_id: string
          status: Database["public"]["Enums"]["investment_status"] | null
          updated_at: string | null
        }
        Insert: {
          agreement_signed?: boolean | null
          amount: number
          created_at?: string | null
          equity_percentage: number
          id?: string
          investor_id: string
          nda_signed?: boolean | null
          opportunity_id: string
          status?: Database["public"]["Enums"]["investment_status"] | null
          updated_at?: string | null
        }
        Update: {
          agreement_signed?: boolean | null
          amount?: number
          created_at?: string | null
          equity_percentage?: number
          id?: string
          investor_id?: string
          nda_signed?: boolean | null
          opportunity_id?: string
          status?: Database["public"]["Enums"]["investment_status"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "investments_investor_id_fkey"
            columns: ["investor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      milestones: {
        Row: {
          completed: boolean | null
          completed_date: string | null
          created_at: string | null
          description: string
          id: string
          opportunity_id: string
          status: Database["public"]["Enums"]["milestone_status"] | null
          target_date: string
          title: string
          updated_at: string | null
        }
        Insert: {
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          description: string
          id?: string
          opportunity_id: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          target_date: string
          title: string
          updated_at?: string | null
        }
        Update: {
          completed?: boolean | null
          completed_date?: string | null
          created_at?: string | null
          description?: string
          id?: string
          opportunity_id?: string
          status?: Database["public"]["Enums"]["milestone_status"] | null
          target_date?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "milestones_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      opportunities: {
        Row: {
          ai_flags: Json | null
          category: Database["public"]["Enums"]["opportunity_category"]
          created_at: string | null
          current_funding: number | null
          debt_profile: Json | null
          description: string
          due_diligence_score: number | null
          due_diligence_summary: Json | null
          entrepreneur_id: string
          equity_offered: number
          existing_investors: Json | null
          expected_return: number
          funding_goal: number
          id: string
          location: string
          opportunity_type: string | null
          risk_assessment: Json | null
          status: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_flags?: Json | null
          category: Database["public"]["Enums"]["opportunity_category"]
          created_at?: string | null
          current_funding?: number | null
          debt_profile?: Json | null
          description: string
          due_diligence_score?: number | null
          due_diligence_summary?: Json | null
          entrepreneur_id: string
          equity_offered: number
          existing_investors?: Json | null
          expected_return: number
          funding_goal: number
          id?: string
          location: string
          opportunity_type?: string | null
          risk_assessment?: Json | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_flags?: Json | null
          category?: Database["public"]["Enums"]["opportunity_category"]
          created_at?: string | null
          current_funding?: number | null
          debt_profile?: Json | null
          description?: string
          due_diligence_score?: number | null
          due_diligence_summary?: Json | null
          entrepreneur_id?: string
          equity_offered?: number
          existing_investors?: Json | null
          expected_return?: number
          funding_goal?: number
          id?: string
          location?: string
          opportunity_type?: string | null
          risk_assessment?: Json | null
          status?: Database["public"]["Enums"]["opportunity_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "opportunities_entrepreneur_id_fkey"
            columns: ["entrepreneur_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string | null
          escrow_account: string
          from_user_id: string
          id: string
          investment_id: string | null
          proof_of_payment_url: string | null
          reference: string
          status: Database["public"]["Enums"]["payment_status"] | null
          to_user_id: string
          updated_at: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          escrow_account: string
          from_user_id: string
          id?: string
          investment_id?: string | null
          proof_of_payment_url?: string | null
          reference: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          to_user_id: string
          updated_at?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          escrow_account?: string
          from_user_id?: string
          id?: string
          investment_id?: string | null
          proof_of_payment_url?: string | null
          reference?: string
          status?: Database["public"]["Enums"]["payment_status"] | null
          to_user_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_from_user_id_fkey"
            columns: ["from_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_to_user_id_fkey"
            columns: ["to_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payments_enhanced: {
        Row: {
          admin_confirmed_at: string | null
          admin_confirmed_by: string | null
          admin_onward_proof_uploaded_at: string | null
          admin_onward_proof_url: string | null
          all_account_numbers_used: string[] | null
          amount: number
          completed_at: string | null
          created_at: string | null
          currency: string | null
          deductions: Json | null
          id: string
          investment_id: string | null
          net_amount: number | null
          opportunity_id: string | null
          payer_id: string
          payer_proof_uploaded_at: string | null
          payer_proof_url: string | null
          payment_notification_numbers: string[] | null
          payment_type: string
          receiver_banking_details: Json | null
          receiver_details_submitted_at: string | null
          receiver_id: string
          reference_number: string
          status: Database["public"]["Enums"]["payment_status_enhanced"] | null
          transaction_fees: Json | null
          updated_at: string | null
        }
        Insert: {
          admin_confirmed_at?: string | null
          admin_confirmed_by?: string | null
          admin_onward_proof_uploaded_at?: string | null
          admin_onward_proof_url?: string | null
          all_account_numbers_used?: string[] | null
          amount: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          deductions?: Json | null
          id?: string
          investment_id?: string | null
          net_amount?: number | null
          opportunity_id?: string | null
          payer_id: string
          payer_proof_uploaded_at?: string | null
          payer_proof_url?: string | null
          payment_notification_numbers?: string[] | null
          payment_type: string
          receiver_banking_details?: Json | null
          receiver_details_submitted_at?: string | null
          receiver_id: string
          reference_number: string
          status?: Database["public"]["Enums"]["payment_status_enhanced"] | null
          transaction_fees?: Json | null
          updated_at?: string | null
        }
        Update: {
          admin_confirmed_at?: string | null
          admin_confirmed_by?: string | null
          admin_onward_proof_uploaded_at?: string | null
          admin_onward_proof_url?: string | null
          all_account_numbers_used?: string[] | null
          amount?: number
          completed_at?: string | null
          created_at?: string | null
          currency?: string | null
          deductions?: Json | null
          id?: string
          investment_id?: string | null
          net_amount?: number | null
          opportunity_id?: string | null
          payer_id?: string
          payer_proof_uploaded_at?: string | null
          payer_proof_url?: string | null
          payment_notification_numbers?: string[] | null
          payment_type?: string
          receiver_banking_details?: Json | null
          receiver_details_submitted_at?: string | null
          receiver_id?: string
          reference_number?: string
          status?: Database["public"]["Enums"]["payment_status_enhanced"] | null
          transaction_fees?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_enhanced_admin_confirmed_by_fkey"
            columns: ["admin_confirmed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enhanced_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enhanced_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enhanced_payer_id_fkey"
            columns: ["payer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_enhanced_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_elections: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          election_type: string | null
          id: string
          nomination_end: string
          nomination_start: string
          pool_id: string
          status: string | null
          title: string
          total_votes: number | null
          updated_at: string | null
          voting_end: string
          voting_start: string
          winner_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          election_type?: string | null
          id?: string
          nomination_end: string
          nomination_start: string
          pool_id: string
          status?: string | null
          title: string
          total_votes?: number | null
          updated_at?: string | null
          voting_end: string
          voting_start: string
          winner_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          election_type?: string | null
          id?: string
          nomination_end?: string
          nomination_start?: string
          pool_id?: string
          status?: string | null
          title?: string
          total_votes?: number | null
          updated_at?: string | null
          voting_end?: string
          voting_start?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pool_elections_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_elections_pool_id_fkey"
            columns: ["pool_id"]
            isOneToOne: false
            referencedRelation: "investment_pools"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "pool_elections_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      pool_members: {
        Row: {
          id: string
          investment_amount: number
          joined_at: string | null
          membership_status: string | null
          pool_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          id?: string
          investment_amount: number
          joined_at?: string | null
          membership_status?: string | null
          pool_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          id?: string
          investment_amount?: number
          joined_at?: string | null
          membership_status?: string | null
          pool_id?: string
          updated_at?: string | null
          user_id?: string
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
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          company: string | null
          created_at: string | null
          credentials: string[] | null
          email: string
          id: string
          location: string | null
          name: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          credentials?: string[] | null
          email: string
          id: string
          location?: string | null
          name: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          company?: string | null
          created_at?: string | null
          credentials?: string[] | null
          email?: string
          id?: string
          location?: string | null
          name?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
        }
        Relationships: []
      }
      ratings_reviews: {
        Row: {
          ai_moderation_status: string | null
          created_at: string | null
          id: string
          is_ai_generated: boolean | null
          opportunity_id: string | null
          rating: number | null
          review_content: string | null
          review_type: string | null
          reviewee_id: string
          reviewer_id: string
          updated_at: string | null
        }
        Insert: {
          ai_moderation_status?: string | null
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          opportunity_id?: string | null
          rating?: number | null
          review_content?: string | null
          review_type?: string | null
          reviewee_id: string
          reviewer_id: string
          updated_at?: string | null
        }
        Update: {
          ai_moderation_status?: string | null
          created_at?: string | null
          id?: string
          is_ai_generated?: boolean | null
          opportunity_id?: string | null
          rating?: number | null
          review_content?: string | null
          review_type?: string | null
          reviewee_id?: string
          reviewer_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ratings_reviews_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviews_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ratings_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      remarks: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_private: boolean | null
          opportunity_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          opportunity_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_private?: boolean | null
          opportunity_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "remarks_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "remarks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          content: Json
          created_at: string | null
          file_path: string | null
          generated_by: string
          id: string
          opportunity_id: string | null
          report_type: string
          title: string
        }
        Insert: {
          content: Json
          created_at?: string | null
          file_path?: string | null
          generated_by: string
          id?: string
          opportunity_id?: string | null
          report_type: string
          title: string
        }
        Update: {
          content?: Json
          created_at?: string | null
          file_path?: string | null
          generated_by?: string
          id?: string
          opportunity_id?: string | null
          report_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_generated_by_fkey"
            columns: ["generated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          created_at: string | null
          execution_score: number
          financial_score: number
          id: string
          market_score: number
          opportunity_id: string
          overall_score: number
          recommendations: string[] | null
          team_score: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          execution_score: number
          financial_score: number
          id?: string
          market_score: number
          opportunity_id: string
          overall_score: number
          recommendations?: string[] | null
          team_score: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          execution_score?: number
          financial_score?: number
          id?: string
          market_score?: number
          opportunity_id?: string
          overall_score?: number
          recommendations?: string[] | null
          team_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: true
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
      service_engagements: {
        Row: {
          created_at: string | null
          description: string
          id: string
          investment_id: string | null
          opportunity_id: string | null
          requester_id: string
          service_provider_id: string
          status: string | null
          terms: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          investment_id?: string | null
          opportunity_id?: string | null
          requester_id: string
          service_provider_id: string
          status?: string | null
          terms?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          investment_id?: string | null
          opportunity_id?: string | null
          requester_id?: string
          service_provider_id?: string
          status?: string | null
          terms?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_engagements_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_engagements_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_engagements_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_engagements_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_reports: {
        Row: {
          attachments: Json | null
          engagement_id: string
          id: string
          report_content: string
          reviewed_at: string | null
          reviewed_by: string | null
          submitted_at: string | null
        }
        Insert: {
          attachments?: Json | null
          engagement_id: string
          id?: string
          report_content: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
        }
        Update: {
          attachments?: Json | null
          engagement_id?: string
          id?: string
          report_content?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          submitted_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_reports_engagement_id_fkey"
            columns: ["engagement_id"]
            isOneToOne: false
            referencedRelation: "service_engagements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_reports_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_provider_id: string | null
          budget: number | null
          created_at: string | null
          deadline: string | null
          description: string
          id: string
          opportunity_id: string | null
          requester_id: string
          requester_type: Database["public"]["Enums"]["user_role"]
          service_type: string
          status: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          assigned_provider_id?: string | null
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          description: string
          id?: string
          opportunity_id?: string | null
          requester_id: string
          requester_type: Database["public"]["Enums"]["user_role"]
          service_type: string
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          assigned_provider_id?: string | null
          budget?: number | null
          created_at?: string | null
          deadline?: string | null
          description?: string
          id?: string
          opportunity_id?: string | null
          requester_id?: string
          requester_type?: Database["public"]["Enums"]["user_role"]
          service_type?: string
          status?: Database["public"]["Enums"]["service_request_status"] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_provider_id_fkey"
            columns: ["assigned_provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      survey_responses: {
        Row: {
          id: string
          responses: Json
          submitted_at: string | null
          survey_id: string
          user_id: string
        }
        Insert: {
          id?: string
          responses: Json
          submitted_at?: string | null
          survey_id: string
          user_id: string
        }
        Update: {
          id?: string
          responses?: Json
          submitted_at?: string | null
          survey_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "survey_responses_survey_id_fkey"
            columns: ["survey_id"]
            isOneToOne: false
            referencedRelation: "surveys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "survey_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      surveys: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          ends_at: string | null
          id: string
          is_active: boolean | null
          questions: Json
          starts_at: string | null
          target_roles: Database["public"]["Enums"]["user_role"][] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          questions: Json
          starts_at?: string | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          ends_at?: string | null
          id?: string
          is_active?: boolean | null
          questions?: Json
          starts_at?: string | null
          target_roles?: Database["public"]["Enums"]["user_role"][] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "surveys_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string | null
          education: string | null
          experience: string | null
          id: string
          name: string
          opportunity_id: string
          role: string
        }
        Insert: {
          created_at?: string | null
          education?: string | null
          experience?: string | null
          id?: string
          name: string
          opportunity_id: string
          role: string
        }
        Update: {
          created_at?: string | null
          education?: string | null
          experience?: string | null
          id?: string
          name?: string
          opportunity_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_opportunity_id_fkey"
            columns: ["opportunity_id"]
            isOneToOne: false
            referencedRelation: "opportunities"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_due_diligence_score: {
        Args: { opp_id: string }
        Returns: number
      }
      get_user_role: {
        Args: { user_id: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_entrepreneur: {
        Args: { user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      agreement_status:
        | "draft"
        | "pending_signatures"
        | "signed"
        | "executed"
        | "terminated"
      document_type:
        | "business_plan"
        | "financial_statement"
        | "legal_document"
        | "proof_of_payment"
        | "report"
        | "other"
      election_status:
        | "scheduled"
        | "nomination_open"
        | "campaign_period"
        | "voting_open"
        | "completed"
        | "cancelled"
      investment_status: "pending" | "approved" | "active" | "completed"
      milestone_status: "pending" | "overdue" | "completed"
      opportunity_category:
        | "private_equity"
        | "order_fulfillment"
        | "project_partnership"
      opportunity_status: "draft" | "published" | "funded" | "closed"
      payment_status: "pending" | "confirmed" | "completed"
      payment_status_enhanced:
        | "pending_payer_proof"
        | "pending_admin_confirm"
        | "scheduled_onward"
        | "pending_receiver_details"
        | "pending_admin_onward_proof"
        | "completed"
        | "failed"
        | "cancelled"
      service_request_status: "open" | "assigned" | "in_progress" | "completed"
      user_role: "admin" | "entrepreneur" | "investor" | "service_provider"
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
      agreement_status: [
        "draft",
        "pending_signatures",
        "signed",
        "executed",
        "terminated",
      ],
      document_type: [
        "business_plan",
        "financial_statement",
        "legal_document",
        "proof_of_payment",
        "report",
        "other",
      ],
      election_status: [
        "scheduled",
        "nomination_open",
        "campaign_period",
        "voting_open",
        "completed",
        "cancelled",
      ],
      investment_status: ["pending", "approved", "active", "completed"],
      milestone_status: ["pending", "overdue", "completed"],
      opportunity_category: [
        "private_equity",
        "order_fulfillment",
        "project_partnership",
      ],
      opportunity_status: ["draft", "published", "funded", "closed"],
      payment_status: ["pending", "confirmed", "completed"],
      payment_status_enhanced: [
        "pending_payer_proof",
        "pending_admin_confirm",
        "scheduled_onward",
        "pending_receiver_details",
        "pending_admin_onward_proof",
        "completed",
        "failed",
        "cancelled",
      ],
      service_request_status: ["open", "assigned", "in_progress", "completed"],
      user_role: ["admin", "entrepreneur", "investor", "service_provider"],
    },
  },
} as const
