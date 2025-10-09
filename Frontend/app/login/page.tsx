'use client'
import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import LoginPage from '@/components/auth/LoginPage';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Login() {
  const { user, login } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleLogin = (username: string) => {
    login(username);
    router.push('/');
  };

  if (user) {
    return null; // Will redirect
  }

  return <LoginPage onLogin={handleLogin} sessionExpired={false} />;
}
