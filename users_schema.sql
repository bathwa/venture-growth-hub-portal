-- Users Table Schema
-- This table stores user profiles and authentication data

CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'entrepreneur' CHECK (role IN ('admin', 'entrepreneur', 'investor', 'pool', 'service_provider', 'observer')),
    avatar VARCHAR(255),
    phone VARCHAR(20),
    bio TEXT,
    company VARCHAR(255),
    position VARCHAR(255),
    location VARCHAR(255),
    website VARCHAR(255),
    linkedin VARCHAR(255),
    twitter VARCHAR(255),
    kyc_status VARCHAR(20) DEFAULT 'not_submitted' CHECK (kyc_status IN ('not_submitted', 'pending', 'verified', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_kyc_status ON users(kyc_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view other users' basic info" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_users_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW
    EXECUTE FUNCTION update_users_updated_at();

-- Insert some sample data for testing
INSERT INTO users (id, email, name, role, phone, company, position, location, kyc_status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'entrepreneur@example.com', 'John Entrepreneur', 'entrepreneur', '+1234567890', 'TechCorp Inc.', 'CEO', 'San Francisco, CA', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440002', 'investor@example.com', 'Jane Investor', 'investor', '+1234567891', 'Investment Fund LLC', 'Partner', 'New York, NY', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440003', 'service@example.com', 'Bob Service', 'service_provider', '+1234567892', 'Legal Services Co.', 'Attorney', 'Los Angeles, CA', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440004', 'pool@example.com', 'Alice Pool', 'pool', '+1234567893', 'Investment Pool Ltd.', 'Manager', 'Chicago, IL', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440005', 'admin@example.com', 'Admin User', 'admin', '+1234567894', 'Platform Admin', 'Administrator', 'Remote', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440006', 'observer@example.com', 'Observer User', 'observer', '+1234567895', 'Compliance Team', 'Observer', 'Remote', 'verified')
ON CONFLICT (email) DO NOTHING; 