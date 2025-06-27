
import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'entrepreneur' | 'investor' | 'pool' | 'service_provider';
  avatar?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      const userData = JSON.parse(storedUser);
      setUser(userData);
      setIsAuthenticated(true);
    }
  }, []);

  const login = async (email: string, password: string) => {
    // Mock login - in real implementation, this would call your backend
    console.log('Login attempt:', email, password);
    
    // Mock user data based on email
    let mockUser: User;
    if (email.includes('admin')) {
      mockUser = { id: '1', email, name: 'Admin User', role: 'admin' };
    } else if (email.includes('entrepreneur')) {
      mockUser = { id: '2', email, name: 'Entrepreneur User', role: 'entrepreneur' };
    } else if (email.includes('investor')) {
      mockUser = { id: '3', email, name: 'Investor User', role: 'investor' };
    } else if (email.includes('service')) {
      mockUser = { id: '4', email, name: 'Service Provider', role: 'service_provider' };
    } else {
      mockUser = { id: '5', email, name: 'Pool Member', role: 'pool' };
    }
    
    setUser(mockUser);
    setIsAuthenticated(true);
    localStorage.setItem('user', JSON.stringify(mockUser));
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('user');
  };

  const updateUser = (userData: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...userData };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, logout, updateUser }}>
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
