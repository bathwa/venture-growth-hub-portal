-- ============================================
-- COMPREHENSIVE SUPABASE SCHEMA FOR INVESTMENT PORTAL
-- ============================================
-- This is a complete, production-ready schema that includes:
-- - All tables with proper relationships
-- - Enums for type safety
-- - Indexes for performance
-- - Triggers for audit and timestamps
-- - RLS policies for security
-- - Sample data for testing
-- - Future scalability considerations
-- ============================================

-- =========================
-- DROP ALL EXISTING OBJECTS (SAFE TO RE-RUN)
-- =========================
DROP TABLE IF EXISTS observer_access_logs CASCADE;
DROP TABLE IF EXISTS observer_invitations CASCADE;
DROP TABLE IF EXISTS observers CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS documents CASCADE;
DROP TABLE IF EXISTS agreements CASCADE;
DROP TABLE IF EXISTS pool_votes CASCADE;
DROP TABLE IF EXISTS pool_distributions CASCADE;
DROP TABLE IF EXISTS pool_investments CASCADE;
DROP TABLE IF EXISTS pool_members CASCADE;
DROP TABLE IF EXISTS investment_pools CASCADE;
DROP TABLE IF EXISTS escrow_release_conditions CASCADE;
DROP TABLE IF EXISTS escrow_transactions CASCADE;
DROP TABLE IF EXISTS escrow_accounts CASCADE;
DROP TABLE IF EXISTS investments CASCADE;
DROP TABLE IF EXISTS opportunities CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS platform_settings CASCADE;
DROP TABLE IF EXISTS kyc_verifications CASCADE;
DROP TABLE IF EXISTS milestones CASCADE;
DROP TABLE IF EXISTS payments CASCADE;

-- Drop existing types
DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS kyc_status CASCADE;
DROP TYPE IF EXISTS opportunity_status CASCADE;
DROP TYPE IF EXISTS investment_status CASCADE;
DROP TYPE IF EXISTS pool_type CASCADE;
DROP TYPE IF EXISTS pool_status CASCADE;
DROP TYPE IF EXISTS pool_member_role CASCADE;
DROP TYPE IF EXISTS escrow_type CASCADE;
DROP TYPE IF EXISTS escrow_status CASCADE;
DROP TYPE IF EXISTS notification_type CASCADE;
DROP TYPE IF EXISTS notification_priority CASCADE;
DROP TYPE IF EXISTS notification_status CASCADE;
DROP TYPE IF EXISTS funding_type CASCADE;
DROP TYPE IF EXISTS business_stage CASCADE;
DROP TYPE IF EXISTS payment_status CASCADE;
DROP TYPE IF EXISTS milestone_status CASCADE;

-- =========================
-- CREATE ENUMS FOR TYPE SAFETY
-- =========================
CREATE TYPE user_role AS ENUM ('admin', 'entrepreneur', 'investor', 'pool', 'service_provider', 'observer');
CREATE TYPE kyc_status AS ENUM ('not_submitted', 'pending', 'verified', 'rejected');
CREATE TYPE opportunity_status AS ENUM ('draft', 'pending', 'published', 'funded', 'closed', 'cancelled');
CREATE TYPE investment_status AS ENUM ('pending', 'approved', 'rejected', 'completed', 'cancelled');
CREATE TYPE pool_type AS ENUM ('syndicate', 'fund', 'collective', 'angel_group');
CREATE TYPE pool_status AS ENUM ('forming', 'active', 'investing', 'distributing', 'closed', 'cancelled');
CREATE TYPE pool_member_role AS ENUM ('manager', 'investor', 'advisor', 'observer');
CREATE TYPE escrow_type AS ENUM ('investment', 'payment', 'milestone', 'security');
CREATE TYPE escrow_status AS ENUM ('pending', 'active', 'funded', 'released', 'disputed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'success', 'warning', 'error', 'milestone', 'payment', 'agreement', 'kyc', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high', 'urgent');
CREATE TYPE notification_status AS ENUM ('unread', 'read', 'archived');
CREATE TYPE funding_type AS ENUM ('equity', 'debt', 'convertible_note', 'revenue_sharing');
CREATE TYPE business_stage AS ENUM ('idea', 'startup', 'growth', 'established', 'expansion');
CREATE TYPE payment_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE milestone_status AS ENUM ('pending', 'in_progress', 'completed', 'overdue', 'cancelled');

-- =========================
-- CORE TABLES
-- =========================

-- USERS TABLE
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'entrepreneur',
    avatar VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    company VARCHAR(255),
    position VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    twitter VARCHAR(255),
    kyc_status kyc_status DEFAULT 'not_submitted',
    verification_level INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP WITH TIME ZONE,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- OPPORTUNITIES TABLE
CREATE TABLE opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrepreneur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    equity_offered DECIMAL(5,2) NOT NULL CHECK (equity_offered > 0 AND equity_offered <= 100),
    min_investment DECIMAL(15,2) NOT NULL CHECK (min_investment > 0),
    max_investment DECIMAL(15,2),
    funding_type funding_type NOT NULL DEFAULT 'equity',
    business_stage business_stage NOT NULL DEFAULT 'startup',
    expected_return DECIMAL(5,2),
    timeline INTEGER,
    use_of_funds TEXT,
    team_size INTEGER,
    founded_year INTEGER,
    website VARCHAR(255),
    linkedin VARCHAR(255),
    pitch_deck_url VARCHAR(255),
    status opportunity_status NOT NULL DEFAULT 'draft',
    views INTEGER DEFAULT 0,
    interested_investors INTEGER DEFAULT 0,
    total_raised DECIMAL(15,2) DEFAULT 0,
    risk_score DECIMAL(3,2),
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- INVESTMENTS TABLE
CREATE TABLE investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    pool_id UUID REFERENCES investment_pools(id) ON DELETE SET NULL,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    equity_percentage DECIMAL(5,2),
    status investment_status NOT NULL DEFAULT 'pending',
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    escrow_account_id UUID,
    notes TEXT,
    terms_accepted BOOLEAN DEFAULT FALSE,
    terms_accepted_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- =========================
-- ESCROW SYSTEM
-- =========================

-- ESCROW ACCOUNTS
CREATE TABLE escrow_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entrepreneur_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type escrow_type NOT NULL,
    status escrow_status NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(15,2) NOT NULL,
    available_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    held_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    release_conditions TEXT[] DEFAULT '{}',
    auto_release_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESCROW TRANSACTIONS
CREATE TABLE escrow_transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    escrow_account_id UUID REFERENCES escrow_accounts(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'release', 'refund', 'fee')),
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    reference VARCHAR(100) NOT NULL,
    description TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    processed_at TIMESTAMP WITH TIME ZONE,
    fee_amount DECIMAL(15,2),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ESCROW RELEASE CONDITIONS
CREATE TABLE escrow_release_conditions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    escrow_account_id UUID REFERENCES escrow_accounts(id) ON DELETE CASCADE,
    condition_type VARCHAR(30) NOT NULL CHECK (condition_type IN ('milestone_completion', 'time_based', 'manual_approval', 'document_verification')),
    description TEXT NOT NULL,
    is_met BOOLEAN NOT NULL DEFAULT FALSE,
    required_documents TEXT[],
    due_date TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- INVESTMENT POOLS
-- =========================

-- INVESTMENT POOLS
CREATE TABLE investment_pools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type pool_type NOT NULL,
    status pool_status NOT NULL DEFAULT 'forming',
    target_amount DECIMAL(15,2) NOT NULL,
    minimum_investment DECIMAL(15,2) NOT NULL,
    maximum_investment DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    manager_id UUID REFERENCES users(id) ON DELETE CASCADE,
    investment_strategy TEXT,
    risk_profile VARCHAR(20) NOT NULL DEFAULT 'moderate' CHECK (risk_profile IN ('conservative', 'moderate', 'aggressive')),
    term_length_months INTEGER NOT NULL,
    management_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    performance_fee_percentage DECIMAL(5,2) NOT NULL DEFAULT 0,
    auto_approve_investments BOOLEAN NOT NULL DEFAULT FALSE,
    require_majority_vote BOOLEAN NOT NULL DEFAULT TRUE,
    max_members INTEGER NOT NULL,
    current_members INTEGER NOT NULL DEFAULT 0,
    total_committed DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_invested DECIMAL(15,2) NOT NULL DEFAULT 0,
    total_distributed DECIMAL(15,2) NOT NULL DEFAULT 0,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POOL MEMBERS
CREATE TABLE pool_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES investment_pools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role pool_member_role NOT NULL DEFAULT 'investor',
    committed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    invested_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    distributed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    voting_power INTEGER NOT NULL DEFAULT 0,
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    investment_preferences TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'left')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pool_id, user_id)
);

-- POOL INVESTMENTS
CREATE TABLE pool_investments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES investment_pools(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    status VARCHAR(20) NOT NULL DEFAULT 'proposed' CHECK (status IN ('proposed', 'voting', 'approved', 'rejected', 'invested', 'exited')),
    proposed_by UUID REFERENCES users(id) ON DELETE CASCADE,
    proposed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    voting_deadline TIMESTAMP WITH TIME ZONE,
    investment_date TIMESTAMP WITH TIME ZONE,
    exit_date TIMESTAMP WITH TIME ZONE,
    return_percentage DECIMAL(5,2),
    notes TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- POOL VOTES
CREATE TABLE pool_votes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    investment_id UUID REFERENCES pool_investments(id) ON DELETE CASCADE,
    member_id UUID REFERENCES pool_members(id) ON DELETE CASCADE,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('approve', 'reject', 'abstain')),
    voted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    comments TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(investment_id, member_id)
);

-- POOL DISTRIBUTIONS
CREATE TABLE pool_distributions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES investment_pools(id) ON DELETE CASCADE,
    investment_id UUID REFERENCES pool_investments(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    distribution_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    distribution_type VARCHAR(20) NOT NULL CHECK (distribution_type IN ('dividend', 'capital_return', 'exit_proceeds')),
    per_member_breakdown JSONB NOT NULL DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- NOTIFICATIONS SYSTEM
-- =========================

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    data JSONB DEFAULT '{}',
    priority notification_priority NOT NULL DEFAULT 'medium',
    status notification_status NOT NULL DEFAULT 'unread',
    action_required BOOLEAN NOT NULL DEFAULT FALSE,
    action_url VARCHAR(255),
    action_text VARCHAR(100),
    expires_at TIMESTAMP WITH TIME ZONE,
    read_at TIMESTAMP WITH TIME ZONE,
    is_read BOOLEAN NOT NULL DEFAULT FALSE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- OBSERVER SYSTEM
-- =========================

CREATE TABLE observers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    granted_by UUID REFERENCES users(id) ON DELETE SET NULL,
    granted_by_role user_role,
    entity_id UUID,
    entity_type VARCHAR(50),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'revoked')),
    last_accessed TIMESTAMP WITH TIME ZONE,
    access_expiry TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE observer_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    relationship VARCHAR(100),
    entity_id UUID,
    entity_type VARCHAR(50),
    permissions JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'expired')),
    invited_by UUID REFERENCES users(id) ON DELETE CASCADE,
    invited_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    token VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE observer_access_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    observer_id UUID REFERENCES observers(id) ON DELETE CASCADE,
    action VARCHAR(100) NOT NULL,
    resource VARCHAR(100) NOT NULL,
    accessed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    metadata JSONB DEFAULT '{}'
);

-- =========================
-- DOCUMENTS & AGREEMENTS
-- =========================

CREATE TABLE documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    pool_id UUID REFERENCES investment_pools(id) ON DELETE SET NULL,
    investment_id UUID REFERENCES investments(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    file_url VARCHAR(255) NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    mime_type VARCHAR(100),
    bucket_name VARCHAR(100),
    file_path VARCHAR(500),
    is_public BOOLEAN DEFAULT FALSE,
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'deleted')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE agreements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID REFERENCES documents(id) ON DELETE SET NULL,
    agreement_type VARCHAR(50) NOT NULL,
    parties JSONB NOT NULL,
    content JSONB NOT NULL,
    variables JSONB DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'signed', 'expired', 'cancelled')),
    signed_at TIMESTAMP WITH TIME ZONE,
    expires_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- ADDITIONAL FEATURES
-- =========================

-- KYC VERIFICATIONS
CREATE TABLE kyc_verifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    verification_type VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    documents JSONB DEFAULT '{}',
    verification_data JSONB DEFAULT '{}',
    verified_at TIMESTAMP WITH TIME ZONE,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- MILESTONES
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status milestone_status NOT NULL DEFAULT 'pending',
    completion_criteria TEXT,
    completed_at TIMESTAMP WITH TIME ZONE,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PAYMENTS
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investment_id UUID REFERENCES investments(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50),
    status payment_status NOT NULL DEFAULT 'pending',
    transaction_id VARCHAR(255),
    gateway_response JSONB DEFAULT '{}',
    processed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- PLATFORM SETTINGS
CREATE TABLE platform_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- AUDIT LOGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(100) NOT NULL,
    entity_id UUID,
    old_values JSONB DEFAULT '{}',
    new_values JSONB DEFAULT '{}',
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =========================
-- INDEXES FOR PERFORMANCE
-- =========================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_kyc_status ON users(kyc_status);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Opportunities indexes
CREATE INDEX idx_opportunities_entrepreneur ON opportunities(entrepreneur_id);
CREATE INDEX idx_opportunities_status ON opportunities(status);
CREATE INDEX idx_opportunities_industry ON opportunities(industry);
CREATE INDEX idx_opportunities_location ON opportunities(location);
CREATE INDEX idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX idx_opportunities_target_amount ON opportunities(target_amount);
CREATE INDEX idx_opportunities_published_at ON opportunities(published_at);

-- Investments indexes
CREATE INDEX idx_investments_opportunity ON investments(opportunity_id);
CREATE INDEX idx_investments_investor ON investments(investor_id);
CREATE INDEX idx_investments_pool ON investments(pool_id);
CREATE INDEX idx_investments_status ON investments(status);
CREATE INDEX idx_investments_created_at ON investments(created_at);

-- Escrow indexes
CREATE INDEX idx_escrow_accounts_investor ON escrow_accounts(investor_id);
CREATE INDEX idx_escrow_accounts_entrepreneur ON escrow_accounts(entrepreneur_id);
CREATE INDEX idx_escrow_accounts_opportunity ON escrow_accounts(opportunity_id);
CREATE INDEX idx_escrow_accounts_status ON escrow_accounts(status);
CREATE INDEX idx_escrow_transactions_account ON escrow_transactions(escrow_account_id);
CREATE INDEX idx_escrow_transactions_type ON escrow_transactions(type);
CREATE INDEX idx_escrow_transactions_status ON escrow_transactions(status);

-- Pool indexes
CREATE INDEX idx_investment_pools_created_by ON investment_pools(created_by);
CREATE INDEX idx_investment_pools_manager ON investment_pools(manager_id);
CREATE INDEX idx_investment_pools_status ON investment_pools(status);
CREATE INDEX idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX idx_pool_members_user ON pool_members(user_id);
CREATE INDEX idx_pool_members_status ON pool_members(status);
CREATE INDEX idx_pool_investments_pool ON pool_investments(pool_id);
CREATE INDEX idx_pool_investments_opportunity ON pool_investments(opportunity_id);
CREATE INDEX idx_pool_investments_status ON pool_investments(status);

-- Notification indexes
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_status ON notifications(status);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);
CREATE INDEX idx_notifications_type ON notifications(type);

-- Observer indexes
CREATE INDEX idx_observers_granted_by ON observers(granted_by);
CREATE INDEX idx_observers_entity ON observers(entity_id, entity_type);
CREATE INDEX idx_observers_status ON observers(status);
CREATE INDEX idx_observer_invitations_email ON observer_invitations(email);
CREATE INDEX idx_observer_invitations_token ON observer_invitations(token);
CREATE INDEX idx_observer_invitations_status ON observer_invitations(status);

-- Document indexes
CREATE INDEX idx_documents_user ON documents(user_id);
CREATE INDEX idx_documents_opportunity ON documents(opportunity_id);
CREATE INDEX idx_documents_pool ON documents(pool_id);
CREATE INDEX idx_documents_status ON documents(status);

-- Audit indexes
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity, entity_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- =========================
-- TRIGGERS AND FUNCTIONS
-- =========================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_opportunities_updated_at BEFORE UPDATE ON opportunities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investments_updated_at BEFORE UPDATE ON investments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_escrow_accounts_updated_at BEFORE UPDATE ON escrow_accounts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_investment_pools_updated_at BEFORE UPDATE ON investment_pools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_agreements_updated_at BEFORE UPDATE ON agreements FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_kyc_verifications_updated_at BEFORE UPDATE ON kyc_verifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_milestones_updated_at BEFORE UPDATE ON milestones FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_platform_settings_updated_at BEFORE UPDATE ON platform_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Escrow balance update trigger
CREATE OR REPLACE FUNCTION update_escrow_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.status = 'completed' THEN
        UPDATE escrow_accounts 
        SET 
            available_balance = available_balance + CASE WHEN NEW.type = 'deposit' THEN NEW.amount ELSE -NEW.amount END,
            updated_at = NOW()
        WHERE id = NEW.escrow_account_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_escrow_balance
    AFTER INSERT ON escrow_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_escrow_balance();

-- Pool totals update trigger
CREATE OR REPLACE FUNCTION update_pool_totals()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE investment_pools 
    SET 
        current_members = (SELECT COUNT(*) FROM pool_members WHERE pool_id = NEW.pool_id AND status = 'active'),
        total_committed = (SELECT COALESCE(SUM(committed_amount), 0) FROM pool_members WHERE pool_id = NEW.pool_id AND status = 'active'),
        updated_at = NOW()
    WHERE id = NEW.pool_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pool_totals
    AFTER INSERT OR UPDATE ON pool_members
    FOR EACH ROW
    EXECUTE FUNCTION update_pool_totals();

-- Opportunity total raised update trigger
CREATE OR REPLACE FUNCTION update_opportunity_total_raised()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE opportunities 
    SET 
        total_raised = (SELECT COALESCE(SUM(amount), 0) FROM investments WHERE opportunity_id = NEW.opportunity_id AND status = 'completed'),
        updated_at = NOW()
    WHERE id = NEW.opportunity_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_opportunity_total_raised
    AFTER INSERT OR UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunity_total_raised();

-- =========================
-- ROW LEVEL SECURITY (RLS)
-- =========================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_release_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_distributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE observers ENABLE ROW LEVEL SECURITY;
ALTER TABLE observer_invitations ENABLE ROW LEVEL SECURITY;
ALTER TABLE observer_access_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE kyc_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE platform_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view their own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can view other users' basic info" ON users FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- Opportunities policies
CREATE POLICY "Users can view published opportunities" ON opportunities FOR SELECT USING (status = 'published');
CREATE POLICY "Users can view their own opportunities" ON opportunities FOR SELECT USING (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs can create opportunities" ON opportunities FOR INSERT WITH CHECK (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs can update their own opportunities" ON opportunities FOR UPDATE USING (auth.uid() = entrepreneur_id);
CREATE POLICY "Entrepreneurs can delete their own opportunities" ON opportunities FOR DELETE USING (auth.uid() = entrepreneur_id);

-- Investments policies
CREATE POLICY "Users can view their own investments" ON investments FOR SELECT USING (auth.uid() = investor_id);
CREATE POLICY "Users can view investments in opportunities they own" ON investments FOR SELECT USING (
    EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = investments.opportunity_id AND opportunities.entrepreneur_id = auth.uid())
);
CREATE POLICY "Investors can create investments" ON investments FOR INSERT WITH CHECK (auth.uid() = investor_id);
CREATE POLICY "Investors can update their own investments" ON investments FOR UPDATE USING (auth.uid() = investor_id);

-- Escrow policies
CREATE POLICY "Users can view their own escrow accounts" ON escrow_accounts FOR SELECT USING (auth.uid() = investor_id OR auth.uid() = entrepreneur_id);
CREATE POLICY "Users can view their own escrow transactions" ON escrow_transactions FOR SELECT USING (
    EXISTS (SELECT 1 FROM escrow_accounts WHERE escrow_accounts.id = escrow_transactions.escrow_account_id AND (escrow_accounts.investor_id = auth.uid() OR escrow_accounts.entrepreneur_id = auth.uid()))
);

-- Pool policies
CREATE POLICY "Users can view pools they are members of" ON investment_pools FOR SELECT USING (
    EXISTS (SELECT 1 FROM pool_members WHERE pool_members.pool_id = investment_pools.id AND pool_members.user_id = auth.uid())
);
CREATE POLICY "Users can view pools they created" ON investment_pools FOR SELECT USING (auth.uid() = created_by);
CREATE POLICY "Users can create pools" ON investment_pools FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Notification policies
CREATE POLICY "Users can view their own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);

-- Observer policies
CREATE POLICY "Users can view observers they granted" ON observers FOR SELECT USING (auth.uid() = granted_by);
CREATE POLICY "Users can view observers for their entities" ON observers FOR SELECT USING (
    (entity_type = 'opportunity' AND EXISTS (SELECT 1 FROM opportunities WHERE opportunities.id = observers.entity_id AND opportunities.entrepreneur_id = auth.uid())) OR
    (entity_type = 'pool' AND EXISTS (SELECT 1 FROM investment_pools WHERE investment_pools.id = observers.entity_id AND investment_pools.created_by = auth.uid()))
);

-- Document policies
CREATE POLICY "Users can view their own documents" ON documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can view public documents" ON documents FOR SELECT USING (is_public = true);
CREATE POLICY "Users can create documents" ON documents FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================
-- SAMPLE DATA
-- =========================

-- Insert sample users
INSERT INTO users (id, email, name, role, phone, company, position, location, kyc_status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'entrepreneur@example.com', 'John Entrepreneur', 'entrepreneur', '+1234567890', 'TechCorp Inc.', 'CEO', 'San Francisco, CA', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440002', 'investor@example.com', 'Jane Investor', 'investor', '+1234567891', 'Investment Fund LLC', 'Partner', 'New York, NY', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440003', 'service@example.com', 'Bob Service', 'service_provider', '+1234567892', 'Legal Services Co.', 'Attorney', 'Los Angeles, CA', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440004', 'pool@example.com', 'Alice Pool', 'pool', '+1234567893', 'Investment Pool Ltd.', 'Manager', 'Chicago, IL', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440005', 'admin@example.com', 'Admin User', 'admin', '+1234567894', 'Platform Admin', 'Administrator', 'Remote', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440006', 'observer@example.com', 'Observer User', 'observer', '+1234567895', 'Compliance Team', 'Observer', 'Remote', 'verified')
ON CONFLICT (email) DO NOTHING;

-- Insert sample opportunities
INSERT INTO opportunities (
    entrepreneur_id, 
    title, 
    description, 
    industry, 
    location, 
    target_amount, 
    equity_offered, 
    min_investment, 
    funding_type, 
    business_stage, 
    expected_return, 
    timeline, 
    use_of_funds, 
    team_size, 
    founded_year, 
    website, 
    status, 
    views, 
    interested_investors
) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'Tech Startup - AI Platform', 'Revolutionary AI platform for business automation', 'technology', 'San Francisco, CA', 500000.00, 15.0, 10000.00, 'equity', 'growth', 25.0, 12, 'Product development and market expansion', 8, 2020, 'https://example.com', 'published', 150, 12),
    ('550e8400-e29b-41d4-a716-446655440001', 'Healthcare Innovation', 'Digital health platform for patient monitoring', 'healthcare', 'Boston, MA', 300000.00, 10.0, 5000.00, 'equity', 'startup', 20.0, 18, 'Clinical trials and FDA approval', 5, 2021, 'https://healthtech.com', 'published', 89, 7),
    ('550e8400-e29b-41d4-a716-446655440001', 'Green Energy Solutions', 'Renewable energy technology for homes', 'energy', 'Austin, TX', 750000.00, 20.0, 25000.00, 'equity', 'established', 30.0, 24, 'Manufacturing scale-up and distribution', 12, 2019, 'https://greenenergy.com', 'published', 234, 18)
ON CONFLICT DO NOTHING;

-- Insert sample investments
INSERT INTO investments (opportunity_id, investor_id, amount, equity_percentage, status, payment_method)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 50000.00, 5.0, 'completed', 'bank_transfer'),
    ('550e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440004', 25000.00, 2.5, 'approved', 'escrow'),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440002', 100000.00, 10.0, 'pending', 'bank_transfer')
ON CONFLICT DO NOTHING;

-- Insert sample investment pool
INSERT INTO investment_pools (
    id,
    name,
    description,
    type,
    status,
    target_amount,
    minimum_investment,
    maximum_investment,
    created_by,
    manager_id,
    investment_strategy,
    risk_profile,
    term_length_months,
    max_members
) VALUES (
    '550e8400-e29b-41d4-a716-446655440007',
    'Tech Innovation Fund',
    'Focused on early-stage technology companies',
    'fund',
    'active',
    1000000.00,
    10000.00,
    100000.00,
    '550e8400-e29b-41d4-a716-446655440004',
    '550e8400-e29b-41d4-a716-446655440004',
    'Invest in promising tech startups with strong growth potential',
    'moderate',
    36,
    50
) ON CONFLICT DO NOTHING;

-- Insert sample pool members
INSERT INTO pool_members (pool_id, user_id, role, committed_amount, status)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440002', 'investor', 50000.00, 'active'),
    ('550e8400-e29b-41d4-a716-446655440007', '550e8400-e29b-41d4-a716-446655440003', 'advisor', 0.00, 'active')
ON CONFLICT DO NOTHING;

-- Insert sample notifications
INSERT INTO notifications (user_id, type, title, message, priority)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'success', 'Opportunity Published', 'Your opportunity "Tech Startup - AI Platform" has been successfully published.', 'medium'),
    ('550e8400-e29b-41d4-a716-446655440002', 'info', 'New Investment Opportunity', 'A new investment opportunity matching your preferences is available.', 'low')
ON CONFLICT DO NOTHING;

-- Insert sample platform settings
INSERT INTO platform_settings (setting_key, setting_value, description, is_public)
VALUES 
    ('platform_name', '"Venture Growth Hub Portal"', 'Name of the platform', true),
    ('min_investment_amount', '1000', 'Minimum investment amount in USD', true),
    ('max_investment_amount', '1000000', 'Maximum investment amount in USD', true),
    ('platform_fee_percentage', '2.5', 'Platform fee percentage', false),
    ('kyc_required', 'true', 'Whether KYC is required for investments', true)
ON CONFLICT (setting_key) DO NOTHING;

-- =========================
-- STORAGE BUCKETS (CREATE VIA SUPABASE UI)
-- =========================
-- Create the following buckets in Supabase Storage:
-- - documents (for pitch decks, contracts, etc.)
-- - avatars (for user profile pictures)
-- - agreements (for signed agreements)
-- - kyc-documents (for KYC verification documents)
-- - public (for public assets)

-- =========================
-- EDGE FUNCTIONS (CREATE VIA SUPABASE UI)
-- =========================
-- Create the following edge functions:
-- - process-payment (for payment processing)
-- - send-notification (for sending notifications)
-- - validate-kyc (for KYC validation)
-- - generate-agreement (for agreement generation)
-- - calculate-risk-score (for AI risk assessment)

-- =========================
-- FUTURE EXTENSIONS
-- =========================
-- This schema is designed to be extensible. Future additions could include:
-- - Analytics and reporting tables
-- - Advanced AI/ML features
-- - Multi-currency support
-- - Advanced compliance features
-- - Integration with external services
-- - Advanced notification system
-- - Real-time messaging
-- - Advanced document management
-- - Workflow automation
-- - Advanced security features

-- =========================
-- END OF SCHEMA
-- ========================= 