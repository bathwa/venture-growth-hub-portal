-- Investments Table Schema
-- This table tracks individual investments made by investors in opportunities

CREATE TABLE IF NOT EXISTS investments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    opportunity_id UUID NOT NULL REFERENCES opportunities(id) ON DELETE CASCADE,
    investor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
    equity_percentage DECIMAL(5,2) CHECK (equity_percentage >= 0 AND equity_percentage <= 100),
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed', 'cancelled')),
    payment_method VARCHAR(50),
    payment_reference VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approved_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_investments_opportunity ON investments(opportunity_id);
CREATE INDEX IF NOT EXISTS idx_investments_investor ON investments(investor_id);
CREATE INDEX IF NOT EXISTS idx_investments_status ON investments(status);
CREATE INDEX IF NOT EXISTS idx_investments_created_at ON investments(created_at);

-- Row Level Security
ALTER TABLE investments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own investments" ON investments
    FOR SELECT USING (auth.uid() = investor_id);

CREATE POLICY "Users can view investments in opportunities they own" ON investments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM opportunities 
            WHERE opportunities.id = investments.opportunity_id 
            AND opportunities.entrepreneur_id = auth.uid()
        )
    );

CREATE POLICY "Investors can create investments" ON investments
    FOR INSERT WITH CHECK (auth.uid() = investor_id);

CREATE POLICY "Investors can update their own investments" ON investments
    FOR UPDATE USING (auth.uid() = investor_id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_investments_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_investments_updated_at
    BEFORE UPDATE ON investments
    FOR EACH ROW
    EXECUTE FUNCTION update_investments_updated_at();

-- Insert some sample data for testing
INSERT INTO investments (opportunity_id, investor_id, amount, equity_percentage, status, payment_method)
VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440002', 50000.00, 5.0, 'completed', 'bank_transfer'),
    ('550e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440004', 25000.00, 2.5, 'approved', 'escrow'),
    ('550e8400-e29b-41d4-a716-446655440005', '550e8400-e29b-41d4-a716-446655440006', 100000.00, 10.0, 'pending', 'bank_transfer')
ON CONFLICT DO NOTHING; 