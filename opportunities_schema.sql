-- Opportunities Table Schema
-- This table tracks investment opportunities created by entrepreneurs

CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    entrepreneur_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(255) NOT NULL,
    target_amount DECIMAL(15,2) NOT NULL CHECK (target_amount > 0),
    equity_offered DECIMAL(5,2) NOT NULL CHECK (equity_offered > 0 AND equity_offered <= 100),
    min_investment DECIMAL(15,2) NOT NULL CHECK (min_investment > 0),
    funding_type VARCHAR(50) NOT NULL DEFAULT 'equity' CHECK (funding_type IN ('equity', 'debt', 'convertible_note', 'revenue_sharing')),
    business_stage VARCHAR(50) NOT NULL DEFAULT 'startup' CHECK (business_stage IN ('idea', 'startup', 'growth', 'established', 'expansion')),
    expected_return DECIMAL(5,2) CHECK (expected_return >= 0),
    timeline INTEGER CHECK (timeline > 0), -- in months
    use_of_funds TEXT,
    team_size INTEGER CHECK (team_size > 0),
    founded_year INTEGER CHECK (founded_year >= 1900 AND founded_year <= EXTRACT(YEAR FROM NOW())),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    pitch_deck_url VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'published', 'funded', 'closed', 'cancelled')),
    views INTEGER DEFAULT 0,
    interested_investors INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    published_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_opportunities_entrepreneur ON opportunities(entrepreneur_id);
CREATE INDEX IF NOT EXISTS idx_opportunities_status ON opportunities(status);
CREATE INDEX IF NOT EXISTS idx_opportunities_industry ON opportunities(industry);
CREATE INDEX IF NOT EXISTS idx_opportunities_location ON opportunities(location);
CREATE INDEX IF NOT EXISTS idx_opportunities_created_at ON opportunities(created_at);
CREATE INDEX IF NOT EXISTS idx_opportunities_target_amount ON opportunities(target_amount);

-- Row Level Security
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view published opportunities" ON opportunities
    FOR SELECT USING (status = 'published');

CREATE POLICY "Users can view their own opportunities" ON opportunities
    FOR SELECT USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Entrepreneurs can create opportunities" ON opportunities
    FOR INSERT WITH CHECK (auth.uid() = entrepreneur_id);

CREATE POLICY "Entrepreneurs can update their own opportunities" ON opportunities
    FOR UPDATE USING (auth.uid() = entrepreneur_id);

CREATE POLICY "Entrepreneurs can delete their own opportunities" ON opportunities
    FOR DELETE USING (auth.uid() = entrepreneur_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_opportunities_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_opportunities_updated_at
    BEFORE UPDATE ON opportunities
    FOR EACH ROW
    EXECUTE FUNCTION update_opportunities_updated_at();

-- Insert some sample data for testing
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
    ('550e8400-e29b-41d4-a716-446655440002', 'Healthcare Innovation', 'Digital health platform for patient monitoring', 'healthcare', 'Boston, MA', 300000.00, 10.0, 5000.00, 'equity', 'startup', 20.0, 18, 'Clinical trials and FDA approval', 5, 2021, 'https://healthtech.com', 'published', 89, 7),
    ('550e8400-e29b-41d4-a716-446655440003', 'Green Energy Solutions', 'Renewable energy technology for homes', 'energy', 'Austin, TX', 750000.00, 20.0, 25000.00, 'equity', 'established', 30.0, 24, 'Manufacturing scale-up and distribution', 12, 2019, 'https://greenenergy.com', 'published', 234, 18)
ON CONFLICT DO NOTHING; 