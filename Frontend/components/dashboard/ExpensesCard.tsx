import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Receipt, FileText } from 'lucide-react';

export default function ExpensesCard({ expenses }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Receipt className="w-5 h-5 text-green-600" />
          Monthly Expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {expenses.map((expense, idx) => (
          <div key={idx}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">{expense.category}</span>
              <span className="text-sm font-bold text-slate-900">${expense.amount.toFixed(2)}</span>
            </div>
            <Progress value={expense.percent} className="h-2" />
          </div>
        ))}
        <Button variant="link" className="w-full mt-2">
          <FileText className="w-4 h-4 mr-2" />
          View Detailed Report
        </Button>
      </CardContent>
    </Card>
  );
}