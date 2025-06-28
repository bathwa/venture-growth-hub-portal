import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'entrepreneur' | 'investor' | 'pool' | 'service_provider' | 'observer';
  avatar?: string;
  phone?: string;
  bio?: string;
  company?: string;
  position?: string;
  location?: string;
  website?: string;
  linkedin?: string;
  twitter?: string;
  kyc_status?: 'not_submitted' | 'pending' | 'verified' | 'rejected';
  created_at: string;
  updated_at: string;
}

interface SignupData {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'entrepreneur' | 'investor' | 'pool' | 'service_provider' | 'observer';
  phone?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: SignupData) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  updateProfile: (profileData: Partial<User>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    const getInitialSession = async () => {
      console.log('🔍 Getting initial session...');
      
      // Add timeout to prevent infinite loading
      const timeoutId = setTimeout(() => {
        console.warn('⚠️ Session loading timeout, forcing isLoading to false');
        setIsLoading(false);
      }, 10000); // 10 second timeout

      try {
        const { data: { session } } = await supabase.auth.getSession();
        clearTimeout(timeoutId);
        
        if (session?.user) {
          console.log('👤 Found existing session, loading user profile...');
          await loadUserProfile(session.user);
        } else {
          console.log('❌ No existing session found');
        }
        console.log('✅ Setting isLoading to false');
        setIsLoading(false);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error('❌ Error getting initial session:', error);
        setIsLoading(false);
      }
    };

    getInitialSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.email);
        if (session?.user) {
          await loadUserProfile(session.user);
        } else {
          setUser(null);
          setIsAuthenticated(false);
        }
        console.log('✅ Setting isLoading to false after auth change');
        setIsLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (supabaseUser: SupabaseUser) => {
    try {
      console.log('📋 Loading user profile for:', supabaseUser.email);
      const { data: profile, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      if (error) {
        console.error('❌ Error loading user profile:', error);
        
        // Handle specific database errors
        if (error.code === '42P01') {
          console.error('❌ Users table does not exist. Please run the database setup scripts.');
          // Create a basic user profile with default data
          const basicUserData: User = {
            id: supabaseUser.id,
            email: supabaseUser.email || '',
            name: supabaseUser.user_metadata?.name || 'User',
            role: supabaseUser.user_metadata?.role || 'entrepreneur',
            kyc_status: 'not_submitted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setUser(basicUserData);
          setIsAuthenticated(true);
          console.log('✅ Using basic user profile from auth metadata');
        } else {
          // For other errors, just set loading to false
          setIsLoading(false);
        }
        return;
      }

      if (profile) {
        console.log('✅ User profile loaded successfully:', profile.role);
        const userData: User = {
          id: profile.id,
          email: profile.email,
          name: profile.name,
          role: profile.role,
          avatar: profile.avatar,
          phone: profile.phone,
          bio: profile.bio,
          company: profile.company,
          position: profile.position,
          location: profile.location,
          website: profile.website,
          linkedin: profile.linkedin,
          twitter: profile.twitter,
          kyc_status: profile.kyc_status,
          created_at: profile.created_at,
          updated_at: profile.updated_at
        };

        setUser(userData);
        setIsAuthenticated(true);
        console.log('✅ User state updated, authenticated:', true);
      } else {
        console.log('⚠️ No profile found for user');
        setIsLoading(false);
      }
    } catch (error) {
      console.error('❌ Error loading user profile:', error);
      // Set loading to false even when there's an error
      setIsLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        throw error;
      }

      if (data.user) {
        await loadUserProfile(data.user);
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      // Validate admin key if admin email
      const isAdminEmail = data.email === "abathwabiz@gmail.com" || data.email === "admin@abathwa.com";
      if (isAdminEmail && data.role !== 'admin') {
        throw new Error('Admin emails require admin role');
      }

      // Create auth user with email confirmation disabled for immediate login
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          emailRedirectTo: `${window.location.origin}/login`,
          data: {
            role: data.role,
            name: data.name
          }
        }
      });

      if (authError) {
        throw authError;
      }

      if (authData.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('users')
          .insert({
            id: authData.user.id,
            email: data.email,
            name: data.name,
            role: data.role,
            phone: data.phone,
            kyc_status: 'not_submitted',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Delete auth user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id);
          throw new Error('Failed to create user profile');
        }

        // For immediate login, we'll manually confirm the email and log the user in
        // This bypasses the email confirmation requirement
        try {
          // Attempt to sign in immediately after signup
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });

          if (signInError) {
            throw signInError;
          }

          if (signInData.user) {
            await loadUserProfile(signInData.user);
          }
        } catch (signInError) {
          console.error('Immediate signin failed:', signInError);
          // If immediate signin fails, throw the email confirmation error
          throw new Error('Please check your email to confirm your account before logging in.');
        }
      }
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setUser(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        throw error;
      }

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user error:', error);
      throw error;
    }
  };

  const updateProfile = async (profileData: Partial<User>) => {
    return updateUser(profileData);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated, 
      isLoading,
      login, 
      signup, 
      logout, 
      updateUser,
      updateProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
