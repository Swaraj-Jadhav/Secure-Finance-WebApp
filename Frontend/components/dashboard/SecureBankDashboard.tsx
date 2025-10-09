'use client'
import React from 'react';
import Header from './Header';
import SecurityBar from './SecurityBar';
import PortfolioCard from './PortfolioCard';
import AccountsSection from './AccountsSection';
import TransactionsSection from './TransactionsSection';
import ExpensesCard from './ExpensesCard';
import Footer from './Footer';
import { transactions, expenses, savingsGoals } from '../data/mockData';

export default function SecureBankDashboard() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <SecurityBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Pass accounts to PortfolioCard for calculation */}
        <PortfolioCard accounts={[]} /> {/* We'll handle this differently - see below */}
        
        {/* Updated grid layout */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Left Column - Accounts */}
          <div className="lg:col-span-2 space-y-6">
            <AccountsSection />
          </div>
          
          {/* Right Column - Quick Actions & Insights */}
          <div className="lg:col-span-2 space-y-6">
            <ExpensesCard expenses={expenses} />
          </div>
          
          {/* Transactions Section - Full width */}
          <TransactionsSection transactions={transactions} />
        </div>
      </main>
      
      <Footer />
    </div>
  );
}