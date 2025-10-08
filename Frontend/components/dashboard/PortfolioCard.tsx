import React from 'react';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TrendingUp } from 'lucide-react';

export default function PortfolioCard({ totalPortfolio }) {
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