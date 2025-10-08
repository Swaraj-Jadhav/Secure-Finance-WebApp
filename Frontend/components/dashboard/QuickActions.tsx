import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Send, FileText, TrendingUp, PiggyBank, Zap } from 'lucide-react';

export default function QuickActions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-blue-600" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <Button className="w-full justify-start bg-blue-600 hover:bg-blue-700">
          <Send className="w-4 h-4 mr-2" />
          Send Money
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <FileText className="w-4 h-4 mr-2" />
          Pay Bills
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <TrendingUp className="w-4 h-4 mr-2" />
          Invest Funds
        </Button>
        <Button variant="outline" className="w-full justify-start">
          <PiggyBank className="w-4 h-4 mr-2" />
          Set Savings Goal
        </Button>
      </CardContent>
    </Card>
  );
}