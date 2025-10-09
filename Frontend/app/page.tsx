'use client'
import React from 'react';
import SecureBankDashboard from '@/components/dashboard/SecureBankDashboard';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function Home() {
  return (
    <ProtectedRoute>
      <SecureBankDashboard />
    </ProtectedRoute>
  );
}