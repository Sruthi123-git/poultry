import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { DEMO_USER } from '../db/seedData';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, pass: string, remember: boolean) => Promise<{ success: boolean; message?: string }>;
  logout: () => void;
  demoLogin: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('venkateshwara_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    // Auto-login demo user for immediate instant access if preferred or start with demo user
    return DEMO_USER;
  });

  const login = async (email: string, pass: string, remember: boolean) => {
    // Demo credentials: farmer@venkateshwara.com / farmer123
    // Also support user's name or simple admin logins
    if (
      (email.trim().toLowerCase() === 'farmer@venkateshwara.com' && pass === 'farmer123') ||
      (email.trim().toLowerCase() === 'admin' && pass === 'admin123') ||
      (email.trim().toLowerCase() === 'farmer' && pass === 'farmer')
    ) {
      const loggedUser: User = {
        ...DEMO_USER,
        email: email.includes('@') ? email : 'farmer@venkateshwara.com',
      };
      setUser(loggedUser);
      if (remember) {
        localStorage.setItem('venkateshwara_user', JSON.stringify(loggedUser));
      } else {
        sessionStorage.setItem('venkateshwara_user', JSON.stringify(loggedUser));
      }
      return { success: true };
    }

    return {
      success: false,
      message: 'Invalid email or password. Please use demo account: farmer@venkateshwara.com / farmer123',
    };
  };

  const demoLogin = () => {
    setUser(DEMO_USER);
    localStorage.setItem('venkateshwara_user', JSON.stringify(DEMO_USER));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('venkateshwara_user');
    sessionStorage.removeItem('venkateshwara_user');
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout, demoLogin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
