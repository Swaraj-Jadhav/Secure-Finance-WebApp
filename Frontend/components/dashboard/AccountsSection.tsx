import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowUpDown, FileText, MoreHorizontal } from 'lucide-react';

export default function AccountsSection({ accounts }) {
  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-900 mb-4">Your Accounts</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {accounts.map((account) => (
          <Card key={account.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className={`w-12 h-12 ${account.color} rounded-xl flex items-center justify-center text-2xl mb-3`}>
                  {account.icon}
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-lg">{account.name}</CardTitle>
              <CardDescription>{account.number}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-slate-900">
                ${account.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              {account.id <= 2 && (
                <div className="mt-4 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1">
                    <ArrowUpDown className="w-4 h-4 mr-1" />
                    Transfer
                  </Button>
                  <Button variant="outline" size="sm" className="flex-1">
                    <FileText className="w-4 h-4 mr-1" />
                    Statement
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}