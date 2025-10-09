import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

interface Account {
  id: number;
  name: string;
  number: string;
  balance: number;
  icon: string;
  color: string;
  type: 'primary' | 'virtual';
  category?: string;
  createdAt?: string;
}

interface PortfolioCardProps {
  accounts: Account[];
}

export default function PortfolioCard({ accounts }: PortfolioCardProps) {
  // Calculate total portfolio value from all accounts (primary + virtual)
  const totalPortfolio = accounts.reduce((sum, account) => sum + account.balance, 0);
  
  // Calculate total from primary account only
  const primaryAccountTotal = accounts
    .filter(account => account.type === 'primary')
    .reduce((sum, account) => sum + account.balance, 0);
  
  // Calculate total from virtual accounts only
  const virtualAccountsTotal = accounts
    .filter(account => account.type === 'virtual')
    .reduce((sum, account) => sum + account.balance, 0);

  return (
    <Card className="mb-8 bg-gradient-to-br from-blue-600 to-purple-600 border-0 text-white overflow-hidden relative">
      <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mr-32 -mt-32"></div>
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-white opacity-5 rounded-full -ml-24 -mb-24"></div>
      <CardHeader className="relative z-10">
        <CardTitle className="text-white text-lg font-medium opacity-90">
          Total Portfolio Value
        </CardTitle>
        <div className="mt-2">
          <div className="text-5xl font-bold">
            ${totalPortfolio.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          
          {/* Breakdown of funds */}
          <div className="flex items-center gap-6 mt-4 text-white/80 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
              <span>Primary: ${primaryAccountTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-400 rounded-full"></div>
              <span>Virtual: ${virtualAccountsTotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4">
            <div className="flex items-center gap-2 text-white">
              <TrendingUp className="w-5 h-5" />
              <span className="text-lg">+2.5% this month</span>
            </div>
            <Button variant="ghost" className="text-white hover:bg-white/20">
              <TrendingUp className="w-4 h-4 mr-2" />
              View detailed analytics
            </Button>
          </div>
        </div>
      </CardHeader>
    </Card>
  );
}