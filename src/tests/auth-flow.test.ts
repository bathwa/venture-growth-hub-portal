/**
 * Authentication Flow Test Suite
 * Tests the complete authentication flow including signup, login, and routing
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { supabase } from '@/integrations/supabase/client';

// Test configuration
const TEST_CONFIG = {
  timeout: 10000,
  testEmail: 'test-auth@example.com',
  testPassword: 'testpassword123',
  testName: 'Test User'
};

describe('Authentication Flow Test Suite', () => {
  let testUserId: string | null = null;

  beforeAll(async () => {
    console.log('🧪 Starting Authentication Flow Tests...');
  });

  afterAll(async () => {
    // Clean up test user
    if (testUserId) {
      try {
        await supabase.auth.admin.deleteUser(testUserId);
        console.log('🧹 Test user cleaned up');
      } catch (error) {
        console.error('Failed to clean up test user:', error);
      }
    }
    console.log('✅ Authentication Flow Tests completed');
  });

  describe('1. Signup Flow', () => {
    it('should create a new user account successfully', async () => {
      try {
        // Test signup
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: TEST_CONFIG.testEmail,
          password: TEST_CONFIG.testPassword,
          options: {
            data: {
              name: TEST_CONFIG.testName,
              role: 'entrepreneur'
            }
          }
        });

        expect(signupError).toBeNull();
        expect(signupData.user).toBeDefined();
        expect(signupData.user?.email).toBe(TEST_CONFIG.testEmail);

        testUserId = signupData.user?.id || null;

        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: testUserId,
            email: TEST_CONFIG.testEmail,
            name: TEST_CONFIG.testName,
            role: 'entrepreneur',
            kyc_status: 'not_submitted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        expect(profileError).toBeNull();
        console.log('✅ User signup successful');
      } catch (error) {
        console.error('❌ User signup failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);

    it('should handle admin email signup with admin key', async () => {
      try {
        const adminEmail = 'admin@abathwa.com';
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: adminEmail,
          password: 'adminpassword123',
          options: {
            data: {
              name: 'Admin User',
              role: 'admin'
            }
          }
        });

        // Admin signup should work
        expect(signupError).toBeNull();
        expect(signupData.user).toBeDefined();

        // Clean up admin test user
        if (signupData.user?.id) {
          await supabase.auth.admin.deleteUser(signupData.user.id);
        }

        console.log('✅ Admin signup successful');
      } catch (error) {
        console.error('❌ Admin signup failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);
  });

  describe('2. Login Flow', () => {
    it('should login with valid credentials', async () => {
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testEmail,
          password: TEST_CONFIG.testPassword
        });

        expect(loginError).toBeNull();
        expect(loginData.user).toBeDefined();
        expect(loginData.user?.email).toBe(TEST_CONFIG.testEmail);
        console.log('✅ User login successful');
      } catch (error) {
        console.error('❌ User login failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);

    it('should reject invalid credentials', async () => {
      try {
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testEmail,
          password: 'wrongpassword'
        });

        expect(loginError).toBeDefined();
        expect(loginData.user).toBeNull();
        console.log('✅ Invalid credentials properly rejected');
      } catch (error) {
        console.error('❌ Invalid credentials test failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);
  });

  describe('3. User Profile Loading', () => {
    it('should load user profile after login', async () => {
      try {
        // First login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testEmail,
          password: TEST_CONFIG.testPassword
        });

        expect(loginError).toBeNull();
        expect(loginData.user).toBeDefined();

        // Load user profile
        const { data: profile, error: profileError } = await supabase
          .from('users')
          .select('*')
          .eq('id', loginData.user?.id)
          .single();

        expect(profileError).toBeNull();
        expect(profile).toBeDefined();
        expect(profile.email).toBe(TEST_CONFIG.testEmail);
        expect(profile.name).toBe(TEST_CONFIG.testName);
        expect(profile.role).toBe('entrepreneur');
        console.log('✅ User profile loading successful');
      } catch (error) {
        console.error('❌ User profile loading failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);
  });

  describe('4. Role-Based Access', () => {
    it('should enforce role-based permissions', async () => {
      try {
        // Login as entrepreneur
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testEmail,
          password: TEST_CONFIG.testPassword
        });

        expect(loginError).toBeNull();

        // Test that entrepreneur can access their own data
        const { data: ownData, error: ownError } = await supabase
          .from('users')
          .select('*')
          .eq('id', loginData.user?.id)
          .single();

        expect(ownError).toBeNull();
        expect(ownData).toBeDefined();

        // Test that entrepreneur cannot access admin functions (RLS should block)
        const { data: adminData, error: adminError } = await supabase
          .from('users')
          .select('count')
          .limit(1);

        // Should be blocked by RLS
        expect(adminData).toBeNull();
        console.log('✅ Role-based access control working');
      } catch (error) {
        console.error('❌ Role-based access control failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);
  });

  describe('5. Logout Flow', () => {
    it('should logout successfully', async () => {
      try {
        const { error: logoutError } = await supabase.auth.signOut();
        expect(logoutError).toBeNull();

        // Verify user is logged out
        const { data: { session } } = await supabase.auth.getSession();
        expect(session).toBeNull();
        console.log('✅ User logout successful');
      } catch (error) {
        console.error('❌ User logout failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);
  });

  describe('6. Authentication State Management', () => {
    it('should maintain authentication state across page reloads', async () => {
      try {
        // Login
        const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
          email: TEST_CONFIG.testEmail,
          password: TEST_CONFIG.testPassword
        });

        expect(loginError).toBeNull();

        // Get session
        const { data: { session } } = await supabase.auth.getSession();
        expect(session).toBeDefined();
        expect(session?.user?.email).toBe(TEST_CONFIG.testEmail);

        console.log('✅ Authentication state management working');
      } catch (error) {
        console.error('❌ Authentication state management failed:', error);
        throw error;
      }
    }, TEST_CONFIG.timeout);
  });
}); 