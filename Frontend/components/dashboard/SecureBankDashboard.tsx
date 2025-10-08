'use client'
import React from 'react';
import Header from './Header';
import SecurityBar from './SecurityBar';
import PortfolioCard from './PortfolioCard';
import AccountsSection from './AccountsSection';
import TransactionsSection from './TransactionsSection';
import QuickActions from './QuickActions';
import ExpensesCard from './ExpensesCard';
import SavingsGoals from './SavingsGoals';
import Footer from './Footer';
import { accounts, transactions, expenses, savingsGoals } from '../data/mockData';

export default function SecureBankDashboard() {
  const totalPortfolio = accounts.reduce((sum, acc) => sum + acc.balance, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Header />
      <SecurityBar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <PortfolioCard totalPortfolio={totalPortfolio} />
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <AccountsSection accounts={accounts} />
            <TransactionsSection transactions={transactions} />
          </div>
          
          <div className="space-y-6">
            <QuickActions />
            <ExpensesCard expenses={expenses} />
            <SavingsGoals savingsGoals={savingsGoals} />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}