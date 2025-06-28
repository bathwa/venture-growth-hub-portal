import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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

describe('Comprehensive User Journey Tests', () => {
  beforeEach(() => {
    // Clear localStorage
    localStorage.clear();
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Landing Page & Authentication', () => {
    it('should display landing page with all sections', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      // Check for main sections
      expect(screen.getByText('Investment Portal')).toBeInTheDocument();
      expect(screen.getByText('Connect entrepreneurs, investors, and service providers')).toBeInTheDocument();
      
      // Check for feature cards
      expect(screen.getByText('Entrepreneurs')).toBeInTheDocument();
      expect(screen.getByText('Investors & Pools')).toBeInTheDocument();
      expect(screen.getByText('Service Providers')).toBeInTheDocument();
      expect(screen.getByText('Administrators')).toBeInTheDocument();
      
      // Check for platform features
      expect(screen.getByText('Secure Escrow')).toBeInTheDocument();
      expect(screen.getByText('Investment Pools')).toBeInTheDocument();
      expect(screen.getByText('AI Insights')).toBeInTheDocument();
      expect(screen.getByText('Smart Documents')).toBeInTheDocument();
      expect(screen.getByText('Observer System')).toBeInTheDocument();
      expect(screen.getByText('Analytics')).toBeInTheDocument();
    });

    it('should navigate to login page', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      const loginButton = screen.getByText('Get Started');
      fireEvent.click(loginButton);
      
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });

    it('should handle login for different user types', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      // Navigate to login
      fireEvent.click(screen.getByText('Get Started'));
      
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });

      // Test admin login
      const emailInput = screen.getByLabelText('Email');
      const passwordInput = screen.getByLabelText('Password');
      const signInButton = screen.getByText('Sign In');

      fireEvent.change(emailInput, { target: { value: 'admin@test.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(signInButton);

      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });
    });
  });

  describe('Admin Dashboard Functionality', () => {
    beforeEach(async () => {
      // Mock admin user
      localStorage.setItem('user', JSON.stringify({
        id: '1',
        email: 'admin@test.com',
        name: 'Admin User',
        role: 'admin'
      }));
    });

    it('should display admin dashboard with all sections', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });

      // Check for sidebar navigation
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

    it('should navigate to user management', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('User Management'));
      
      await waitFor(() => {
        expect(screen.getByText('User Management')).toBeInTheDocument();
      });
    });

    it('should navigate to payment management', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Payment Management'));
      
      await waitFor(() => {
        expect(screen.getByText('Payment Management')).toBeInTheDocument();
      });
    });

    it('should navigate to platform settings', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Admin Panel')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Platform Settings'));
      
      await waitFor(() => {
        expect(screen.getByText('Platform Settings')).toBeInTheDocument();
      });
    });
  });

  describe('Entrepreneur Dashboard Functionality', () => {
    beforeEach(async () => {
      // Mock entrepreneur user
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        email: 'entrepreneur@test.com',
        name: 'Entrepreneur User',
        role: 'entrepreneur'
      }));
    });

    it('should display entrepreneur dashboard', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Entrepreneur Dashboard')).toBeInTheDocument();
      });
    });

    it('should navigate to create opportunity', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Entrepreneur Dashboard')).toBeInTheDocument();
      });

      // Look for create opportunity button or navigation
      const createButton = screen.getByText(/Create Opportunity|New Opportunity/);
      fireEvent.click(createButton);
      
      await waitFor(() => {
        expect(screen.getByText(/Create Opportunity|New Opportunity/)).toBeInTheDocument();
      });
    });
  });

  describe('Investor Dashboard Functionality', () => {
    beforeEach(async () => {
      // Mock investor user
      localStorage.setItem('user', JSON.stringify({
        id: '3',
        email: 'investor@test.com',
        name: 'Investor User',
        role: 'investor'
      }));
    });

    it('should display investor dashboard', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
      });
    });

    it('should display investment opportunities', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Investor Dashboard')).toBeInTheDocument();
      });

      // Check for opportunities section
      expect(screen.getByText(/Opportunities|Browse Opportunities/)).toBeInTheDocument();
    });
  });

  describe('Service Provider Dashboard Functionality', () => {
    beforeEach(async () => {
      // Mock service provider user
      localStorage.setItem('user', JSON.stringify({
        id: '4',
        email: 'service@test.com',
        name: 'Service Provider',
        role: 'service_provider'
      }));
    });

    it('should display service provider dashboard', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Service Provider Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Pool Dashboard Functionality', () => {
    beforeEach(async () => {
      // Mock pool user
      localStorage.setItem('user', JSON.stringify({
        id: '5',
        email: 'pool@test.com',
        name: 'Pool Member',
        role: 'pool'
      }));
    });

    it('should display pool dashboard', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Pool Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Observer Dashboard Functionality', () => {
    beforeEach(async () => {
      // Mock observer user
      localStorage.setItem('user', JSON.stringify({
        id: '6',
        email: 'observer@test.com',
        name: 'Observer User',
        role: 'observer'
      }));
    });

    it('should display observer dashboard', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText('Observer Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle 404 routes', async () => {
      render(<TestWrapper><App /></TestWrapper>);
      
      // Navigate to non-existent route
      window.history.pushState({}, '', '/non-existent-route');
      
      await waitFor(() => {
        expect(screen.getByText(/404|Not Found/)).toBeInTheDocument();
      });
    });

    it('should handle unauthorized access', async () => {
      // Don't set any user in localStorage
      localStorage.clear();
      
      render(<TestWrapper><App /></TestWrapper>);
      
      // Try to access admin route
      window.history.pushState({}, '', '/admin');
      
      await waitFor(() => {
        expect(screen.getByText('Sign In')).toBeInTheDocument();
      });
    });

    it('should handle role-based access control', async () => {
      // Set user as entrepreneur but try to access admin route
      localStorage.setItem('user', JSON.stringify({
        id: '2',
        email: 'entrepreneur@test.com',
        name: 'Entrepreneur User',
        role: 'entrepreneur'
      }));
      
      render(<TestWrapper><App /></TestWrapper>);
      
      // Try to access admin route
      window.history.pushState({}, '', '/admin');
      
      await waitFor(() => {
        expect(screen.getByText('Entrepreneur Dashboard')).toBeInTheDocument();
      });
    });
  });

  describe('Responsive Design & Mobile Support', () => {
    it('should handle mobile viewport', async () => {
      // Mock mobile viewport
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        value: 375,
      });
      
      render(<TestWrapper><App /></TestWrapper>);
      
      // Trigger resize event
      fireEvent(window, new Event('resize'));
      
      await waitFor(() => {
        expect(screen.getByText('Investment Portal')).toBeInTheDocument();
      });
    });
  });

  describe('PWA Functionality', () => {
    it('should handle offline state', async () => {
      // Mock offline state
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
      
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText(/offline|Offline/)).toBeInTheDocument();
      });
    });

    it('should show install prompt when available', async () => {
      // Mock PWA install prompt
      Object.defineProperty(window, 'beforeinstallprompt', {
        writable: true,
        value: {
          prompt: vi.fn(),
          userChoice: Promise.resolve({ outcome: 'accepted' })
        },
      });
      
      render(<TestWrapper><App /></TestWrapper>);
      
      await waitFor(() => {
        expect(screen.getByText(/Install App|Install/)).toBeInTheDocument();
      });
    });
  });
}); 