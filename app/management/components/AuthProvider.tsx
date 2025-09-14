'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ManagementUser {
  id: string;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
}

interface AuthContextType {
  user: ManagementUser | null;
  loading: boolean;
  login: (userData: ManagementUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ManagementUser | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      // First check if we have stored user data
      const storedUser = localStorage.getItem('managementUser');
      if (storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
        } catch (e) {
          localStorage.removeItem('managementUser');
        }
      }

      // Then verify with server
      const response = await fetch('/api/management/verify', {
        credentials: 'include' // Ensure cookies are sent
      });
      
      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
        localStorage.setItem('managementUser', JSON.stringify(data.user));
      } else {
        // Clear any stored user data if token is invalid
        localStorage.removeItem('managementUser');
        setUser(null);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('managementUser');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const login = (userData: ManagementUser) => {
    console.log('AuthProvider: Setting user data', userData);
    setUser(userData);
    localStorage.setItem('managementUser', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      await fetch('/api/management/logout', { method: 'POST' });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setUser(null);
      localStorage.removeItem('managementUser');
      router.push('/management/login');
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
