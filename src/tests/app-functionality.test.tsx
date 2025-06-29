
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../contexts/AuthContext';
import { PWAProvider } from '../contexts/PWAContext';
import App from '../App';
import React from 'react';

// Mock Supabase client
vi.mock('../integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    })),
    auth: {
      signIn: vi.fn(() => Promise.resolve({ data: null, error: null })),
      signOut: vi.fn(() => Promise.resolve({ data: null, error: null })),
      getSession: vi.fn(() => Promise.resolve({ data: null, error: null }))
    }
  }
}));

// Mock TensorFlow.js
vi.mock('@tensorflow/tfjs', () => ({
  loadLayersModel: vi.fn(() => Promise.resolve({ predict: vi.fn(() => [0.5]) })),
  tensor: vi.fn(() => ({ reshape: vi.fn(() => ({ arraySync: vi.fn(() => [0.5]) })) })),
  ready: vi.fn(() => Promise.resolve())
}));

const TestWrapper: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false }
    }
  });

  return (
    <QueryClientProvider client={queryClient}>
      <PWAProvider>
        <AuthProvider>
          <BrowserRouter>
            {children}
          </BrowserRouter>
        </AuthProvider>
      </PWAProvider>
    </QueryClientProvider>
  );
};

describe('App Functionality Tests', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('Landing Page', () => {
    it('should render the landing page with main content', () => {
      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Check for main title
      expect(getByText('Investment Portal')).toBeInTheDocument();
      
      // Check for main description
      expect(getByText(/Connect entrepreneurs, investors, and service providers/)).toBeInTheDocument();
      
      // Check for Get Started button
      expect(getByText('Get Started')).toBeInTheDocument();
    });

    it('should display feature cards', () => {
      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Check for user type cards
      expect(getByText('Entrepreneurs')).toBeInTheDocument();
      expect(getByText('Investors & Pools')).toBeInTheDocument();
      expect(getByText('Service Providers')).toBeInTheDocument();
      expect(getByText('Administrators')).toBeInTheDocument();
    });

    it('should display platform features', () => {
      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Check for platform features
      expect(getByText('Secure Escrow')).toBeInTheDocument();
      expect(getByText('Investment Pools')).toBeInTheDocument();
      expect(getByText('AI Insights')).toBeInTheDocument();
      expect(getByText('Smart Documents')).toBeInTheDocument();
      expect(getByText('Observer System')).toBeInTheDocument();
      expect(getByText('Analytics')).toBeInTheDocument();
    });
  });

  describe('Authentication', () => {
    it('should handle admin login', () => {
      // Mock admin user
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin'
      }));

      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to admin dashboard
      expect(getByText('Admin Panel')).toBeInTheDocument();
    });

    it('should handle entrepreneur login', () => {
      // Mock entrepreneur user
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        email: 'entrepreneur@test.com',
        name: 'Entrepreneur User',
        role: 'entrepreneur'
      }));

      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to entrepreneur dashboard
      expect(getByText('Entrepreneur Dashboard')).toBeInTheDocument();
    });

    it('should handle investor login', () => {
      // Mock investor user
      localStorage.setItem('user', JSON.stringify({
        id: '3',
        email: 'investor@test.com',
        name: 'Investor User',
        role: 'investor'
      }));

      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to investor dashboard
      expect(getByText('Investor Dashboard')).toBeInTheDocument();
    });

    it('should handle service provider login', () => {
      // Mock service provider user
      localStorage.setItem('user', JSON.stringify({
        id: '4',
        email: 'service@test.com',
        name: 'Service Provider',
        role: 'service_provider'
      }));

      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to service provider dashboard
      expect(getByText('Service Provider Dashboard')).toBeInTheDocument();
    });

    it('should handle pool member login', () => {
      // Mock pool user
      localStorage.setItem('user', JSON.stringify({
        id: '5',
        email: 'pool@test.com',
        name: 'Pool Member',
        role: 'pool'
      }));

      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to investor dashboard (pool members use investor dashboard)
      expect(getByText('Investor Dashboard')).toBeInTheDocument();
    });
  });

  describe('Dashboard Navigation', () => {
    beforeEach(() => {
      // Mock admin user for dashboard tests
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin'
      }));
    });

    it('should display admin sidebar navigation', () => {
      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Check for sidebar navigation items
      expect(getByText('Overview')).toBeInTheDocument();
      expect(getByText('User Management')).toBeInTheDocument();
      expect(getByText('Payment Management')).toBeInTheDocument();
      expect(getByText('Investment Pools')).toBeInTheDocument();
      expect(getByText('Escrow Accounts')).toBeInTheDocument();
      expect(getByText('Opportunities')).toBeInTheDocument();
      expect(getByText('Reports & Analytics')).toBeInTheDocument();
      expect(getByText('Templates')).toBeInTheDocument();
      expect(getByText('Documents')).toBeInTheDocument();
      expect(getByText('Observers')).toBeInTheDocument();
      expect(getByText('Platform Settings')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', () => {
      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Navigate to non-existent route
      window.history.pushState({}, '', '/non-existent-route');
      
      // Should show 404 page
      expect(getByText('404')).toBeInTheDocument();
    });

    it('should handle unauthorized access', () => {
      // Don't set any user in localStorage
      localStorage.clear();
      
      const { getByText } = render(<TestWrapper><App /></TestWrapper>);
      
      // Try to access admin route
      window.history.pushState({}, '', '/admin');
      
      // Should redirect to login
      expect(getByText('Sign In')).toBeInTheDocument();
    });
  });
});
