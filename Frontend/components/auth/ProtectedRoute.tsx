'use client'
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from './LoginPage';
import { useRouter } from 'next/navigation';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, isLoading, checkSession } = useAuth();
  const [sessionExpired, setSessionExpired] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && user) {
      // Check if session is still valid
      if (!checkSession()) {
        setSessionExpired(true);
      }
    }
  }, [isLoading, user, checkSession]);

  const handleLogin = (username: string) => {
    setSessionExpired(false);
    router.push('/');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading...</h2>
          <p className="text-slate-600">Please wait while we verify your session</p>
        </div>
      </div>
    );
  }

  if (!user || sessionExpired) {
    return <LoginPage onLogin={handleLogin} sessionExpired={sessionExpired} />;
  }

  return <>{children}</>;
}
