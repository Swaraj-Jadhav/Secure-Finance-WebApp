'use client'
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  username: string;
  isAuthenticated: boolean;
  loginTime: string;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (username: string) => void;
  logout: () => void;
  checkSession: () => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = () => {
      const savedUser = localStorage.getItem('secureBank_user');
      const sessionTime = localStorage.getItem('secureBank_sessionTime');
      
      if (savedUser && sessionTime) {
        const sessionEndTime = parseInt(sessionTime);
        const currentTime = Math.floor(Date.now() / 1000);
        
        if (currentTime < sessionEndTime) {
          // Session is still valid
          setUser({
            username: savedUser,
            isAuthenticated: true,
            loginTime: localStorage.getItem('secureBank_lastLogin') || new Date().toISOString()
          });
        } else {
          // Session expired
          localStorage.removeItem('secureBank_user');
          localStorage.removeItem('secureBank_sessionTime');
          localStorage.removeItem('secureBank_lastLogin');
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Check session validity
  const checkSession = (): boolean => {
    const sessionTime = localStorage.getItem('secureBank_sessionTime');
    if (!sessionTime) return false;
    
    const sessionEndTime = parseInt(sessionTime);
    const currentTime = Math.floor(Date.now() / 1000);
    
    return currentTime < sessionEndTime;
  };

  // Login function
  const login = (username: string) => {
    const loginTime = new Date().toISOString();
    const sessionEndTime = Math.floor(Date.now() / 1000) + 30 * 60; // 30 minutes
    
    localStorage.setItem('secureBank_user', username);
    localStorage.setItem('secureBank_lastLogin', loginTime);
    localStorage.setItem('secureBank_sessionTime', sessionEndTime.toString());
    
    setUser({
      username,
      isAuthenticated: true,
      loginTime
    });
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('secureBank_user');
    localStorage.removeItem('secureBank_sessionTime');
    localStorage.removeItem('secureBank_lastLogin');
    setUser(null);
    router.push('/login');
  };

  // Auto-logout when session expires
  useEffect(() => {
    if (!user) return;

    const checkSessionInterval = setInterval(() => {
      if (!checkSession()) {
        logout();
      }
    }, 1000); // Check every second

    return () => clearInterval(checkSessionInterval);
  }, [user]);

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    checkSession
  };

  return (
    <AuthContext.Provider value={value}>
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
