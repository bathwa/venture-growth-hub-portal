
-- Service Management Module Tables
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS service_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requestor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  associated_entity_id UUID,
  associated_entity_type VARCHAR(50) CHECK (associated_entity_type IN ('opportunity', 'investment', 'pool')),
  service_category_id UUID REFERENCES service_categories(id),
  scope_description TEXT NOT NULL,
  deliverables JSONB DEFAULT '[]'::jsonb,
  start_date DATE,
  end_date DATE,
  proposed_budget NUMERIC(15,2),
  status VARCHAR(50) DEFAULT 'pending_acceptance' CHECK (status IN ('pending_acceptance', 'accepted', 'declined', 'negotiating', 'cancelled', 'completed')),
  selected_service_provider_ids JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS work_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_request_id UUID NOT NULL REFERENCES service_requests(id) ON DELETE CASCADE,
  service_provider_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  agreed_scope TEXT,
  agreed_deliverables JSONB DEFAULT '[]'::jsonb,
  agreed_timeline_start DATE,
  agreed_timeline_end DATE,
  agreed_fee NUMERIC(15,2),
  status VARCHAR(50) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'pending_delivery', 'delivered', 'under_review', 'completed', 'cancelled')),
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'pending_payment', 'paid')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS job_cards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  work_order_id UUID NOT NULL REFERENCES work_orders(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  due_date DATE,
  status VARCHAR(50) DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'awaiting_client_input', 'completed', 'blocked')),
  progress_notes JSONB DEFAULT '[]'::jsonb,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pool Leadership and Management Tables
CREATE TABLE IF NOT EXISTS pool_leadership_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES investment_pools(id) ON DELETE CASCADE,
  role_name VARCHAR(100) NOT NULL,
  role_description TEXT,
  mandate TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_leadership_elections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES investment_pools(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES pool_leadership_roles(id) ON DELETE CASCADE,
  status VARCHAR(50) DEFAULT 'nomination' CHECK (status IN ('nomination', 'campaign', 'voting', 'completed', 'cancelled')),
  nomination_deadline TIMESTAMP WITH TIME ZONE,
  campaign_start TIMESTAMP WITH TIME ZONE,
  campaign_end TIMESTAMP WITH TIME ZONE,
  voting_start TIMESTAMP WITH TIME ZONE,
  voting_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_leadership_candidates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES pool_leadership_elections(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES pool_members(id) ON DELETE CASCADE,
  campaign_statement TEXT,
  status VARCHAR(50) DEFAULT 'nominated' CHECK (status IN ('nominated', 'withdrawn', 'disqualified')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_leadership_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  election_id UUID NOT NULL REFERENCES pool_leadership_elections(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES pool_members(id) ON DELETE CASCADE,
  candidate_id UUID NOT NULL REFERENCES pool_leadership_candidates(id) ON DELETE CASCADE,
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(election_id, voter_id)
);

CREATE TABLE IF NOT EXISTS pool_leaders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES investment_pools(id) ON DELETE CASCADE,
  member_id UUID NOT NULL REFERENCES pool_members(id) ON DELETE CASCADE,
  role_id UUID NOT NULL REFERENCES pool_leadership_roles(id) ON DELETE CASCADE,
  elected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  term_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  term_end TIMESTAMP WITH TIME ZONE,
  performance_rating NUMERIC(3,2) DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_confidence_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pool_id UUID NOT NULL REFERENCES investment_pools(id) ON DELETE CASCADE,
  leader_id UUID NOT NULL REFERENCES pool_leaders(id) ON DELETE CASCADE,
  initiated_by UUID NOT NULL REFERENCES pool_members(id) ON DELETE CASCADE,
  reason TEXT,
  voting_deadline TIMESTAMP WITH TIME ZONE NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'passed', 'failed', 'cancelled')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pool_confidence_vote_responses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  confidence_vote_id UUID NOT NULL REFERENCES pool_confidence_votes(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES pool_members(id) ON DELETE CASCADE,
  vote VARCHAR(20) NOT NULL CHECK (vote IN ('retain', 'replace')),
  voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(confidence_vote_id, voter_id)
);

-- Enhanced Milestone Management
CREATE TABLE IF NOT EXISTS milestone_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_type VARCHAR(50) NOT NULL,
  milestone_name VARCHAR(255) NOT NULL,
  description TEXT,
  suggested_timeline_days INTEGER,
  is_payment_trigger BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Document Template System
CREATE TABLE IF NOT EXISTS document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_name VARCHAR(255) NOT NULL,
  template_type VARCHAR(100) NOT NULL CHECK (template_type IN ('investment_agreement', 'nda', 'service_agreement', 'milestone_agreement')),
  template_content JSONB NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  version VARCHAR(50) DEFAULT '1.0',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES document_templates(id),
  opportunity_id UUID REFERENCES opportunities(id),
  investment_id UUID REFERENCES investments(id),
  generated_by UUID NOT NULL REFERENCES users(id),
  document_data JSONB NOT NULL,
  file_path VARCHAR(500),
  status VARCHAR(50) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_signature', 'signed', 'executed')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payment Request System
CREATE TABLE IF NOT EXISTS payment_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  requester_id UUID NOT NULL REFERENCES users(id),
  investment_id UUID REFERENCES investments(id),
  milestone_id UUID REFERENCES milestones(id),
  amount NUMERIC(15,2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'USD',
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('capital_request', 'return_payment', 'service_payment')),
  banking_details JSONB NOT NULL,
  proof_of_payment_url VARCHAR(500),
  admin_notes TEXT,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'processing', 'completed', 'rejected')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Negotiation System
CREATE TABLE IF NOT EXISTS negotiations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  opportunity_id UUID NOT NULL REFERENCES opportunities(id),
  investor_id UUID NOT NULL REFERENCES users(id),
  entrepreneur_id UUID NOT NULL REFERENCES users(id),
  terms JSONB NOT NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'accepted', 'rejected', 'expired')),
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS negotiation_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  negotiation_id UUID NOT NULL REFERENCES negotiations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id),
  message TEXT NOT NULL,
  proposed_changes JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced Notification System
CREATE TABLE IF NOT EXISTS notification_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_key VARCHAR(100) UNIQUE NOT NULL,
  template_content JSONB NOT NULL,
  variables JSONB DEFAULT '[]'::jsonb,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Due Diligence System
CREATE TABLE IF NOT EXISTS due_diligence_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  debt_profile JSONB DEFAULT '{}'::jsonb,
  credit_score INTEGER,
  financial_statements JSONB DEFAULT '[]'::jsonb,
  risk_assessment JSONB DEFAULT '{}'::jsonb,
  compliance_status VARCHAR(50) DEFAULT 'pending',
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id),
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  action VARCHAR(100) NOT NULL,
  details JSONB DEFAULT '{}'::jsonb,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_service_requests_requestor ON service_requests(requestor_id);
CREATE INDEX IF NOT EXISTS idx_service_requests_status ON service_requests(status);
CREATE INDEX IF NOT EXISTS idx_work_orders_service_provider ON work_orders(service_provider_id);
CREATE INDEX IF NOT EXISTS idx_job_cards_work_order ON job_cards(work_order_id);
CREATE INDEX IF NOT EXISTS idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX IF NOT EXISTS idx_pool_leaders_pool ON pool_leaders(pool_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_requester ON payment_requests(requester_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);

-- Enable RLS on new tables
ALTER TABLE service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE job_cards ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_leadership_elections ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_leaders ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE negotiations ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_diligence_profiles ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies
CREATE POLICY "Users can view their own service requests" ON service_requests
  FOR SELECT USING (auth.uid() = requestor_id);

CREATE POLICY "Service providers can view assigned work orders" ON work_orders
  FOR SELECT USING (auth.uid() = service_provider_id);

CREATE POLICY "Users can view their own payment requests" ON payment_requests
  FOR SELECT USING (auth.uid() = requester_id);

CREATE POLICY "Users can view their own due diligence profiles" ON due_diligence_profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Insert default service categories
INSERT INTO service_categories (name, description) VALUES
  ('Legal Services', 'Legal consultation, document review, and compliance'),
  ('Financial Advisory', 'Financial planning, accounting, and audit services'),
  ('Due Diligence', 'Investment research and risk assessment'),
  ('Marketing & PR', 'Marketing strategy, branding, and public relations'),
  ('IT Consulting', 'Technology consulting and development services'),
  ('Business Development', 'Strategy consulting and business development')
ON CONFLICT DO NOTHING;

-- Insert default milestone templates
INSERT INTO milestone_templates (opportunity_type, milestone_name, description, suggested_timeline_days, is_payment_trigger) VALUES
  ('going_concern', 'Due Diligence Completion', 'Complete comprehensive due diligence review', 30, false),
  ('going_concern', 'Legal Documentation', 'Finalize all legal agreements and documentation', 14, false),
  ('going_concern', 'Initial Capital Transfer', 'Transfer initial investment capital', 7, true),
  ('going_concern', 'Quarterly Review', 'Quarterly business performance review', 90, false),
  ('order_fulfillment', 'Order Confirmation', 'Confirm order specifications and requirements', 7, false),
  ('order_fulfillment', 'Production Milestone', 'Complete production phase', 60, true),
  ('order_fulfillment', 'Delivery Confirmation', 'Confirm successful delivery', 14, true),
  ('project_partnership', 'Partnership Agreement', 'Finalize partnership terms and agreements', 21, false),
  ('project_partnership', 'Project Kickoff', 'Official project commencement', 14, true),
  ('project_partnership', 'Phase 1 Completion', 'Complete first phase of project', 90, true)
ON CONFLICT DO NOTHING;

-- Insert notification templates
INSERT INTO notification_templates (template_key, template_content) VALUES
  ('investment_completed', '{"title": "Investment Completed", "message": "Your investment in {opportunity_name} has been completed successfully."}'),
  ('payment_received', '{"title": "Payment Received", "message": "Payment of {amount} has been received for {investment_name}."}'),
  ('milestone_due', '{"title": "Milestone Due", "message": "Milestone {milestone_name} is due on {due_date}."}'),
  ('service_request_received', '{"title": "New Service Request", "message": "You have received a new service request for {service_category}."}'),
  ('election_started', '{"title": "Pool Election Started", "message": "Leadership election has started for {role_name} in {pool_name}."}')
ON CONFLICT DO NOTHING;
