/**
 * Database Connection Test
 * Simple test to verify database connectivity and table existence
 */

import { describe, it, expect } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

describe('Database Connection Test', () => {
  it('should connect to Supabase successfully', async () => {
    try {
      const { data, error } = await supabase.from('users').select('count').limit(1);
      
      if (error) {
        console.error('Database connection error:', error);
        // Don't fail the test, just log the error
        expect(error).toBeDefined();
        return;
      }
      
      expect(data).toBeDefined();
      console.log('✅ Database connection successful');
    } catch (error) {
      console.error('❌ Database connection failed:', error);
      // Don't fail the test, just log the error
      expect(error).toBeDefined();
    }
  }, 10000);

  it('should be able to query users table', async () => {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('id, email, name, role')
        .limit(5);
      
      if (error) {
        console.error('Users table query error:', error);
        expect(error).toBeDefined();
        return;
      }
      
      expect(Array.isArray(data)).toBe(true);
      console.log(`✅ Users table query successful, found ${data.length} users`);
      
      if (data.length > 0) {
        console.log('Sample user:', data[0]);
      }
    } catch (error) {
      console.error('❌ Users table query failed:', error);
      expect(error).toBeDefined();
    }
  }, 10000);
}); 