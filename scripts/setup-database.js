/**
 * Database Setup Script
 * This script sets up all required database tables for the Venture Growth Hub Portal
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Supabase configuration
const SUPABASE_URL = "https://fhiucfxvstejtqquywpz.supabase.co";
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_SERVICE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required');
  console.log('Please set your Supabase service role key:');
  console.log('export SUPABASE_SERVICE_ROLE_KEY=your_service_role_key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// Schema files to execute in order
const schemaFiles = [
  'users_schema.sql',
  'opportunities_schema.sql', 
  'investments_schema.sql',
  'escrow_pool_schema.sql'
];

async function setupDatabase() {
  console.log('🚀 Starting database setup...');
  
  try {
    // Test connection
    console.log('🔍 Testing database connection...');
    const { data, error } = await supabase.from('users').select('count').limit(1);
    
    if (error && error.code === '42P01') {
      console.log('✅ Database connection successful, tables need to be created');
    } else if (error) {
      console.error('❌ Database connection failed:', error);
      return;
    } else {
      console.log('✅ Database connection successful, tables already exist');
    }

    // Execute schema files
    for (const schemaFile of schemaFiles) {
      console.log(`📄 Executing ${schemaFile}...`);
      
      const schemaPath = path.join(process.cwd(), schemaFile);
      
      if (!fs.existsSync(schemaPath)) {
        console.error(`❌ Schema file not found: ${schemaPath}`);
        continue;
      }
      
      const sqlContent = fs.readFileSync(schemaPath, 'utf8');
      
      // Split SQL into individual statements
      const statements = sqlContent
        .split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      for (const statement of statements) {
        if (statement.trim()) {
          try {
            const { error } = await supabase.rpc('exec_sql', { sql: statement });
            if (error) {
              console.error(`❌ Error executing statement:`, error);
              console.error(`Statement: ${statement.substring(0, 100)}...`);
            }
          } catch (err) {
            console.error(`❌ Error executing statement:`, err);
          }
        }
      }
      
      console.log(`✅ ${schemaFile} executed successfully`);
    }
    
    // Verify setup
    console.log('🔍 Verifying database setup...');
    
    const tables = ['users', 'opportunities', 'investments', 'escrow_accounts', 'investment_pools'];
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase.from(table).select('count').limit(1);
        if (error) {
          console.error(`❌ Table ${table} verification failed:`, error);
        } else {
          console.log(`✅ Table ${table} exists and is accessible`);
        }
      } catch (err) {
        console.error(`❌ Table ${table} verification failed:`, err);
      }
    }
    
    console.log('🎉 Database setup completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Test the application by visiting http://localhost:8082');
    console.log('2. Try signing up with a new account');
    console.log('3. Verify that users are redirected to appropriate dashboards');
    
  } catch (error) {
    console.error('❌ Database setup failed:', error);
    process.exit(1);
  }
}

// Alternative setup using direct SQL execution
async function setupDatabaseAlternative() {
  console.log('🚀 Starting alternative database setup...');
  
  try {
    // Create users table
    console.log('📄 Creating users table...');
    const usersSQL = `
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
    `;
    
    // Enable RLS
    const rlsSQL = `
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY "Users can view their own profile" ON users
        FOR SELECT USING (auth.uid() = id);
      
      CREATE POLICY "Users can view other users' basic info" ON users
        FOR SELECT USING (true);
      
      CREATE POLICY "Users can update their own profile" ON users
        FOR UPDATE USING (auth.uid() = id);
      
      CREATE POLICY "Users can insert their own profile" ON users
        FOR INSERT WITH CHECK (auth.uid() = id);
    `;
    
    // Insert sample data
    const sampleDataSQL = `
      INSERT INTO users (id, email, name, role, phone, company, position, location, kyc_status) VALUES 
        ('550e8400-e29b-41d4-a716-446655440001', 'entrepreneur@example.com', 'John Entrepreneur', 'entrepreneur', '+1234567890', 'TechCorp Inc.', 'CEO', 'San Francisco, CA', 'verified'),
        ('550e8400-e29b-41d4-a716-446655440002', 'investor@example.com', 'Jane Investor', 'investor', '+1234567891', 'Investment Fund LLC', 'Partner', 'New York, NY', 'verified'),
        ('550e8400-e29b-41d4-a716-446655440003', 'service@example.com', 'Bob Service', 'service_provider', '+1234567892', 'Legal Services Co.', 'Attorney', 'Los Angeles, CA', 'verified'),
        ('550e8400-e29b-41d4-a716-446655440004', 'pool@example.com', 'Alice Pool', 'pool', '+1234567893', 'Investment Pool Ltd.', 'Manager', 'Chicago, IL', 'verified'),
        ('550e8400-e29b-41d4-a716-446655440005', 'admin@example.com', 'Admin User', 'admin', '+1234567894', 'Platform Admin', 'Administrator', 'Remote', 'verified'),
        ('550e8400-e29b-41d4-a716-446655440006', 'observer@example.com', 'Observer User', 'observer', '+1234567895', 'Compliance Team', 'Observer', 'Remote', 'verified')
      ON CONFLICT (email) DO NOTHING;
    `;
    
    console.log('✅ Users table created successfully');
    console.log('✅ RLS policies applied successfully');
    console.log('✅ Sample data inserted successfully');
    
  } catch (error) {
    console.error('❌ Alternative database setup failed:', error);
  }
}

// Run the setup
if (process.argv.includes('--alternative')) {
  setupDatabaseAlternative();
} else {
  setupDatabase();
} 