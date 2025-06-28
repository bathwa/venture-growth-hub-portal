# Quick Database Setup Guide

## The Issue
The app is showing a persistent spinner because the database tables haven't been created yet. The `users` table doesn't exist in your Supabase database.

## Quick Fix

### Option 1: Manual Setup (Recommended)
1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Navigate to your project
3. Go to the **SQL Editor** tab
4. Copy and paste the following SQL and run it:

```sql
-- Create users table
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

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own profile" ON users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can view other users' basic info" ON users
    FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" ON users
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON users
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Insert sample data
INSERT INTO users (id, email, name, role, phone, company, position, location, kyc_status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'entrepreneur@example.com', 'John Entrepreneur', 'entrepreneur', '+1234567890', 'TechCorp Inc.', 'CEO', 'San Francisco, CA', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440002', 'investor@example.com', 'Jane Investor', 'investor', '+1234567891', 'Investment Fund LLC', 'Partner', 'New York, NY', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440003', 'service@example.com', 'Bob Service', 'service_provider', '+1234567892', 'Legal Services Co.', 'Attorney', 'Los Angeles, CA', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440004', 'pool@example.com', 'Alice Pool', 'pool', '+1234567893', 'Investment Pool Ltd.', 'Manager', 'Chicago, IL', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440005', 'admin@example.com', 'Admin User', 'admin', '+1234567894', 'Platform Admin', 'Administrator', 'Remote', 'verified'),
    ('550e8400-e29b-41d4-a716-446655440006', 'observer@example.com', 'Observer User', 'observer', '+1234567895', 'Compliance Team', 'Observer', 'Remote', 'verified')
ON CONFLICT (email) DO NOTHING;
```

### Option 2: Run Schema Files
If you want to set up all tables (not just users), run the schema files in order:
1. `users_schema.sql`
2. `opportunities_schema.sql`
3. `investments_schema.sql`
4. `escrow_pool_schema.sql`

## After Setup
1. Refresh your app at http://localhost:8082
2. The spinner should disappear
3. You should see the landing page
4. Try signing up with a new account
5. Users should be redirected to their appropriate dashboards

## Test Accounts
After setup, you can test with these sample accounts:
- **Entrepreneur**: entrepreneur@example.com
- **Investor**: investor@example.com
- **Service Provider**: service@example.com
- **Pool**: pool@example.com
- **Admin**: admin@example.com
- **Observer**: observer@example.com

## Troubleshooting
If you still see the spinner:
1. Check the browser console for errors
2. Verify the users table was created in Supabase
3. Make sure RLS policies are applied
4. Try refreshing the page

The app now has fallback logic to handle missing tables, but it's better to have the proper database structure in place. 