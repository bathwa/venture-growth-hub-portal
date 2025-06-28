import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
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
      render(<TestWrapper><App /></TestWrapper>);
      
      // Check for main title
      expect(screen.getByText('Investment Portal')).toBeInTheDocument();
      
      // Check for main description
      expect(screen.getByText(/Connect entrepreneurs, investors, and service providers/)).toBeInTheDocument();
      
      // Check for Get Started button
      expect(screen.getByText('Get Started')).toBeInTheDocument();
    });

    it('should display feature cards', () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      // Check for user type cards
      expect(screen.getByText('Entrepreneurs')).toBeInTheDocument();
      expect(screen.getByText('Investors & Pools')).toBeInTheDocument();
      expect(screen.getByText('Service Providers')).toBeInTheDocument();
      expect(screen.getByText('Administrators')).toBeInTheDocument();
    });

    it('should display platform features', () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      // Check for platform features
      expect(screen.getByText('Secure Escrow')).toBeInTheDocument();
      expect(screen.getByText('Investment Pools')).toBeInTheDocument();
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('Smart Documents')).toBeInTheDocument();
      expect(screen.getByText('Observer System')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
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

      render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to admin dashboard
      expect(screen.getByText('Admin Panel')).toBeInTheDocument();
    });

    it('should handle entrepreneur login', () => {
      // Mock entrepreneur user
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        email: 'entrepreneur@test.com',
        name: 'Entrepreneur User',
        role: 'entrepreneur'
      }));

      render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to entrepreneur dashboard
      expect(screen.getByText('Entrepreneur Dashboard')).toBeInTheDocument();
    });

    it('should handle investor login', () => {
      // Mock investor user
      localStorage.setItem('user', JSON.stringify({
        id: '3',
        email: 'investor@test.com',
        name: 'Investor User',
        role: 'investor'
      }));

      render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to investor dashboard
      expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
    });

    it('should handle service provider login', () => {
      // Mock service provider user
      localStorage.setItem('user', JSON.stringify({
        id: '4',
        email: 'service@test.com',
        name: 'Service Provider',
        role: 'service_provider'
      }));

      render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to service provider dashboard
      expect(screen.getByText('Service Provider Dashboard')).toBeInTheDocument();
    });

    it('should handle pool member login', () => {
      // Mock pool user
      localStorage.setItem('user', JSON.stringify({
        id: '5',
        email: 'pool@test.com',
        name: 'Pool Member',
        role: 'pool'
      }));

      render(<TestWrapper><App /></TestWrapper>);
      
      // Should redirect to investor dashboard (pool members use investor dashboard)
      expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
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
      render(<TestWrapper><App /></TestWrapper>);
      
      // Check for sidebar navigation items
      expect(screen.getByText('Overview')).toBeInTheDocument();
      expect(screen.getByText('User Management')).toBeInTheDocument();
      expect(screen.getByText('Payment Management')).toBeInTheDocument();
      expect(screen.getByText('Investment Pools')).toBeInTheDocument();
      expect(screen.getByText('Escrow Accounts')).toBeInTheDocument();
      expect(screen.getByText('Opportunities')).toBeInTheDocument();
      expect(screen.getByText('Reports & Analytics')).toBeInTheDocument();
      expect(screen.getByText('Templates')).toBeInTheDocument();
      expect(screen.getByText('Documents')).toBeInTheDocument();
      expect(screen.getByText('Observers')).toBeInTheDocument();
      expect(screen.getByText('Platform Settings')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should handle 404 routes', () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      // Navigate to non-existent route
      window.history.pushState({}, '', '/non-existent-route');
      
      // Should show 404 page
      expect(screen.getByText('404')).toBeInTheDocument();
    });

    it('should handle unauthorized access', () => {
      // Don't set any user in localStorage
      localStorage.clear();
      
      render(<TestWrapper><App /></TestWrapper>);
      
      // Try to access admin route
      window.history.pushState({}, '', '/admin');
      
      // Should redirect to login
      expect(screen.getByText('Sign In')).toBeInTheDocument();
    });
  });
}); 