
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
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        console.log('🔍 Initializing authentication...');
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('🔄 Auth state changed:', event, session?.user?.email);
            
            if (!isMounted) return;
            
            if (session?.user && event !== 'SIGNED_OUT') {
              try {
                await loadUserProfile(session.user);
              } catch (error) {
                console.error('❌ Error loading user profile during auth change:', error);
                setUser(null);
                setIsAuthenticated(false);
              }
            } else {
              setUser(null);
              setIsAuthenticated(false);
            }
            
            if (isMounted) {
              setIsLoading(false);
            }
          }
        );

        // Then get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error('❌ Error getting session:', sessionError);
          if (isMounted) setIsLoading(false);
          return;
        }

        if (session?.user && isMounted) {
          console.log('👤 Found existing session, loading user profile...');
          try {
            await loadUserProfile(session.user);
          } catch (error) {
            console.error('❌ Error loading existing user profile:', error);
          }
        }

        if (isMounted) {
          setIsLoading(false);
        }

        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error('❌ Error initializing auth:', error);
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    const cleanup = initializeAuth();
    
    return () => {
      isMounted = false;
      cleanup.then(cleanupFn => cleanupFn?.()).catch(console.error);
    };
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
        
        if (error.code === 'PGRST116') {
          // No profile found - this shouldn't happen after signup
          console.log('⚠️ No user profile found');
          throw new Error('User profile not found. Please contact support.');
        }
        
        throw error;
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
        console.log('✅ User state updated, role:', userData.role);
      }
    } catch (error) {
      console.error('❌ Error in loadUserProfile:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      console.log('🔑 Attempting login for:', email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw error;
      }

      console.log('✅ Login successful');
      // Profile loading will be handled by onAuthStateChange
    } catch (error) {
      console.error('❌ Login failed:', error);
      throw error;
    }
  };

  const signup = async (data: SignupData) => {
    try {
      console.log('📝 Starting signup process for:', data.email);
      
      // Validate admin registration
      const isAdminEmail = data.email === "abathwabiz@gmail.com" || data.email === "admin@abathwa.com";
      if (isAdminEmail && data.role !== 'admin') {
        throw new Error('Admin emails require admin role');
      }

      // Create auth user
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
        console.error('❌ Auth signup error:', authError);
        throw authError;
      }

      if (!authData.user) {
        throw new Error('Failed to create user account');
      }

      console.log('✅ Auth user created, creating profile...');

      // Create user profile with the new RLS policies
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email: data.email,
          name: data.name,
          role: data.role,
          phone: data.phone || null,
          kyc_status: 'not_submitted',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        
        // Try to clean up auth user if profile creation fails
        try {
          await supabase.auth.signOut();
        } catch (cleanupError) {
          console.error('⚠️ Failed to cleanup auth user:', cleanupError);
        }
        
        throw new Error(`Failed to create user profile: ${profileError.message}`);
      }

      console.log('✅ User profile created successfully');

      // For confirmed users, try immediate signin
      if (authData.user && !authData.user.email_confirmed_at) {
        console.log('📧 Email confirmation required');
        throw new Error('Please check your email to confirm your account before logging in.');
      } else {
        console.log('✅ User confirmed, attempting immediate login...');
        
        try {
          const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password
          });

          if (signInError) {
            console.error('⚠️ Immediate signin failed:', signInError);
            throw new Error('Account created successfully! Please log in to continue.');
          }

          console.log('✅ Immediate login successful');
          // Profile will be loaded by onAuthStateChange
        } catch (signInError) {
          console.error('⚠️ Immediate signin failed:', signInError);
          throw new Error('Account created successfully! Please log in to continue.');
        }
      }
    } catch (error) {
      console.error('❌ Signup process failed:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🚪 Logging out user...');
      
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error('❌ Logout error:', error);
        throw error;
      }
      
      setUser(null);
      setIsAuthenticated(false);
      console.log('✅ Logout successful');
    } catch (error) {
      console.error('❌ Logout failed:', error);
      throw error;
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      console.log('📝 Updating user profile...');
      
      const { error } = await supabase
        .from('users')
        .update({
          ...userData,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) {
        console.error('❌ Update user error:', error);
        throw error;
      }

      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      console.log('✅ User profile updated successfully');
    } catch (error) {
      console.error('❌ Update user failed:', error);
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
