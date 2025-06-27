-- Escrow Account Management Tables
-- =================================

-- Escrow Accounts Table
CREATE TABLE escrow_accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    account_number VARCHAR(50) UNIQUE NOT NULL,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE CASCADE,
    investor_id UUID REFERENCES users(id) ON DELETE CASCADE,
    entrepreneur_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(20) NOT NULL CHECK (type IN ('investment', 'payment', 'milestone', 'security')),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'funded', 'released', 'disputed', 'cancelled')),
    total_amount DECIMAL(15,2) NOT NULL,
    available_balance DECIMAL(15,2) NOT NULL DEFAULT 0,
    held_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    release_conditions TEXT[] DEFAULT '{}',
    auto_release_date TIMESTAMP WITH TIME ZONE,
    admin_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Escrow Transactions Table
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

-- Escrow Release Conditions Table
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

-- Investment Pool Management Tables
-- =================================

-- Investment Pools Table
CREATE TABLE investment_pools (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL CHECK (type IN ('syndicate', 'fund', 'collective', 'angel_group')),
    status VARCHAR(20) NOT NULL DEFAULT 'forming' CHECK (status IN ('forming', 'active', 'investing', 'distributing', 'closed', 'cancelled')),
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pool Members Table
CREATE TABLE pool_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    pool_id UUID REFERENCES investment_pools(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'investor' CHECK (role IN ('manager', 'investor', 'advisor', 'observer')),
    committed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    invested_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    distributed_amount DECIMAL(15,2) NOT NULL DEFAULT 0,
    voting_power INTEGER NOT NULL DEFAULT 0,
    kyc_verified BOOLEAN NOT NULL DEFAULT FALSE,
    investment_preferences TEXT[] DEFAULT '{}',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'suspended', 'left')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(pool_id, user_id)
);

-- Pool Investments Table
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
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Pool Votes Table
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

-- Pool Distributions Table
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

-- Indexes for Performance
-- =======================

-- Escrow Accounts Indexes
CREATE INDEX idx_escrow_accounts_investor ON escrow_accounts(investor_id);
CREATE INDEX idx_escrow_accounts_entrepreneur ON escrow_accounts(entrepreneur_id);
CREATE INDEX idx_escrow_accounts_opportunity ON escrow_accounts(opportunity_id);
CREATE INDEX idx_escrow_accounts_status ON escrow_accounts(status);
CREATE INDEX idx_escrow_accounts_type ON escrow_accounts(type);

-- Escrow Transactions Indexes
CREATE INDEX idx_escrow_transactions_account ON escrow_transactions(escrow_account_id);
CREATE INDEX idx_escrow_transactions_type ON escrow_transactions(type);
CREATE INDEX idx_escrow_transactions_status ON escrow_transactions(status);
CREATE INDEX idx_escrow_transactions_date ON escrow_transactions(transaction_date);

-- Escrow Release Conditions Indexes
CREATE INDEX idx_escrow_release_conditions_account ON escrow_release_conditions(escrow_account_id);
CREATE INDEX idx_escrow_release_conditions_met ON escrow_release_conditions(is_met);

-- Investment Pools Indexes
CREATE INDEX idx_investment_pools_created_by ON investment_pools(created_by);
CREATE INDEX idx_investment_pools_manager ON investment_pools(manager_id);
CREATE INDEX idx_investment_pools_status ON investment_pools(status);
CREATE INDEX idx_investment_pools_type ON investment_pools(type);

-- Pool Members Indexes
CREATE INDEX idx_pool_members_pool ON pool_members(pool_id);
CREATE INDEX idx_pool_members_user ON pool_members(user_id);
CREATE INDEX idx_pool_members_role ON pool_members(role);
CREATE INDEX idx_pool_members_status ON pool_members(status);

-- Pool Investments Indexes
CREATE INDEX idx_pool_investments_pool ON pool_investments(pool_id);
CREATE INDEX idx_pool_investments_opportunity ON pool_investments(opportunity_id);
CREATE INDEX idx_pool_investments_status ON pool_investments(status);
CREATE INDEX idx_pool_investments_proposed_by ON pool_investments(proposed_by);

-- Pool Votes Indexes
CREATE INDEX idx_pool_votes_investment ON pool_votes(investment_id);
CREATE INDEX idx_pool_votes_member ON pool_votes(member_id);
CREATE INDEX idx_pool_votes_type ON pool_votes(vote_type);

-- Pool Distributions Indexes
CREATE INDEX idx_pool_distributions_pool ON pool_distributions(pool_id);
CREATE INDEX idx_pool_distributions_investment ON pool_distributions(investment_id);
CREATE INDEX idx_pool_distributions_date ON pool_distributions(distribution_date);

-- Row Level Security (RLS) Policies
-- =================================

-- Enable RLS on all tables
ALTER TABLE escrow_accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE escrow_release_conditions ENABLE ROW LEVEL SECURITY;
ALTER TABLE investment_pools ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE pool_distributions ENABLE ROW LEVEL SECURITY;

-- Escrow Accounts RLS Policies
CREATE POLICY "Users can view their own escrow accounts" ON escrow_accounts
    FOR SELECT USING (
        auth.uid() = investor_id OR 
        auth.uid() = entrepreneur_id OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can create escrow accounts" ON escrow_accounts
    FOR INSERT WITH CHECK (
        auth.uid() = investor_id OR 
        auth.uid() = entrepreneur_id OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can update their own escrow accounts" ON escrow_accounts
    FOR UPDATE USING (
        auth.uid() = investor_id OR 
        auth.uid() = entrepreneur_id OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Escrow Transactions RLS Policies
CREATE POLICY "Users can view transactions for their accounts" ON escrow_transactions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM escrow_accounts 
            WHERE id = escrow_transactions.escrow_account_id 
            AND (investor_id = auth.uid() OR entrepreneur_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can create transactions for their accounts" ON escrow_transactions
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM escrow_accounts 
            WHERE id = escrow_transactions.escrow_account_id 
            AND (investor_id = auth.uid() OR entrepreneur_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Investment Pools RLS Policies
CREATE POLICY "Users can view pools they created or are members of" ON investment_pools
    FOR SELECT USING (
        created_by = auth.uid() OR 
        manager_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM pool_members 
            WHERE pool_id = investment_pools.id 
            AND user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Users can create pools" ON investment_pools
    FOR INSERT WITH CHECK (
        auth.uid() = created_by OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Pool managers can update pools" ON investment_pools
    FOR UPDATE USING (
        manager_id = auth.uid() OR
        created_by = auth.uid() OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Pool Members RLS Policies
CREATE POLICY "Users can view members of pools they're in" ON pool_members
    FOR SELECT USING (
        user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM investment_pools 
            WHERE id = pool_members.pool_id 
            AND (created_by = auth.uid() OR manager_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Pool managers can add members" ON pool_members
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM investment_pools 
            WHERE id = pool_members.pool_id 
            AND (created_by = auth.uid() OR manager_id = auth.uid())
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Pool Investments RLS Policies
CREATE POLICY "Users can view investments in their pools" ON pool_investments
    FOR SELECT USING (
        proposed_by = auth.uid() OR
        EXISTS (
            SELECT 1 FROM pool_members 
            WHERE pool_id = pool_investments.pool_id 
            AND user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Pool members can propose investments" ON pool_investments
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pool_members 
            WHERE pool_id = pool_investments.pool_id 
            AND user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Pool Votes RLS Policies
CREATE POLICY "Users can view votes in their pools" ON pool_votes
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM pool_members pm
            JOIN pool_investments pi ON pm.pool_id = pi.pool_id
            WHERE pi.id = pool_votes.investment_id 
            AND pm.user_id = auth.uid()
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

CREATE POLICY "Pool members can vote" ON pool_votes
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM pool_members pm
            JOIN pool_investments pi ON pm.pool_id = pi.pool_id
            WHERE pi.id = pool_votes.investment_id 
            AND pm.user_id = auth.uid()
            AND pm.id = pool_votes.member_id
        ) OR
        EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
    );

-- Triggers for Automatic Updates
-- =============================

-- Update escrow account balances on transaction
CREATE OR REPLACE FUNCTION update_escrow_balance()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF NEW.type = 'deposit' AND NEW.status = 'completed' THEN
            UPDATE escrow_accounts 
            SET available_balance = available_balance + NEW.amount,
                held_amount = held_amount - NEW.amount,
                status = CASE 
                    WHEN available_balance + NEW.amount > 0 THEN 'funded'
                    ELSE status
                END,
                updated_at = NOW()
            WHERE id = NEW.escrow_account_id;
        ELSIF NEW.type = 'release' AND NEW.status = 'completed' THEN
            UPDATE escrow_accounts 
            SET available_balance = available_balance - NEW.amount,
                status = CASE 
                    WHEN available_balance - NEW.amount <= 0 THEN 'released'
                    ELSE 'active'
                END,
                updated_at = NOW()
            WHERE id = NEW.escrow_account_id;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_escrow_balance
    AFTER INSERT ON escrow_transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_escrow_balance();

-- Update pool member count and totals
CREATE OR REPLACE FUNCTION update_pool_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE investment_pools 
        SET current_members = current_members + 1,
            total_committed = total_committed + NEW.committed_amount,
            updated_at = NOW()
        WHERE id = NEW.pool_id;
    ELSIF TG_OP = 'UPDATE' THEN
        UPDATE investment_pools 
        SET total_committed = total_committed - OLD.committed_amount + NEW.committed_amount,
            updated_at = NOW()
        WHERE id = NEW.pool_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pool_totals
    AFTER INSERT OR UPDATE ON pool_members
    FOR EACH ROW
    EXECUTE FUNCTION update_pool_totals();

-- Update pool investment totals
CREATE OR REPLACE FUNCTION update_pool_investment_totals()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'UPDATE' AND NEW.status = 'invested' AND OLD.status != 'invested' THEN
        UPDATE investment_pools 
        SET total_invested = total_invested + NEW.amount,
            updated_at = NOW()
        WHERE id = NEW.pool_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_pool_investment_totals
    AFTER UPDATE ON pool_investments
    FOR EACH ROW
    EXECUTE FUNCTION update_pool_investment_totals();

-- Auto-expire voting deadlines
CREATE OR REPLACE FUNCTION expire_voting_deadlines()
RETURNS void AS $$
BEGIN
    UPDATE pool_investments 
    SET status = CASE 
        WHEN (
            SELECT COUNT(*) FROM pool_votes 
            WHERE investment_id = pool_investments.id 
            AND vote_type = 'approve'
        ) > (
            SELECT COUNT(*) FROM pool_votes 
            WHERE investment_id = pool_investments.id 
            AND vote_type = 'reject'
        ) THEN 'approved'
        ELSE 'rejected'
    END
    WHERE status = 'voting' 
    AND voting_deadline < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create a scheduled job to run this function (requires pg_cron extension)
-- SELECT cron.schedule('expire-voting-deadlines', '*/15 * * * *', 'SELECT expire_voting_deadlines();');

-- Functions for Common Operations
-- ==============================

-- Function to calculate voting results
CREATE OR REPLACE FUNCTION calculate_voting_results(investment_id UUID)
RETURNS TABLE(
    total_votes INTEGER,
    approve_votes INTEGER,
    reject_votes INTEGER,
    abstain_votes INTEGER,
    approve_power INTEGER,
    reject_power INTEGER,
    result VARCHAR(20)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER as total_votes,
        COUNT(*) FILTER (WHERE pv.vote_type = 'approve')::INTEGER as approve_votes,
        COUNT(*) FILTER (WHERE pv.vote_type = 'reject')::INTEGER as reject_votes,
        COUNT(*) FILTER (WHERE pv.vote_type = 'abstain')::INTEGER as abstain_votes,
        COALESCE(SUM(pm.voting_power) FILTER (WHERE pv.vote_type = 'approve'), 0)::INTEGER as approve_power,
        COALESCE(SUM(pm.voting_power) FILTER (WHERE pv.vote_type = 'reject'), 0)::INTEGER as reject_power,
        CASE 
            WHEN COALESCE(SUM(pm.voting_power) FILTER (WHERE pv.vote_type = 'approve'), 0) > 
                 COALESCE(SUM(pm.voting_power) FILTER (WHERE pv.vote_type = 'reject'), 0) THEN 'approved'
            ELSE 'rejected'
        END::VARCHAR(20) as result
    FROM pool_votes pv
    JOIN pool_members pm ON pv.member_id = pm.id
    WHERE pv.investment_id = calculate_voting_results.investment_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get pool statistics
CREATE OR REPLACE FUNCTION get_pool_statistics(pool_id UUID)
RETURNS TABLE(
    total_members INTEGER,
    active_members INTEGER,
    total_committed DECIMAL(15,2),
    total_invested DECIMAL(15,2),
    total_distributed DECIMAL(15,2),
    investment_count INTEGER,
    active_investments INTEGER,
    distribution_count INTEGER,
    average_investment_size DECIMAL(15,2),
    fund_utilization DECIMAL(5,2)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        ip.current_members::INTEGER,
        COUNT(*) FILTER (WHERE pm.status = 'active')::INTEGER,
        ip.total_committed,
        ip.total_invested,
        ip.total_distributed,
        COUNT(pi.id)::INTEGER,
        COUNT(pi.id) FILTER (WHERE pi.status = 'invested')::INTEGER,
        COUNT(pd.id)::INTEGER,
        CASE 
            WHEN COUNT(pi.id) > 0 THEN AVG(pi.amount)
            ELSE 0
        END::DECIMAL(15,2),
        CASE 
            WHEN ip.total_committed > 0 THEN (ip.total_invested / ip.total_committed) * 100
            ELSE 0
        END::DECIMAL(5,2)
    FROM investment_pools ip
    LEFT JOIN pool_members pm ON ip.id = pm.pool_id
    LEFT JOIN pool_investments pi ON ip.id = pi.pool_id
    LEFT JOIN pool_distributions pd ON ip.id = pd.pool_id
    WHERE ip.id = get_pool_statistics.pool_id
    GROUP BY ip.id, ip.current_members, ip.total_committed, ip.total_invested, ip.total_distributed;
END;
$$ LANGUAGE plpgsql;

-- Function to get escrow statistics
CREATE OR REPLACE FUNCTION get_escrow_statistics(user_id UUID, user_role VARCHAR(20))
RETURNS TABLE(
    total_accounts INTEGER,
    active_accounts INTEGER,
    funded_accounts INTEGER,
    total_amount DECIMAL(15,2),
    available_balance DECIMAL(15,2),
    held_amount DECIMAL(15,2),
    disputed_accounts INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::INTEGER,
        COUNT(*) FILTER (WHERE status = 'active')::INTEGER,
        COUNT(*) FILTER (WHERE status = 'funded')::INTEGER,
        COALESCE(SUM(total_amount), 0)::DECIMAL(15,2),
        COALESCE(SUM(available_balance), 0)::DECIMAL(15,2),
        COALESCE(SUM(held_amount), 0)::DECIMAL(15,2),
        COUNT(*) FILTER (WHERE status = 'disputed')::INTEGER
    FROM escrow_accounts ea
    WHERE (user_role = 'investor' AND ea.investor_id = get_escrow_statistics.user_id)
       OR (user_role = 'entrepreneur' AND ea.entrepreneur_id = get_escrow_statistics.user_id);
END;
$$ LANGUAGE plpgsql; 